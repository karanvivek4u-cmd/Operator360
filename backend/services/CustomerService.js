const { supabaseAdmin } = require("../utils/supabase");
const NotificationService = require("./NotificationService");
const AuditLogService = require("./AuditLogService");

class CustomerService {
  /**
   * Creates a single customer, corresponding auth user, and sends welcome email
   */
  static async createCustomer(customerData, actorUserId) {
    let createdAuthUserId = null;
    try {
      const { company_name, customer_code, contact_person, email, phone, address, city, state, pincode, gst_number, category, status } = customerData;
      
      const mapCategory = (cat) => {
        const c = String(cat).toUpperCase();
        if (["A", "B", "C", "D"].includes(c)) return c;
        const map = { "PLATINUM": "A", "GOLD": "B", "SILVER": "C", "BRONZE": "D" };
        return map[c] || "D";
      };
      const dbCategory = mapCategory(category);

      let authUserId = null;
      let password = null;

      if (email) {
        password = `${email.split('@')[0]}@123`;
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role: "CUSTOMER",
            full_name: contact_person || company_name
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

      const { data: customerDataResult, error: custErr } = await supabaseAdmin.from("customers").insert({
        company_name,
        customer_code,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        gst_number: gst_number || null,
        category: dbCategory,
        status: status || "ACTIVE"
      }).select().single();

      if (custErr) throw new Error(`Failed to insert customer: ${custErr.message}`);

      if (authUserId) {
        const { error: upsertErr } = await supabaseAdmin.from("users").upsert({
          auth_user_id: authUserId,
          email: email,
          full_name: contact_person || company_name || 'Customer',
          phone: phone || null,
          role: "CUSTOMER",
          customer_id: customerDataResult.customer_id
        }, { onConflict: 'email' });
        
        if (upsertErr) throw new Error(`Failed to upsert user profile: ${upsertErr.message}`);
      }

      // Audit Log
      await AuditLogService.log("CREATE_CUSTOMER", actorUserId, "CUSTOMER", customerDataResult.customer_id);

      // Notification
      if (email && password) {
        await NotificationService.notify("customer_created", email, {
          name: contact_person || company_name,
          customer: company_name,
          temporaryPassword: password
        });
      }

      return customerDataResult;
    } catch (err) {
      if (createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      }
      throw err;
    }
  }

  /**
   * Bulk import customers
   */
  static async importCustomers(customersArray, actorUserId) {
    const results = [];
    for (const cust of customersArray) {
      try {
        const customer = await this.createCustomer(cust, actorUserId);
        results.push({ success: true, customer });
      } catch (err) {
        results.push({ success: false, error: err.message, payload: cust });
      }

      // Add a 2 second delay to avoid hitting email/API rate limits on bulk creation
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return results;
  }
}

module.exports = CustomerService;
