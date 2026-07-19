/**
 * Middleware for Request Validation using Zod
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.validatedBody = parsed;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          error: "Validation Error",
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      next(error);
    }
  };
};

module.exports = validate;
