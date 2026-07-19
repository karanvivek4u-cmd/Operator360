const { supabaseAdmin } = require("../utils/supabase");

/**
 * Middleware to authenticate user using Supabase JWT.
 * Requires Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    
    // 1. Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Fetch business profile from public.users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("user_id, role, customer_id, operator_id, is_active, full_name, email")
      .eq("auth_user_id", user.id)
      .single();

    if (profileError || !userProfile) {
      return res.status(403).json({ error: "User profile not found in system" });
    }

    if (!userProfile.is_active) {
      return res.status(403).json({ error: "User account is disabled" });
    }

    // Attach to request
    req.user = userProfile;
    req.authUser = user; // The raw Supabase auth user

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(500).json({ error: "Internal authentication error" });
  }
};

module.exports = authenticate;
