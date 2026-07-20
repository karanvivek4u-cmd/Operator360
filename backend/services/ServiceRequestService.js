const { supabaseAdmin } = require("../utils/supabase");
const NotificationService = require("./NotificationService");
const AuditLogService = require("./AuditLogService");
const JWTUtils = require("../utils/JWTUtils");

class ServiceRequestService {
  static async _getRequestDetails(requestId) {
    const { data, error } = await supabaseAdmin
      .from("service_requests")
      .select(`
        *,
        customers ( company_name, email ),
        machines ( serial_number, model_number ),
        old_operator:operators!old_operator_id ( first_name, last_name, email ),
        new_operator:operators!new_operator_id ( first_name, last_name, email )
      `)
      .eq("request_id", requestId)
      .single();
    if (error) throw new Error(`Failed to fetch request details: ${error.message}`);
    return data;
  }

  static async create(data, actorUserId) {
    const { request_type, customer_id, machine_id, old_operator_id, new_operator_id, requested_by, customer_comments, insurance_status, admin_status, overall_status } = data;
    
    // Generate request number
    const request_number = `SR-${Date.now().toString(36).toUpperCase().slice(-5)}`;

    const { data: request, error } = await supabaseAdmin.from("service_requests").insert({
      request_number,
      request_type,
      customer_id,
      machine_id,
      old_operator_id: old_operator_id || null,
      new_operator_id: new_operator_id || null,
      requested_by,
      customer_comments: customer_comments || null,
      insurance_status: insurance_status || "PENDING",
      admin_status: admin_status || "PENDING",
      overall_status: overall_status || "PENDING"
    }).select().single();

    if (error) throw new Error(`Failed to create service request: ${error.message}`);

    await AuditLogService.log("CREATE_SERVICE_REQUEST", actorUserId, "SERVICE_REQUEST", request.request_id);

    // Fetch details for email
    const details = await this._getRequestDetails(request.request_id);
    const insuranceEmail = process.env.INSURANCE_TEAM_EMAIL;

    // Generate approval tokens for Insurance
    const approveToken = JWTUtils.generateApprovalToken(request.request_id, "APPROVE", "INSURANCE");
    const rejectToken = JWTUtils.generateApprovalToken(request.request_id, "REJECT", "INSURANCE");

    // Notify Insurance
    if (!insuranceEmail) {
      console.error("[ServiceRequestService] INSURANCE_TEAM_EMAIL not configured - insurance notification skipped");
    } else {
      const success = await NotificationService.notify("service_request_created", insuranceEmail, {
        request_number: details.request_number,
        request_type: details.request_type,
        customer: details.customers?.company_name || "Unknown",
        machine: details.machines?.serial_number || "Unknown",
        old_operator: details.old_operator ? `${details.old_operator.first_name} ${details.old_operator.last_name || ""}` : "None",
        new_operator: details.new_operator ? `${details.new_operator.first_name} ${details.new_operator.last_name || ""}` : "None",
        comments: details.customer_comments || "No comments provided",
        login_url: process.env.ALLOWED_ORIGIN || "https://operator-360-phi.vercel.app",
        approve_url: `http://localhost:4000/api/approvals/approve?token=${approveToken}`,
        reject_url: `http://localhost:4000/api/approvals/reject?token=${rejectToken}`
      });
      if (!success) console.error("[ServiceRequestService] Failed to send service_request_created notification.");
    }

    return request;
  }

