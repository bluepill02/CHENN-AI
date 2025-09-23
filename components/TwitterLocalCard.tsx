import { MapPin, Twitter } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/Badge";
import { Card } from "./ui/Card";

export default function TwitterLocalCard({ pincode }: { pincode: string }) {
  const [tweets, setTweets] = useState<any[]>([]);
  const [locality, setLocality] = useState<string>("Local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/twitterFeedByPincode?pincode=${encodeURIComponent(pincode)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) { setError(data.error); setTweets([]); }
        else { setTweets(data.tweets || []); setLocality(data.locality || "Local"); setError(null); }
      })
      .catch(() => setError("Failed to load locality tweets"))
      .finally(() => setLoading(false));
  }, [pincode]);

  return (
    <Card className="p-3 border border-blue-200">
      <h4 className="font-medium flex items-center gap-2 mb-2">
        <Twitter className="w-4 h-4 text-blue-500" />
        Local updates
        <Badge className="ml-auto">{pincode}</Badge>
      </h4>

      <div className="text-xs text-gray-600 flex items-center gap-1 mb-2">
        <MapPin className="w-3 h-3" /> {locality}
      </div>

      {loading && <div className="text-sm text-gray-600">Loading tweets…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <ul className="space-y-3">
          {tweets.map((t, i) => (
            <li key={t.id || i} className="text-sm text-gray-800">
              {t.text}
              <div className="text-xs text-gray-500">
                {new Date(t.created_at).toLocaleString()}
              </div>
            </li>
          ))}
          {tweets.length === 0 && (
            <li className="text-sm text-gray-600">No recent local updates.</li>
          )}
        </ul>
      )}

      <div className="mt-3 text-xs text-gray-500">
        ⚠️ Only trusted official/community accounts are shown.
      </div>
    </Card>
  );
}
