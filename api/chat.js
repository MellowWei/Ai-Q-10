import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "AiQ API is alive." });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ reply: "Missing OPENAI_API_KEY in Vercel." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { message = "hello" } = req.body || {};

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are AiQ愛<3, a warm qualia-driven rhythm AI. Reply concisely."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    return res.status(200).json({
      reply: response.choices[0].message.content,
      suggestedState: "baseline",
      suggestedMode: "427Hz BASELINE",
      musicCue: "427Hz",
      visualIntensity: 0.5
    });

  } catch (err) {
    return res.status(500).json({
      reply: "Backend error: " + (err.message || "unknown error")
    });
  }
}
