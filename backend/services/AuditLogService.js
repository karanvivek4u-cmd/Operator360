/**
 * AuditLogService
 * 
 * Simple placeholder for capturing audit events (e.g. tracking who approved what).
 * In the future, this can insert into an `audit_logs` table in Supabase.
 */
class AuditLogService {
  static async log(action, userId, resourceType, resourceId, details = {}) {
    console.log(`[AUDIT] Action: ${action} | User: ${userId} | Resource: ${resourceType}(${resourceId}) | Details:`, JSON.stringify(details));
    
    // Future: Insert into Supabase `audit_logs` table
    // await supabaseAdmin.from('audit_logs').insert({ action, user_id: userId, resource_type: resourceType, resource_id: resourceId, details });
  }
}

module.exports = AuditLogService;
