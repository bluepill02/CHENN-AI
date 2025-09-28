import { AutoSharePost, autoSharePosts } from "@/data/autoShare";
import { randomUUID } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { user, from, to, seatsAvailable, pincode } = req.body;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60000); // 30 mins

    const post: AutoSharePost = {
  id: randomUUID(),
      user,
      from,
      to,
      seatsAvailable: Number(seatsAvailable),
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      pincode
    };

    autoSharePosts.push(post);
    return res.status(201).json(post);
  }

  if (req.method === "GET") {
    const { pincode } = req.query;
    const now = new Date();

    // Filter active posts
    const active = autoSharePosts.filter(
      p => p.pincode === pincode && new Date(p.expiresAt) > now
    );

    return res.status(200).json(active);
  }

  res.status(405).json({ error: "Method not allowed" });
}
