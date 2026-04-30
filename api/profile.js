import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });

    // GET - fetch profile
    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        profile: data || {
          user_id: userId,
          state_history: [],
          tags: {},
          summary: ""
        }
      });
    }

    // PATCH - update tags or summary
    if (req.method === "PATCH") {
      const { tags, summary } = req.body || {};
      const updates = { updated_at: new Date().toISOString() };
      if (tags !== undefined) updates.tags = tags;
      if (summary !== undefined) updates.summary = summary;

      const { error } = await supabase
        .from("user_profiles")
        .upsert({ user_id: userId, ...updates });

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
