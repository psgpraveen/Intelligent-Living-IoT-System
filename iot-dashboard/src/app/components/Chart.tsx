"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { useState } from "react";
import { ApplianceData } from "@/types";

interface HistoryEntry {
  timestamp: string;         // ISO date
  totalEnergyWh: number;     // in Wh
  computedBill: number;      // in ₹
}

interface Props {
  data: ApplianceData[];
  history?: HistoryEntry[];
  powerThresholdLow?: number;
  powerThresholdHigh?: number;
}

export default function Chart({
  data,
  history,
  powerThresholdLow,
  powerThresholdHigh,
}: Props) {
  const [tab, setTab] = useState<"live" | "history">("live");

  const liveChartData = data
    .slice()
    .reverse()
    .map((d) => ({
      ...d,
      time: new Date(d.timestamp).toLocaleTimeString(),
    }));

  const historyChartData = (history || []).map((h) => ({
    date: new Date(h.timestamp).toLocaleDateString(),
    kWh: +(h.totalEnergyWh / 1000).toFixed(2),
    bill: +h.computedBill.toFixed(2),
  }));

  const hasThresholds =
    typeof powerThresholdLow === "number" &&
    typeof powerThresholdHigh === "number";

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {tab === "live" ? "Live Readings Over Time" : "Energy & Billing History"}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("live")}
            className={`btn ${tab === "live" ? "btn-primary" : "btn-outline"}`}
          >
            Live
          </button>
          <button
            onClick={() => setTab("history")}
            className={`btn ${tab === "history" ? "btn-primary" : "btn-outline"}`}
          >
            History
          </button>
        </div>
      </div>

      <div className="h-[26rem]">
        <ResponsiveContainer width="100%" height="100%">
          {tab === "live" ? (
            <LineChart data={liveChartData}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                }}
                formatter={(value: number, name: string) => {
                  const unit =
                    name === "power"
                      ? "W"
                      : name === "voltage"
                      ? "V"
                      : name === "current"
                      ? "A"
                      : "";
                  return [`${value} ${unit}`, name.charAt(0).toUpperCase() + name.slice(1)];
                }}
              />
              <Line type="monotone" dataKey="power" stroke="#2563eb" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="voltage" stroke="#10b981" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="current" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              {hasThresholds && (
                <ReferenceArea
                  y1={powerThresholdLow}
                  y2={powerThresholdHigh}
                  strokeOpacity={0.1}
                  fill="#fde68a"
                  fillOpacity={0.3}
                  ifOverflow="extendDomain"
                />
              )}
            </LineChart>
          ) : historyChartData.length ? (
            <LineChart data={historyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" stroke="#10b981" />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="kWh"
                stroke="#10b981"
                strokeWidth={2}
                name="Energy (kWh)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bill"
                stroke="#f43f5e"
                strokeWidth={2}
                name="Bill (₹)"
              />
            </LineChart>
          ) : (
            <div className="text-center py-12 text-gray-500">No historical data available</div>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
