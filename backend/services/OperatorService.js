const { supabaseAdmin } = require("../utils/supabase");
const NotificationService = require("./NotificationService");
const AuditLogService = require("./AuditLogService");

class OperatorService {
  /**
   * Creates a single operator, auth user, and sends welcome email
   */
  static async createOperator(operatorData, actorUserId) {
    let createdAuthUserId = null;
    try {
      const { customer_id, first_name, last_name, email, mobile, aadhaar_number, dob, gender, joining_date, address, emergency_contact, status } = operatorData;
      
      let operatorCode = operatorData.operator_code;
      if (!operatorCode) {
        operatorCode = `OP-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      }

      let authUserId = null;
      let password = null;

      if (email) {
        password = `${email.split('@')[0]}@123`;
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role: "OPERATOR",
            full_name: `${first_name} ${last_name || ''}`.trim()
          }
        });

        if (authErr && !authErr.message.includes('already registered')) {
          throw new Error(`Failed to create Auth User: ${authErr.message}`);
        }
        
        if (authErr && authErr.message.includes('already registered')) {
          const { data: existingUser } = await supabaseAdmin.from('users').select('auth_user_id').eq('email', email).maybeSingle();
          if (existingUser) authUserId = existingUser.auth_user_id;
        } else if (authUser?.user) {
          authUserId = authUser.user.id;
          createdAuthUserId = authUserId; 
        }
      }

      const { data: opResult, error: opErr } = await supabaseAdmin.from("operators").insert({
        customer_id,
        operator_code: operatorCode,
        first_name,
        last_name: last_name || null,
        email: email || null,
        mobile: mobile || null,
        aadhaar_number: aadhaar_number || null,
        dob: dob || null,
        gender: gender || null,
        joining_date: joining_date || null,
        address: address || null,
        emergency_contact: emergency_contact || null,
        status: status || "ACTIVE"
      }).select(`
        *,
        customers ( company_name )
      `).single();

      if (opErr) throw new Error(`Failed to insert operator: ${opErr.message}`);

      if (authUserId) {
        const { error: upsertErr } = await supabaseAdmin.from("users").upsert({
          auth_user_id: authUserId,
          email: email,
          full_name: `${first_name} ${last_name || ''}`.trim() || 'Operator',
          role: "OPERATOR",
          operator_id: opResult.operator_id,
          customer_id: customer_id
        }, { onConflict: 'email' });
        
        if (upsertErr) throw new Error(`Failed to upsert user profile: ${upsertErr.message}`);
      }

      await AuditLogService.log("CREATE_OPERATOR", actorUserId, "OPERATOR", opResult.operator_id);

      if (email && password) {
        const customerName = opResult.customers?.company_name || 'Your Company';
        await NotificationService.notify("operator_created", email, {
          name: `${first_name} ${last_name || ''}`.trim(),
          customer: customerName,
          temporaryPassword: password
        });
      }

      return opResult;
    } catch (err) {
      if (createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      }
      throw err;
    }
  }

  /**
   * Bulk import operators
   */
  static async importOperators(operatorsArray, actorUserId) {
    const results = [];
    for (const op of operatorsArray) {
      try {
        const operator = await this.createOperator(op, actorUserId);
        results.push({ success: true, operator });
      } catch (err) {
        results.push({ success: false, error: err.message, payload: op });
      }
      
      // Add a 2 second delay to avoid hitting email/API rate limits on bulk creation
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return results;
  }
}

module.exports = OperatorService;
