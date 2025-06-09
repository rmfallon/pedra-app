import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    // Retrieve all POIs from the database
    const { data, error } = await supabase.from("pois").select("*");
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ pois: data });
  } else if (req.method === "POST") {
    // Save a new POI to the database
    const { name, description, latitude, longitude } = req.body;
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("pois")
      .insert([{ name, description, latitude, longitude }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(201).json({ poi: data });
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
