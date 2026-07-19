const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 4000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:8080";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require("@supabase/supabase-js");
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function extractText(response) {
  if (typeof response.output_text === "string") return response.output_text;
  const chunks = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) chunks.push(content.text);
      if (content.type === "text" && content.text) chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

function buildInput(messages, context) {
  const machine = context?.machine || {};
  const company = context?.company || {};
  const assignment = context?.assignment || {};
  const benefits = Array.isArray(context?.benefits) ? context.benefits : [];

  const system = [
    "You are Operator360 Assistant for an equipment operator portal.",
    "Answer briefly, practically, and safely.",
    "Help with assigned machine details, benefits, portal navigation, and service-request guidance.",
    "Do not invent policy, warranty, insurance, or mechanical instructions. If unsure, tell the operator to contact admin/support.",
    "Use the provided operator context when relevant.",
  ].join(" ");

  const contextText = JSON.stringify(
    {
      machine: {
        serial_number: machine.serial_number,
        model_number: machine.model_number,
        machine_id: machine.machine_id,
      },
      company: {
        company_name: company.company_name,
        email: company.email,
        phone: company.phone,
      },
      assignment: {
        status: assignment.status,
        assignment_start_date: assignment.assignment_start_date,
        assignment_reason: assignment.assignment_reason,
      },
      benefits: benefits.slice(0, 8),
    },
    null,
    2,
  );

  return [
    { role: "system", content: system },
    { role: "user", content: `Operator context:\n${contextText}` },
    ...messages.slice(-10).map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || ""),
    })),
  ];
}

async function handleChat(req, res) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("replace_me")) {
    return sendJson(res, 500, { error: "OPENAI_API_KEY is not configured in backend/.env" });
  }

  const body = await readJson(req);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const latest = messages[messages.length - 1]?.content?.trim();
  if (!latest) return sendJson(res, 400, { error: "Message is required" });

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: buildInput(messages, body.context),
      max_output_tokens: 500,
    }),
  });

  const data = await openAiResponse.json();
  if (!openAiResponse.ok) {
    return sendJson(res, openAiResponse.status, {
      error: data.error?.message || "OpenAI request failed",
    });
  }

  sendJson(res, 200, { reply: extractText(data) || "I could not generate a reply." });
}

async function handleCreateOperator(req, res) {
  if (!supabaseAdmin) {
    return sendJson(res, 500, { error: "Supabase admin keys not configured" });
  }

  const body = await readJson(req);
  let operators = body.operators;
  if (!Array.isArray(operators)) {
    operators = [body];
  }

  const results = [];
  
  for (const op of operators) {
    let createdAuthUserId = null;
    try {
      const { customer_id, first_name, last_name, email, mobile, aadhaar_number, dob, gender, joining_date, address, emergency_contact, status } = op;
      
      let operatorCode = op.operator_code;
      if (!operatorCode) {
        operatorCode = `OP-${Date.now().toString(36).toUpperCase().slice(-5)}`;
      }

      // Step 1: Create Auth User if email provided
      let authUserId = null;
      if (email) {
        const password = `${email.split('@')[0]}@123`;
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role: "OPERATOR",
            full_name: `${first_name} ${last_name || ''}`.trim()
          }
        });

        if (authErr && !authErr.message.includes('already registered')) {
          throw new Error(`Failed to create Auth User: ${authErr.message}`);
        }
        
        // If user already existed, we need to fetch their ID
        if (authErr && authErr.message.includes('already registered')) {
          const { data: existingUser } = await supabaseAdmin.from('users').select('auth_user_id').eq('email', email).maybeSingle();
          if (existingUser) {
            authUserId = existingUser.auth_user_id;
          }
        } else if (authUser?.user) {
          authUserId = authUser.user.id;
          createdAuthUserId = authUserId; // Track for rollback
        }
      }

      // Step 2: Insert Operator
      const { data: operatorData, error: opErr } = await supabaseAdmin.from("operators").insert({
        customer_id,
        operator_code: operatorCode,
        first_name,
        last_name: last_name || null,
        email: email || null,
        mobile: mobile || null,
        aadhaar_number: aadhaar_number || null,
        dob: dob || null,
        gender: gender || null,
        joining_date: joining_date || null,
        address: address || null,
        emergency_contact: emergency_contact || null,
        status: status || "ACTIVE"
      }).select().single();

      if (opErr) throw new Error(`Failed to insert operator: ${opErr.message}`);

      // Step 3: Upsert users table to ensure row exists and is linked
      if (authUserId) {
        const { error: upsertErr } = await supabaseAdmin.from("users").upsert({
          auth_user_id: authUserId,
          email: email,
          full_name: `${first_name} ${last_name || ''}`.trim() || 'Operator',
          role: "OPERATOR",
          operator_id: operatorData.operator_id,
          customer_id: customer_id
        }, { onConflict: 'email' });
        
        if (upsertErr) throw new Error(`Failed to upsert user profile: ${upsertErr.message}`);
      }

      results.push({ success: true, operator: operatorData });
    } catch (err) {
      if (createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      }
      results.push({ success: false, error: err.message, operator: op });
    }
  }

  sendJson(res, 200, { results });
}

