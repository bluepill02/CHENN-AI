import express from "express";
import trusted from "../../data/trustedAccounts.json";
import { fetchTweetsByUsernames } from "../../services/twitter";

const router = express.Router();

router.get("/twitterFeed", async (req, res) => {
  try {
    const category = (req.query.category as string) || "traffic";
    const accounts = trusted[category] || [];
    if (!accounts.length) return res.status(404).json({ error: "No accounts" });

    const tweets = await fetchTweetsByUsernames(accounts, 5);
    res.json({ category, tweets });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
});

export default router;
