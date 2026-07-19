const { supabaseAdmin } = require("../utils/supabase");

class MachineController {
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const { data: machine, error } = await supabaseAdmin
        .from("machines")
        .update({ status })
        .eq("machine_id", id)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ machine });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MachineController;
