import type { NextApiRequest, NextApiResponse } from "next";
import trusted from "../../data/trustedAccounts.json";
import { fetchTweetsByUsernames } from "../../services/twitter";

type TrustedAccountMap = Record<string, string[]>;

const trustedAccounts = trusted as TrustedAccountMap;
const DEFAULT_CATEGORY = "traffic";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const requestedCategory = typeof req.query.category === "string" ? req.query.category : undefined;
    const category = (requestedCategory && requestedCategory in trustedAccounts
      ? requestedCategory
      : DEFAULT_CATEGORY) as keyof typeof trustedAccounts;

    const accounts = trustedAccounts[category];
    if (!accounts || accounts.length === 0) {
      return res.status(404).json({ error: "No accounts" });
    }

    const tweets = await fetchTweetsByUsernames(accounts, 5);
    return res.status(200).json({ category, tweets });
  } catch (err) {
    console.error("/api/twitterFeed error", err);
    return res.status(500).json({ error: "Failed to fetch tweets" });
  }
}
