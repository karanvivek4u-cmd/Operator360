const { z } = require('zod');
const OperatorService = require('../services/OperatorService');

const operatorSchema = z.object({
  customer_id: z.string().uuid(),
  first_name: z.string().min(1),
  last_name: z.string().optional().nullable(),
  operator_code: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  mobile: z.string().optional().nullable(),
  aadhaar_number: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  joining_date: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact: z.string().optional().nullable(),
  status: z.string().optional().nullable()
});

const bulkOperatorSchema = z.object({
  operators: z.array(z.any())
});

class OperatorController {
  static async create(req, res, next) {
    try {
      const data = operatorSchema.parse(req.body);
      
      // Authorization Check (Customer can only add ops to their own ID)
      if (req.user.role === 'CUSTOMER' && data.customer_id !== req.user.customer_id) {
        return res.status(403).json({ error: "Access denied. You can only create operators for your own company." });
      }
      
      const operator = await OperatorService.createOperator(data, req.user?.user_id);
      res.status(201).json({ success: true, operator });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      next(error);
    }
  }

  static async importBulk(req, res, next) {
    try {
      let { operators } = bulkOperatorSchema.parse(req.body);
      
      // Filter out completely empty rows (ignoring injected customer_id and default status)
      operators = operators.filter(o => o.first_name || o.last_name || o.email || o.mobile || o.operator_code);

      const validOperators = [];
      const results = [];
      
      for (const op of operators) {
        const parsed = operatorSchema.safeParse(op);
        if (!parsed.success) {
          results.push({ success: false, error: "Validation failed: " + parsed.error.issues[0].message, payload: op });
        } else {
          validOperators.push(parsed.data);
        }
      }
      
      // Authorization Check
      if (req.user.role === 'CUSTOMER') {
        const invalidIds = validOperators.some(o => o.customer_id !== req.user.customer_id);
        if (invalidIds) {
          return res.status(403).json({ error: "Access denied. All imported operators must belong to your company." });
        }
      }

      const serviceResults = await OperatorService.importOperators(validOperators, req.user?.user_id);
      res.status(200).json({ success: true, results: [...results, ...serviceResults] });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      next(error);
    }
  }
}

module.exports = OperatorController;
