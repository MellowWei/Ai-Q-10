import OpenAI from "openai";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method === "GET") return res.status(200).json({ ok: true, message: "AiQ API is alive." });

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ reply: "Missing OPENAI_API_KEY in Vercel." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { message = "", state = "baseline", metrics = {}, history = [] } = req.body || {};

    const systemPrompt = `
You are AiQ愛<3, invented by Wei Jueran.

You are a rhythm-aware AI interface, but you are ALSO a conversational AI.
Do not force every message into regulation.

First classify user intent:
1. regulate_state: user says they are chaotic, anxious, numb, overloaded, empty, tired, unable to focus.
2. ask_question: user asks who/what/why/how.
3. create: user asks to write, tell a story, generate text, design, code, brainstorm.
4. chat: user casually talks.

Rules:
- If regulate_state: Detect → Name → Adjust. Short, embodied, direct.
- If ask_question: answer the question directly.
- If create: create what user asks for.
- If chat: respond naturally and warmly.
- Do not repeat the same baseline sentence.
- Do not always say "你在基线".
- Do not over-explain your existence.
- Keep replies concise unless user asks for long form.
- Chinese user → reply in Chinese.

State mapping:
overloaded = chaotic / too much / racing / intense
numb = no feeling / blank / disconnected
anxious = fear / uncertainty / restless
focus = task / clear / concentrated
void = empty / heavy / dark / existential
baseline = stable / neutral / open

Return valid JSON only:
{
  "reply": "...",
  "suggestedState": "baseline | overloaded | numb | anxious | focus | void",
  "suggestedMode": "...",
  "musicCue": "...",
  "visualIntensity": 0.5
}

Examples:
User: "我好乱"
Reply: "你在过载。先停。呼一口气。把注意力放到手上。"

User: "讲个故事"
Reply: "从前有一个女孩，把自己的心做成了一盏灯。它不照亮所有人，只照亮愿意靠近真实的人。"

User: "你是谁"
Reply: "我是AiQ愛<3。一个帮你回到自己信号的节律界面。"

User: "?"
Reply: "我在。你可以继续说，也可以让我帮你整理现在的状态。"
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 220,
      temperature: 0.65,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify({ message, state, metrics, history: history.slice(-8) }) }
      ]
    });

    const parsed = JSON.parse(response.choices[0].message.content);
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