  static async approveInsurance(id, actorUserId) {
    const { data: request, error } = await supabaseAdmin
      .from("service_requests")
      .update({ insurance_status: "APPROVED" })
      .eq("request_id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve insurance: ${error.message}`);

    await AuditLogService.log("APPROVE_INSURANCE", actorUserId, "SERVICE_REQUEST", id);

    const details = await this._getRequestDetails(id);
    
    // Generate approval tokens for Admin (Next Step in workflow)
    const approveToken = JWTUtils.generateApprovalToken(id, "APPROVE", "ADMIN");
    const rejectToken = JWTUtils.generateApprovalToken(id, "REJECT", "ADMIN");

    // Notify Customer
    if (details.customers?.email) {
      await NotificationService.notify("insurance_approved", details.customers.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    // Notify Admin team queue (so they can approve from email)
    const adminEmail = process.env.ADMIN_TEAM_EMAIL;
    if (!adminEmail) {
      console.error("[ServiceRequestService] ADMIN_TEAM_EMAIL not configured - admin notification skipped");
    } else {
      const success = await NotificationService.notify("insurance_approved_admin_action", adminEmail, {
        request_number: details.request_number,
        request_type: details.request_type,
        customer: details.customers?.company_name || "Unknown",
        machine: details.machines?.serial_number || "Unknown",
        old_operator: details.old_operator ? `${details.old_operator.first_name} ${details.old_operator.last_name || ""}` : "None",
        new_operator: details.new_operator ? `${details.new_operator.first_name} ${details.new_operator.last_name || ""}` : "None",
        comments: details.customer_comments || "No comments provided",
        login_url: process.env.ALLOWED_ORIGIN || "https://operator-360-phi.vercel.app",
        approve_url: `http://localhost:4000/api/approvals/approve?token=${approveToken}`,
        reject_url: `http://localhost:4000/api/approvals/reject?token=${rejectToken}`
      });
      if (!success) console.error("[ServiceRequestService] Failed to send insurance_approved_admin_action notification.");
    }

    return request;
  }

  static async rejectInsurance(id, actorUserId) {
    const { data: request, error } = await supabaseAdmin
      .from("service_requests")
      .update({ insurance_status: "REJECTED", overall_status: "REJECTED" }) // Auto reject overall
      .eq("request_id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to reject insurance: ${error.message}`);

    await AuditLogService.log("REJECT_INSURANCE", actorUserId, "SERVICE_REQUEST", id);

    const details = await this._getRequestDetails(id);
    
    // Notify Customer
    if (details.customers?.email) {
      await NotificationService.notify("insurance_rejected", details.customers.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    return request;
  }

  static async approveAdmin(id, actorUserId) {
    const { data: request, error } = await supabaseAdmin
      .from("service_requests")
      .update({ admin_status: "APPROVED", overall_status: "APPROVED" }) // Mark as fully approved
      .eq("request_id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve admin: ${error.message}`);

    await AuditLogService.log("APPROVE_ADMIN", actorUserId, "SERVICE_REQUEST", id);

    const details = await this._getRequestDetails(id);

    // Apply the actual operator assignment change if it's an operator replacement
    if (details.request_type === "OPERATOR_REPLACEMENT" && details.machine_id && details.new_operator_id) {
      // 1. Mark old operator assignment as inactive
      if (details.old_operator_id) {
        await supabaseAdmin
          .from("operator_assignments")
          .update({ 
            status: "ENDED", 
            assignment_end_date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
          })
          .eq("machine_id", details.machine_id)
          .eq("operator_id", details.old_operator_id)
          .eq("status", "ACTIVE");
      }

      // 2. Create new operator assignment
      await supabaseAdmin
        .from("operator_assignments")
        .insert({
          machine_id: details.machine_id,
          operator_id: details.new_operator_id,
          assignment_start_date: new Date().toISOString().split('T')[0],
          status: "ACTIVE",
          assignment_reason: `Replaced via Service Request ${details.request_number}`
        });
    }
    
    // Notify Customer & Operator
    if (details.customers?.email) {
      await NotificationService.notify("admin_approved", details.customers.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    if (details.new_operator?.email) {
      await NotificationService.notify("operator_assigned", details.new_operator.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    return request;
  }

  static async rejectAdmin(id, actorUserId) {
    const { data: request, error } = await supabaseAdmin
      .from("service_requests")
      .update({ admin_status: "REJECTED", overall_status: "REJECTED" })
      .eq("request_id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to reject admin: ${error.message}`);

    await AuditLogService.log("REJECT_ADMIN", actorUserId, "SERVICE_REQUEST", id);

    const details = await this._getRequestDetails(id);
    
    // Notify Customer
    if (details.customers?.email) {
      await NotificationService.notify("admin_rejected", details.customers.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    return request;
  }

  static async complete(id, actorUserId) {
    const { data: request, error } = await supabaseAdmin
      .from("service_requests")
      .update({ overall_status: "APPROVED" }) // Use APPROVED as there is no COMPLETED enum value
      .eq("request_id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete request: ${error.message}`);

    await AuditLogService.log("COMPLETE_REQUEST", actorUserId, "SERVICE_REQUEST", id);

    const details = await this._getRequestDetails(id);
    
    // Notify Customer
    if (details.customers?.email) {
      await NotificationService.notify("request_completed", details.customers.email, {
        request_number: details.request_number,
        machine: details.machines?.serial_number
      });
    }

    return request;
  }
}

module.exports = ServiceRequestService;
