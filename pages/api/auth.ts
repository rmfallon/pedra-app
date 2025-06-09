import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Handle POST requests for login/logout actions
  if (req.method === "POST") {
    const { action, email, password } = req.body;

    if (action === "login") {
      const { user, error } = await supabase.auth.signIn({ email, password });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ user });
    }

    if (action === "logout") {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(200).json({ message: "Logged out successfully" });
    }

    return res.status(400).json({ error: "Invalid action" });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
