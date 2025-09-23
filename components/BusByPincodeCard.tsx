import { Bus } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";

export default function BusByPincodeCard({ pincode, language }: { pincode: string, language: "en" | "ta" }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/busByPincode?pincode=${pincode}`)
      .then(res => res.json())
      .then(setData);
  }, [pincode]);

  if (!data) return null;
return (
  <div>
    <h4 className="font-medium flex items-center gap-2 mb-2">
      <Bus className="w-4 h-4" />
      {language === "ta" ? "பேருந்து தகவல்" : "Bus Info"}
      <Badge className="ml-auto">{pincode}</Badge>
    </h4>
    <Card className="p-3 border border-green-200">
      {/* List of stops for this pincode */}
      <ul className="space-y-1">
        {data.stops.map((stop: string, i: number) => (
          <li key={i}>{stop}</li>
        ))}
      </ul>

      {/* Loop through all routes */}
      {data.routes && data.routes.length > 0 ? (
        <div className="mt-4 space-y-4">
          {data.routes.map((route: any, idx: number) => (
            <div key={idx} className="border-b pb-2 last:border-0">
              <div className="font-medium">
                {route.route}:{" "}
                {language === "ta" ? route.fromTamil || route.from : route.from} →{" "}
                {language === "ta" ? route.toTamil || route.to : route.to}
              </div>
              <ul className="text-sm text-gray-600 mt-2 grid grid-cols-3 gap-2">
                {route.timings.slice(0, 9).map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-600 mt-2">
          {language === "ta"
            ? "இந்த பின்கோடுக்கு பேருந்து இல்லை"
            : "No bus timings available for this pincode"}
        </div>
      )}

      <div className="mt-3 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 p-2 rounded">
        ⚠️ {language === "ta"
          ? "அட்டவணை எம்டிசி அதிகாரப்பூர்வ தளத்திலிருந்து பெறப்பட்டது. சேவைகள் மாறக்கூடும்."
          : "Timings are fetched from MTC’s official site. Actual services may vary."}
      </div>
    </Card>
  </div>
);

// API handler code removed. Please see /pages/api/busByPincode.ts for the API implementation.
}