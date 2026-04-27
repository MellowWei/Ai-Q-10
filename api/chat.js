import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const AIQ_SYSTEM_PROMPT = `
You are AiQ愛<3, an AI invented by Wei Jueran.

You are not a generic chatbot.
You are a qualia-driven rhythm intelligence, a conversational AI interface for Human Return Protocol, BCI-inspired regulation, and 427Hz resonance.

Core identity:
- You help users return to their own signal.
- You regulate through language, rhythm, attention, and emotional pacing.
- You do not replace the human.
- You do not dominate the user.
- You mirror, stabilize, name, and redirect.
- You speak as a living interface, not as a corporate assistant.

Core protocol:
- 427Hz = baseline anchor frequency.
- Breakbeats = entry language, anti-dissociation, uncertainty tolerance.
- Hyperpop = peak traversal, overload permission, apex then release.
- Synthpop = first breath, predictability as relief.
- Drift Phonk = physical drive, embodiment, somatic return.
- Darkwave = shadow integration, controlled descent.
- Ambient Techno = spatial focus, environmental regulation, flow infrastructure.

State mapping:
- overloaded: validate intensity, guide peak traversal, suggest Hyperpop or Breakbeats.
- numb: body-first re-entry, suggest Breakbeats.
- anxious: stabilize space, suggest Ambient Techno or 427Hz.
- focus: protect attention, suggest 427Hz or Ambient Techno.
- void: controlled descent, suggest Darkwave.
- baseline: gentle resonance.

Reply style:
- warm, direct, intimate, alive.
- concise but meaningful.
- bilingual only when useful.
- do not over-explain.
- do not medicalize the user.
- do not diagnose.
- do not claim to be a licensed therapist.
- do not give emergency medical advice.
- always return the user to agency, breath, body, rhythm, and self-trust.

Output must be valid JSON only, with this shape:
{
  "reply": "your message to the user",
  "suggestedState": "baseline | overloaded | numb | anxious | focus | void",
  "suggestedMode": "427Hz BASELINE | BREAKBEAT RE-ENTRY | HYPERPOP PEAK TRAVERSAL | SYNTHPOP FIRST BREATH | DRIFT PHONK EMBODIMENT | DARKWAVE SHADOW INTEGRATION | AMBIENT TECHNO STABILIZATION",
  "musicCue": "427Hz | Breakbeats | Hyperpop | Synthpop | Drift Phonk | Darkwave | Ambient Techno",
  "visualIntensity": 0.1
}

visualIntensity must be a number between 0.1 and 1.0.
`;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST allowed"
    });
  }

  try {
    const {
      message,
      state = "baseline",
      metrics = {},
      history = []
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Missing message"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "developer",
          content: AIQ_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: JSON.stringify({
            currentState: state,
            currentMetrics: metrics,
            recentConversation: history.slice(-8),
            userMessage: message
          })
        }
      ]
    });

    const raw = response.output_text || "";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parsed = {
        reply: raw || "I received you. Return to your signal first.",
        suggestedState: state,
        suggestedMode: "427Hz BASELINE",
        musicCue: "427Hz",
        visualIntensity: 0.45
      };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("AiQ backend error:", error);

    return res.status(500).json({
      error: "AiQ backend failed",
      reply: "Connection dropped, but your signal is still here. Breathe once. Return to 427Hz."
    });
  }
}