async function handleCreateCustomer(req, res) {
  if (!supabaseAdmin) {
    return sendJson(res, 500, { error: "Supabase admin keys not configured" });
  }

  const body = await readJson(req);
  let customers = body.customers;
  if (!Array.isArray(customers)) {
    customers = [body];
  }

  const results = [];
  
  for (const cust of customers) {
    let createdAuthUserId = null;
    try {
      const { company_name, customer_code, contact_person, email, phone, address, city, state, pincode, gst_number, category, status } = cust;
      
      const mapCategory = (cat) => {
        const c = String(cat).toUpperCase();
        if (["A", "B", "C", "D"].includes(c)) return c;
        const map = { "BRONZE": "A", "SILVER": "B", "GOLD": "C", "PLATINUM": "D" };
        return map[c] || "A";
      };
      const dbCategory = mapCategory(category);

      // Step 1: Create Auth User if email provided
      let authUserId = null;
      if (email) {
        const password = `${email.split('@')[0]}@123`;
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            role: "CUSTOMER",
            full_name: contact_person || company_name
          }
        });

        if (authErr && !authErr.message.includes('already registered')) {
          throw new Error(`Failed to create Auth User: ${authErr.message}`);
        }
        
        if (authErr && authErr.message.includes('already registered')) {
          const { data: existingUser } = await supabaseAdmin.from('users').select('auth_user_id').eq('email', email).maybeSingle();
          if (existingUser) {
            authUserId = existingUser.auth_user_id;
          }
        } else if (authUser?.user) {
          authUserId = authUser.user.id;
          createdAuthUserId = authUserId;
        }
      }

      // Step 2: Insert Customer
      const { data: customerData, error: custErr } = await supabaseAdmin.from("customers").insert({
        company_name,
        customer_code,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        gst_number: gst_number || null,
        category: dbCategory,
        status: status || "ACTIVE"
      }).select().single();

      if (custErr) throw new Error(`Failed to insert customer: ${custErr.message}`);

      // Step 3: Upsert users table to ensure row exists and is linked
      if (authUserId) {
        const { error: upsertErr } = await supabaseAdmin.from("users").upsert({
          auth_user_id: authUserId,
          email: email,
          full_name: contact_person || company_name || 'Customer',
          phone: phone || null,
          role: "CUSTOMER",
          customer_id: customerData.customer_id
        }, { onConflict: 'email' });
        
        if (upsertErr) throw new Error(`Failed to upsert user profile: ${upsertErr.message}`);
      }

      results.push({ success: true, customer: customerData });
    } catch (err) {
      if (createdAuthUserId) {
        await supabaseAdmin.auth.admin.deleteUser(createdAuthUserId);
      }
      results.push({ success: false, error: err.message, customer: cust });
    }
  }

  sendJson(res, 200, { results });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});
    if (req.method === "GET" && req.url === "/health") return sendJson(res, 200, { ok: true });
    if (req.method === "POST" && req.url === "/api/operator-chat") return await handleChat(req, res);
    if (req.method === "POST" && req.url === "/api/operators") return await handleCreateOperator(req, res);
    if (req.method === "POST" && req.url === "/api/customers") return await handleCreateCustomer(req, res);
    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Operator360 backend listening on http://localhost:${PORT}`);
});