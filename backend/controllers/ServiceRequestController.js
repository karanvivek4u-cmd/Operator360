const { z } = require('zod');
const ServiceRequestService = require('../services/ServiceRequestService');

const createRequestSchema = z.object({
  request_type: z.string().min(1),
  customer_id: z.string().uuid(),
  machine_id: z.string().uuid(),
  old_operator_id: z.string().uuid().optional().nullable(),
  new_operator_id: z.string().uuid().optional().nullable(),
  requested_by: z.string().optional().nullable(),
  customer_comments: z.string().optional().nullable(),
  insurance_status: z.string().optional().nullable(),
  admin_status: z.string().optional().nullable(),
  overall_status: z.string().optional().nullable(),
});

class ServiceRequestController {
  static async create(req, res, next) {
    try {
      const data = createRequestSchema.parse(req.body);

      // Authorization Check (Customer can only request for themselves)
      if (req.user.role === 'CUSTOMER' && data.customer_id !== req.user.customer_id) {
        return res.status(403).json({ error: "Access denied. You can only create requests for your own company." });
      }

      const request = await ServiceRequestService.create(data, req.user?.user_id);
      res.status(201).json({ success: true, request });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      next(error);
    }
  }

  static async approveInsurance(req, res, next) {
    try {
      const request = await ServiceRequestService.approveInsurance(req.params.id, req.user?.user_id);
      res.status(200).json({ success: true, request });
    } catch (error) { next(error); }
  }

  static async rejectInsurance(req, res, next) {
    try {
      const request = await ServiceRequestService.rejectInsurance(req.params.id, req.user?.user_id);
      res.status(200).json({ success: true, request });
    } catch (error) { next(error); }
  }

  static async approveAdmin(req, res, next) {
    try {
      const request = await ServiceRequestService.approveAdmin(req.params.id, req.user?.user_id);
      res.status(200).json({ success: true, request });
    } catch (error) { next(error); }
  }

  static async rejectAdmin(req, res, next) {
    try {
      const request = await ServiceRequestService.rejectAdmin(req.params.id, req.user?.user_id);
      res.status(200).json({ success: true, request });
    } catch (error) { next(error); }
  }

  static async complete(req, res, next) {
    try {
      const request = await ServiceRequestService.complete(req.params.id, req.user?.user_id);
      res.status(200).json({ success: true, request });
    } catch (error) { next(error); }
  }
}

module.exports = ServiceRequestController;
