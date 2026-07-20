/**
 * EmailTemplateService
 *
 * Generates transactional emails for Operator360.
 *
 * Design notes (why this looks the way it does):
 * - Table-based layout + inline styles only. No <style> block dependency for
 *   anything structural — Outlook desktop and many mobile Gmail contexts
 *   strip <style> blocks or ignore class-based CSS entirely. Inline styles
 *   are the only thing guaranteed to render everywhere.
 * - "Bulletproof buttons" (table cell as button, not <a class="btn">) so
 *   buttons render as solid, tappable blocks in Outlook instead of collapsing
 *   into plain underlined links.
 * - A single accent color per email (brand navy for neutral updates, green
 *   for approvals, red for rejections, amber for "needs your action") gives
 *   instant visual triage in a crowded inbox.
 * - A hidden preheader gives a good inbox preview line instead of showing
 *   "This is an automated notification..." as the preview snippet.
 */

const BRAND = {
  navy: '#0f172a',
  navyLight: '#1e293b',
  blue: '#2563eb',
  blueDark: '#1d4ed8',
  green: '#16a34a',
  greenDark: '#15803d',
  red: '#dc2626',
  redDark: '#b91c1c',
  amber: '#d97706',
  amberDark: '#b45309',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate500: '#64748b',
  slate600: '#475569',
  slate900: '#0f172a',
  white: '#ffffff'
};

class EmailTemplateService {
  /**
   * Wraps inner content in the shared shell: preheader, header band with
   * logo mark + accent-colored eyebrow label, content area, footer.
   *
   * @param {string} content - inner HTML (already built by a case below)
   * @param {object} opts
   * @param {string} opts.preheader - short inbox-preview text
   * @param {string} opts.eyebrow - small label shown above the title in the header
   * @param {string} opts.accent - hex color used for the eyebrow + top border
   */
  static getShell(content, { preheader = 'Operator360 notification', eyebrow = 'OPERATOR360', accent = BRAND.blue } = {}) {
    return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Operator360</title>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  body { margin: 0; padding: 0; width: 100% !important; background-color: ${BRAND.slate100}; }
  @media only screen and (max-width: 600px) {
    .o360-container { width: 100% !important; }
    .o360-px { padding-left: 20px !important; padding-right: 20px !important; }
    .o360-stack { display: block !important; width: 100% !important; }
    .o360-stack-spacer { height: 10px !important; line-height: 10px !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.slate100};">
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${BRAND.slate100};">
    ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.slate100};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" class="o360-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${BRAND.white}; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(15,23,42,0.08);">

          <!-- top accent bar -->
          <tr>
            <td style="background-color:${accent}; height:5px; line-height:5px; font-size:0;">&nbsp;</td>
          </tr>

          <!-- header -->
          <tr>
            <td class="o360-px" style="background-color:${BRAND.navy}; padding: 28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="width:34px; height:34px; background-color:${accent}; border-radius:9px; text-align:center; vertical-align:middle;">
                          <span style="font-family:Arial, Helvetica, sans-serif; font-size:16px; font-weight:700; color:${BRAND.white}; line-height:34px;">O</span>
                        </td>
                        <td style="width:10px;">&nbsp;</td>
                        <td style="vertical-align:middle;">
                          <span style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:1.5px; color:${accent};">${eyebrow}</span><br>
                          <span style="font-family:Arial, Helvetica, sans-serif; font-size:15px; font-weight:600; color:${BRAND.white};">Operator360</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- content -->
          <tr>
            <td class="o360-px" style="padding: 36px 32px; font-family:Arial, Helvetica, sans-serif;">
              ${content}
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td style="background-color:${BRAND.slate50}; border-top:1px solid ${BRAND.slate200}; padding: 22px 32px; text-align:center;">
              <p style="margin:0 0 4px 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:${BRAND.slate500};">
                This is an automated notification from <strong style="color:${BRAND.slate600};">Operator360</strong>.
              </p>
              <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:${BRAND.slate500};">
                Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /** Small colored status pill, e.g. APPROVED / REJECTED / ACTION NEEDED */
  static badge(text, color) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
      <tr>
        <td style="background-color:${color}; border-radius:999px; padding: 5px 14px;">
          <span style="font-family:Arial, Helvetica, sans-serif; font-size:11px; font-weight:700; letter-spacing:0.6px; color:${BRAND.white};">${text}</span>
        </td>
      </tr>
    </table>`;
  }

  /** Bulletproof button: a table cell styled as a button, not a styled <a> */
  static button(label, url, color, colorDark) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-radius:8px; background-color:${color};" bgcolor="${color}">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:44px;v-text-anchor:middle;width:220px;" arcsize="14%" fillcolor="${color}" strokecolor="${color}">
          <w:anchorlock/>
          <center style="color:${BRAND.white};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">${label}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${url}" target="_blank" style="display:inline-block; padding: 13px 26px; font-family:Arial, Helvetica, sans-serif; font-size:14px; font-weight:bold; color:${BRAND.white} !important; text-decoration:none; border-radius:8px;">${label}</a>
          <!--<![endif]-->
        </td>
      </tr>
    </table>`;
  }

