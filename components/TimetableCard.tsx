import { getConnectionStatusColor } from "@/utils/getConnectionStatusColor";
import { Clock } from "lucide-react"; // or your icon set
import { useEffect, useState } from "react";
import { Badge } from "./ui/Badge"; // adjust import path to your Badge component
import { Card } from "./ui/Card"; // adjust import path to your Card component

interface Frequency {
  time: string;
  interval: string;
  intervalTamil: string;
}

interface TimetableEntry {
  line: string;
  lineTamil: string;
  from: string;
  fromTamil: string;
  to: string;
  toTamil: string;
  firstTrain: string;
  lastTrain: string;
  frequencies: Frequency[];
}

export default function TimetableCard({ language }: { language: "en" | "ta" }) {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const res = await fetch("/api/timetable");
        const data = await res.json();
        setTimetable(data.weekdays.blueLine.slice(0, 2)); // example: show Blue Line first
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    }
    fetchTimetable();
  }, []);

  return (
    <div>
      <h4 className="font-medium text-gray-800 flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4" />
        {language === "ta" ? "அட்டவணை" : "Timetable"}
        <Badge className={`ml-auto ${getConnectionStatusColor(status)}`}>
          {status}
        </Badge>
      </h4>
      <Card className="p-3 border border-purple-200">
        <div className="space-y-3">
          {timetable.map((t, i) => (
            <div key={i}>
              <div className="font-medium">
                {language === "ta" ? t.lineTamil : t.line} •{" "}
                {language === "ta" ? t.fromTamil : t.from} →{" "}
                {language === "ta" ? t.toTamil : t.to}
              </div>
              <div className="text-sm text-gray-600">
                {language === "ta"
                  ? `முதல் ரயில்: ${t.firstTrain}, கடைசி ரயில்: ${t.lastTrain}`
                  : `First: ${t.firstTrain}, Last: ${t.lastTrain}`}
              </div>
              <ul className="text-xs text-gray-500 mt-1">
                {t.frequencies.map((f, j) => (
                  <li key={j}>
                    {f.time}:{" "}
                    {language === "ta" ? f.intervalTamil : f.interval}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
