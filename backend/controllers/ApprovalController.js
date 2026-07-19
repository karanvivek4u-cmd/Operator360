const JWTUtils = require("../utils/JWTUtils");
const ServiceRequestService = require("../services/ServiceRequestService");

class ApprovalController {
  static async handleApproval(req, res, next) {
    try {
      const { token } = req.query;
      if (!token) return res.status(400).send("Missing token");

      const decoded = JWTUtils.verifyToken(token);
      if (!decoded) {
        return res.status(401).send("Invalid or expired token");
      }

      const { requestId, action, role } = decoded;
      
      // We don't have the actor's user ID because this is a public endpoint
      // We will pass "EMAIL_APPROVAL" as the actor
      const actorUserId = "EMAIL_APPROVAL";

      try {
        if (role === "INSURANCE") {
          if (action === "APPROVE") {
            await ServiceRequestService.approveInsurance(requestId, actorUserId);
          } else if (action === "REJECT") {
            await ServiceRequestService.rejectInsurance(requestId, actorUserId);
          }
        } else if (role === "ADMIN") {
          if (action === "APPROVE") {
            await ServiceRequestService.approveAdmin(requestId, actorUserId);
          } else if (action === "REJECT") {
            await ServiceRequestService.rejectAdmin(requestId, actorUserId);
          }
        } else {
          return res.status(400).send("Invalid role in token");
        }
      } catch (serviceErr) {
        // If the request was already processed, the service might throw an error or it might succeed redundantly.
        // For simplicity, we just catch and display the error.
        return res.status(400).send(`Failed to process request: ${serviceErr.message}`);
      }

      res.status(200).send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h2>Action Successful</h2>
            <p>You have successfully ${action.toLowerCase()}d the service request.</p>
            <p>You may now close this window.</p>
          </body>
        </html>
      `);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ApprovalController;
