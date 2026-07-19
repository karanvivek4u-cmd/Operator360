const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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

class ChatController {
  static async chat(req, res, next) {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes("replace_me")) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured in backend/.env" });
    }

    const { messages, context } = req.body;
    const msgArray = Array.isArray(messages) ? messages : [];
    const latest = msgArray[msgArray.length - 1]?.content?.trim();
    
    if (!latest) return res.status(400).json({ error: "Message is required" });

    try {
      const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          input: buildInput(msgArray, context),
          max_output_tokens: 500,
        }),
      });

      const data = await openAiResponse.json();
      if (!openAiResponse.ok) {
        return res.status(openAiResponse.status).json({
          error: data.error?.message || "OpenAI request failed",
        });
      }

      res.status(200).json({ reply: extractText(data) || "I could not generate a reply." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatController;
