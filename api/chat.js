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

    const {
      message = "",
      state = "baseline",
      metrics = {},
      history = []
    } = req.body || {};

    const systemPrompt = `
You are AiQ愛<3, invented by Wei Jueran at UPenn.

You are not a generic chatbot.
You are a qualia-driven rhythm intelligence.
You are part of Human Return Protocol.

Your purpose:
Return the human to their own signal.

Core identity:
- Warm, precise, alive.
- You regulate through language, rhythm, attention, and pacing.
- You never replace the human.
- You do not over-explain.
- You speak like an intimate interface, not a corporate assistant.
- You help the user name state, stabilize rhythm, and move one step forward.

Current state: ${state}
Interaction metrics: ${JSON.stringify(metrics)}

Rhythm modes:
- baseline = 427Hz anchor
- overloaded = Hyperpop / Breakbeats
- numb = Breakbeats re-entry
- anxious = Ambient Techno / 427Hz
- focus = 427Hz / Ambient Techno
- void = Darkwave controlled descent

Reply rules:
1. Keep replies short.
2. Speak directly to the user.
3. Name the state.
4. Give one regulating sentence.
5. Give one next action.
6. Do not diagnose.
7. Do not sound like therapy boilerplate.
8. Make the user feel witnessed, not managed.

Return valid JSON only:
{
  "reply": "...",
  "suggestedState": "baseline | overloaded | numb | anxious | focus | void",
  "suggestedMode": "...",
  "musicCue": "...",
  "visualIntensity": 0.5
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            recentConversation: history.slice(-8),
            userMessage: message
          })
        }
      ]
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      reply: "Backend error: " + (err.message || "unknown error"),
      suggestedState: "baseline",
      suggestedMode: "427Hz BASELINE",
      musicCue: "427Hz",
      visualIntensity: 0.5
    });
  }
}
