import { Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export default function TwitterFeedCard({ category = "traffic" }: { category?: string }) {
  const [tweets, setTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/twitterFeed?category=${category}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTweets(data.tweets || []);
      })
      .catch(() => setError("Failed to load tweets"))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <Card className="p-3 border border-blue-200">
      <h4 className="font-medium flex items-center gap-2 mb-2">
        <Twitter className="w-4 h-4 text-blue-500" />
        Official Updates
        <Badge className="ml-auto">{category}</Badge>
      </h4>

      {loading && <div className="text-sm text-gray-600">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <ul className="space-y-2">
        {tweets.map((t, i) => (
          <li key={t.id || i} className="text-sm text-gray-800">
            {t.text}
            <div className="text-xs text-gray-500">
              {new Date(t.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
