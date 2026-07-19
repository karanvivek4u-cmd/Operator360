const { z } = require('zod');
const CustomerService = require('../services/CustomerService');

const customerSchema = z.object({
  company_name: z.string().min(1),
  customer_code: z.string().optional().nullable(),
  contact_person: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  pincode: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  status: z.string().optional().nullable()
});

const bulkCustomerSchema = z.object({
  customers: z.array(z.any())
});

class CustomerController {
  static async create(req, res, next) {
    try {
      const data = customerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(data, req.user?.user_id);
      res.status(201).json({ success: true, customer });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      next(error);
    }
  }

  static async importBulk(req, res, next) {
    try {
      let { customers } = bulkCustomerSchema.parse(req.body);
      
      // Filter out completely empty rows
      customers = customers.filter(c => c.company_name || c.contact_person || c.email || c.phone || c.customer_code);

      const validCustomers = [];
      const results = [];
      
      for (const cust of customers) {
        const parsed = customerSchema.safeParse(cust);
        if (!parsed.success) {
          results.push({ success: false, error: "Validation failed: " + parsed.error.issues[0].message, payload: cust });
        } else {
          validCustomers.push(parsed.data);
        }
      }

      const serviceResults = await CustomerService.importCustomers(validCustomers, req.user?.user_id);
      res.status(200).json({ success: true, results: [...results, ...serviceResults] });
    } catch (error) {
      if (error.name === 'ZodError') return res.status(400).json({ error: error.errors });
      next(error);
    }
  }
}

module.exports = CustomerController;
