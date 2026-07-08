/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { RefreshCw, ScrollText } from "lucide-react";
import { ActivityEvent } from "../types";

const KIND_COLOR: Record<ActivityEvent["kind"], string> = {
  compile: "text-caustic-dim border-caustic-dim/40",
  recipe: "text-white border-line-dk",
  inventory: "text-cool border-cool/40",
  mold: "text-cool border-cool/40",
  advisor: "text-caustic-dim border-caustic-dim/40",
  other: "text-mute-2 border-line-dk",
};

export default function ActivityLog() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [live, setLive] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/activity");
      if (res.ok) {
        const data: ActivityEvent[] = await res.json();
        setEvents([...data].reverse()); // newest first
      }
    } catch (err) {
      console.error("Activity fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(fetchEvents, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const failed = events.filter((e) => e.status >= 400).length;

  return (
    <div className="max-w-4xl">
      <div className="bg-ink text-white instrument-grid border border-ink-3">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-dk">
          <div className="flex items-center gap-2.5">
            <ScrollText className="w-4 h-4 text-caustic" />
            <div>
              <h3 className="display text-[13px] uppercase tracking-widest text-white">Activity log</h3>
              <p className="eyebrow text-[8px] text-mute-2 mt-1">Real server events · compiles, saves, edits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLive(!live)}
              className={`eyebrow text-[8.5px] px-2 py-1 border transition ${
                live ? "text-caustic border-caustic/40 bg-caustic/10" : "text-mute-2 border-line-dk"
              }`}
            >
              {live ? "● Live" : "○ Paused"}
            </button>
            <button onClick={fetchEvents} disabled={loading} className="p-1.5 text-mute-2 hover:text-white">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 border-b border-line-dk divide-x divide-line-dk">
          <Stat label="Events" value={String(events.length)} />
          <Stat label="Failed" value={String(failed)} accent={failed > 0 ? "warn" : undefined} />
          <Stat label="Store" value="JSON · local" className="hidden sm:block" />
        </div>

        {/* feed */}
        <div className="max-h-[28rem] overflow-y-auto scroll-thin">
          {events.length === 0 ? (
            <div className="text-center py-16 text-mute-2 text-xs">No activity yet. Compile or save a recipe to populate the log.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-ink">
                <tr className="eyebrow text-[8px] text-mute-2 border-b border-line-dk">
                  <th className="py-2 px-4 font-semibold">Time</th>
                  <th className="py-2 px-2 font-semibold">Action</th>
                  <th className="py-2 px-2 font-semibold hidden sm:table-cell">Endpoint</th>
                  <th className="py-2 px-2 font-semibold text-center">Status</th>
                  <th className="py-2 px-4 font-semibold hidden md:table-cell">Fingerprint</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const ok = e.status < 400;
                  return (
                    <tr key={e.id} className="border-b border-line-dk/60 hover:bg-white/[0.02]">
                      <td className="py-2.5 px-4 font-mono text-[10px] text-mute-2 whitespace-nowrap">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`font-mono text-[9px] uppercase border px-1 mr-2 ${KIND_COLOR[e.kind]}`}>{e.method}</span>
                        <span className="text-[12px] text-white/85">{e.action}</span>
                      </td>
                      <td className="py-2.5 px-2 font-mono text-[10px] text-mute-2 hidden sm:table-cell">{e.endpoint}</td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-mono text-[10px] font-semibold ${ok ? "text-caustic-dim" : "text-warn"}`}>{e.status}</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[9px] text-mute-2 hidden md:table-cell">{e.fingerprint}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, className }: { label: string; value: string; accent?: "warn"; className?: string }) {
  return (
    <div className={`px-4 py-3 ${className || ""}`}>
      <span className="eyebrow text-[8px] text-mute-2 block">{label}</span>
      <span className={`font-mono text-lg font-semibold mt-0.5 block ${accent === "warn" ? "text-warn" : "text-white"}`}>{value}</span>
    </div>
  );
}