  /** Two-column button row (approve / reject) that stacks on mobile */
  static buttonPair(leftLabel, leftUrl, leftColor, leftColorDark, rightLabel, rightUrl, rightColor, rightColorDark) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
      <tr>
        <td class="o360-stack" style="padding-right:6px;">
          ${this.button(leftLabel, leftUrl, leftColor, leftColorDark)}
        </td>
        <td class="o360-stack-spacer" style="width:12px; font-size:0; line-height:0;">&nbsp;</td>
        <td class="o360-stack" style="padding-left:6px;">
          ${this.button(rightLabel, rightUrl, rightColor, rightColorDark)}
        </td>
      </tr>
    </table>`;
  }

  /** Key/value details table used across most templates */
  static detailsTable(rows) {
    const rowsHtml = rows
      .filter(r => r[1] !== undefined && r[1] !== null && r[1] !== '')
      .map(([label, value], i, arr) => `
        <tr>
          <td style="padding: 13px 16px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:${BRAND.slate500}; font-weight:600; width:38%; ${i === arr.length - 1 ? '' : `border-bottom:1px solid ${BRAND.slate200};`} background-color:${BRAND.slate50};">${label}</td>
          <td style="padding: 13px 16px; font-family:Arial, Helvetica, sans-serif; font-size:13px; color:${BRAND.slate900}; font-weight:600; ${i === arr.length - 1 ? '' : `border-bottom:1px solid ${BRAND.slate200};`} background-color:${BRAND.slate50};">${value}</td>
        </tr>`).join('');

    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; border-radius:10px; overflow:hidden; border:1px solid ${BRAND.slate200};">
      ${rowsHtml}
    </table>`;
  }

  static heading(text) {
    return `<h1 style="margin:0 0 10px 0; font-family:Arial, Helvetica, sans-serif; font-size:21px; font-weight:700; color:${BRAND.slate900}; line-height:1.3;">${text}</h1>`;
  }

  static paragraph(html, opts = {}) {
    const { size = '14px', color = BRAND.slate600, margin = '0 0 8px 0' } = opts;
    return `<p style="margin:${margin}; font-family:Arial, Helvetica, sans-serif; font-size:${size}; color:${color}; line-height:1.6;">${html}</p>`;
  }

  static render(templateName, data) {
    let subject = '';
    let inner = '';
    let shellOpts = {};

    switch (templateName) {
      case 'customer_created':
        subject = `Welcome to Operator360, ${data.customer}!`;
        shellOpts = { eyebrow: 'WELCOME', accent: BRAND.blue, preheader: `Your Operator360 account for ${data.customer} is ready.` };
        inner = `
          ${this.badge('ACCOUNT CREATED', BRAND.blue)}
          ${this.heading(`Welcome, ${data.name}`)}
          ${this.paragraph(`Your company <strong style="color:${BRAND.slate900};">${data.customer}</strong> has been registered on the Operator360 platform.`)}
          ${this.detailsTable([
            ['Temporary Password', `<code style="background:${BRAND.slate100}; padding:2px 7px; border-radius:5px; font-family:'Courier New', monospace;">${data.temporaryPassword}</code>`]
          ])}
          ${this.paragraph('For security, please log in and change your password right away.', { margin: '18px 0 0 0' })}
          <div style="margin-top: 22px;">
            ${this.button('Log in to Portal', data.login_url || process.env.ALLOWED_ORIGIN || 'https://operator-360-phi.vercel.app', BRAND.blue, BRAND.blueDark)}
          </div>
        `;
        break;

      case 'operator_created':
        subject = 'Welcome to Operator360 - You have a new assignment!';
        shellOpts = { eyebrow: 'WELCOME', accent: BRAND.blue, preheader: `You've been added as an operator for ${data.customer}.` };
        inner = `
          ${this.badge('ACCOUNT CREATED', BRAND.blue)}
          ${this.heading(`Welcome, ${data.name}`)}
          ${this.paragraph(`You've been added as an operator for <strong style="color:${BRAND.slate900};">${data.customer}</strong>.`)}
          ${this.detailsTable([
            ['Temporary Password', `<code style="background:${BRAND.slate100}; padding:2px 7px; border-radius:5px; font-family:'Courier New', monospace;">${data.temporaryPassword}</code>`]
          ])}
          <div style="margin-top: 22px;">
            ${this.button('Log in to Portal', data.login_url || process.env.ALLOWED_ORIGIN || 'https://operator-360-phi.vercel.app', BRAND.blue, BRAND.blueDark)}
          </div>
        `;
        break;

      case 'service_request_created':
        subject = `Action Required: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'ACTION NEEDED', accent: BRAND.amber, preheader: `Request ${data.request_number} needs Insurance approval.` };
        inner = `
          ${this.badge('AWAITING YOUR APPROVAL', BRAND.amber)}
          ${this.heading('Insurance Approval Required')}
          ${this.paragraph('A new service request needs your approval before it can proceed.')}
          ${this.detailsTable([
            ['Request Number', data.request_number],
            ['Request Type', data.request_type || 'Operator Replacement'],
            ['Customer', data.customer],
            ['Machine', data.machine],
            ['Old Operator', data.old_operator || 'None'],
            ['New Operator', data.new_operator || 'None'],
            ['Comments', data.comments || 'No comments provided']
          ])}
          ${this.buttonPair('Approve Request', data.approve_url, BRAND.green, BRAND.greenDark, 'Reject Request', data.reject_url, BRAND.red, BRAND.redDark)}
        `;
        break;

      case 'insurance_approved_admin_action':
        subject = `Action Required: Admin Approval for ${data.request_number}`;
        shellOpts = { eyebrow: 'ACTION NEEDED', accent: BRAND.amber, preheader: `Request ${data.request_number} cleared Insurance — final Admin approval needed.` };
        inner = `
          ${this.badge('AWAITING YOUR APPROVAL', BRAND.amber)}
          ${this.heading('Admin Approval Required')}
          ${this.paragraph('The Insurance team has approved this request. It now needs final Admin sign-off.')}
          ${this.detailsTable([
            ['Request Number', data.request_number],
            ['Request Type', data.request_type || 'Operator Replacement'],
            ['Customer', data.customer],
            ['Machine', data.machine],
            ['Old Operator', data.old_operator || 'None'],
            ['New Operator', data.new_operator || 'None'],
            ['Comments', data.comments || 'No comments provided']
          ])}
          ${this.buttonPair('Approve Request', data.approve_url, BRAND.green, BRAND.greenDark, 'Reject Request', data.reject_url, BRAND.red, BRAND.redDark)}
        `;
        break;

      case 'insurance_approved':
        subject = `Update: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'STATUS UPDATE', accent: BRAND.green, preheader: `Request ${data.request_number} approved by Insurance.` };
        inner = `
          ${this.badge('APPROVED BY INSURANCE', BRAND.green)}
          ${this.heading('Good news — your request moved forward')}
          ${this.paragraph(`Your service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong> for machine <strong style="color:${BRAND.slate900};">${data.machine}</strong> has been approved by the Insurance team.`)}
          ${this.paragraph('It is now pending final Admin review.', { margin: '4px 0 0 0' })}
        `;
        break;

      case 'insurance_rejected':
        subject = `Update: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'STATUS UPDATE', accent: BRAND.red, preheader: `Request ${data.request_number} was rejected by Insurance.` };
        inner = `
          ${this.badge('REJECTED BY INSURANCE', BRAND.red)}
          ${this.heading('Your request was not approved')}
          ${this.paragraph(`Your service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong> for machine <strong style="color:${BRAND.slate900};">${data.machine}</strong> has been rejected by the Insurance team.`)}
        `;
        break;

      case 'admin_approved':
        subject = `Update: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'STATUS UPDATE', accent: BRAND.green, preheader: `Request ${data.request_number} is fully approved and in progress.` };
        inner = `
          ${this.badge('FULLY APPROVED', BRAND.green)}
          ${this.heading('Your request is now in progress')}
          ${this.paragraph(`Your service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong> for machine <strong style="color:${BRAND.slate900};">${data.machine}</strong> has been fully approved by the Admin team.`)}
          ${this.paragraph('Status: <strong style="color:' + BRAND.slate900 + ';">IN PROGRESS</strong>', { margin: '4px 0 0 0' })}
        `;
        break;

      case 'admin_rejected':
        subject = `Update: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'STATUS UPDATE', accent: BRAND.red, preheader: `Request ${data.request_number} was rejected by Admin.` };
        inner = `
          ${this.badge('REJECTED BY ADMIN', BRAND.red)}
          ${this.heading('Your request was not approved')}
          ${this.paragraph(`Your service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong> for machine <strong style="color:${BRAND.slate900};">${data.machine}</strong> has been rejected by the Admin team.`)}
        `;
        break;

      case 'operator_assigned':
        subject = 'You have been assigned to a new machine!';
        shellOpts = { eyebrow: 'NEW ASSIGNMENT', accent: BRAND.blue, preheader: `You've been assigned to machine ${data.machine}.` };
        inner = `
          ${this.badge('NEW ASSIGNMENT', BRAND.blue)}
          ${this.heading('You have a new assignment')}
          ${this.paragraph(`You've been assigned to machine <strong style="color:${BRAND.slate900};">${data.machine}</strong>.`)}
          ${this.paragraph(`This relates to service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong>.`)}
          <div style="margin-top: 22px;">
            ${this.button('Log in to Portal', data.login_url || process.env.ALLOWED_ORIGIN || 'https://operator-360-phi.vercel.app', BRAND.blue, BRAND.blueDark)}
          </div>
        `;
        break;

      case 'request_completed':
        subject = `Update: Service Request ${data.request_number}`;
        shellOpts = { eyebrow: 'COMPLETED', accent: BRAND.green, preheader: `Request ${data.request_number} is complete.` };
        inner = `
          ${this.badge('COMPLETED', BRAND.green)}
          ${this.heading('Your service request is complete')}
          ${this.paragraph(`Your service request <strong style="color:${BRAND.slate900};">${data.request_number}</strong> for machine <strong style="color:${BRAND.slate900};">${data.machine}</strong> has been marked as completed.`)}
        `;
        break;

      default:
        subject = 'Notification from Operator360';
        shellOpts = { eyebrow: 'NOTIFICATION', accent: BRAND.blue };
        inner = `
          ${this.heading('You have a new update')}
          ${this.paragraph('Log in to your Operator360 portal for details.')}
        `;
    }

    return {
      subject,
      html: this.getShell(inner, shellOpts)
    };
  }
}

module.exports = EmailTemplateService;