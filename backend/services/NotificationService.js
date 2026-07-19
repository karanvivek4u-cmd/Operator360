/**
 * NotificationService
 * 
 * Single source of truth for sending notifications out of the system.
 * Currently uses n8n for email delivery. Designed to be extensible for SMS, Push, etc.
 */
const EmailTemplateService = require('./EmailTemplateService');

class NotificationService {
  
  static async notify(template, recipient, data) {
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    if (!N8N_WEBHOOK_URL) {
      console.warn(`[NotificationService] Missing N8N_WEBHOOK_URL in environment. Cannot send template: ${template}`);
      return false;
    }

    if (!recipient) {
      console.warn(`[NotificationService] No recipient provided for template: ${template}`);
      return false;
    }

    const rendered = EmailTemplateService.render(template, data);

    const payload = {
      recipient,
      subject: rendered.subject,
      message: rendered.html
    };

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`n8n webhook responded with status: ${response.status}`);
      }

      console.log(`[NotificationService] Successfully queued '${template}' for ${recipient}`);
      return true;
    } catch (error) {
      console.error(`[NotificationService] Failed to send '${template}':`, error);
      return false;
    }
  }
}

module.exports = NotificationService;
