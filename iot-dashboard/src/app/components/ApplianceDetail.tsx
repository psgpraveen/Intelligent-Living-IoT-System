"use client";

import { useState, useEffect } from "react";
import { Appliance, ApplianceData } from "@/types";
import { put, post } from "../hooks/useApi";

interface Props {
  appliance?: Appliance;
  data: ApplianceData[];
  refresh: () => void;
}

export default function ApplianceDetail({ appliance, data, refresh }: Props) {
  const [avg, setAvg] = useState(0);
  const [lowTh, setLowTh] = useState(0);
  const [highTh, setHighTh] = useState(0);
  const [runInfo, setRunInfo] = useState<{ totalHours: number; totalKWh: number; bill?: number } | null>(null);
  const [latest, setLatest] = useState<ApplianceData | null>(null);
  const [loading, setLoading] = useState(false);

  const RATE_PER_KWH = 8;

  useEffect(() => {
    if (!appliance) return;
    setAvg(appliance.powerRating || 0);
    setLowTh(appliance.powerThresholdLow || 0);
    setHighTh(appliance.powerThresholdHigh || 0);
    fetchBilling();
  }, [appliance]);

  useEffect(() => {
    setLatest(data[0] || null);
  }, [data]);

  const fetchBilling = async () => {
    if (!appliance) return;
    try {
      const res = await post<{ totalHours: number; totalKWh: number; bill: number }>(
        `/appliances/${appliance._id}/control`,
        { action: "noop", ratePerKWh: RATE_PER_KWH }
      );
      setRunInfo(res);
    } catch {
      console.warn("Failed to fetch billing.");
    }
  };

  const handleApiCall = async (apiFn: () => Promise<any>, message: string, refreshData = false) => {
    try {
      setLoading(true);
      await apiFn();
      alert(message);
      if (refreshData) refresh();
      await fetchBilling();
    } catch {
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const saveThresholds = () =>
    handleApiCall(
      () => post(`/appliances/${appliance?._id}/thresholds`, { low: lowTh, high: highTh }),
      "Thresholds saved.",
      true
    );

  const resetTime = () =>
    handleApiCall(
      () => post(`/appliances/${appliance?._id}/reset-time`),
      "Run-time and energy reset.",
      true
    );

  const saveAvg = () =>
    handleApiCall(
      () => put(`/appliances/${appliance?._id}`, { powerRating: avg }),
      "Average power saved.",
      true
    );

  const toggleStatus = () => {
    if (!appliance) return;
    const action = appliance.currentStatus === "ON" ? "turn_off" : "turn_on";
    handleApiCall(
      () => post(`/appliances/${appliance._id}/control`, { action }),
      `Appliance turned ${action === "turn_on" ? "ON" : "OFF"}.`,
      true
    );
  };

  if (!appliance) {
    return <div className="card text-center py-12 text-gray-500">Select an appliance</div>;
  }

  const alerts: string[] = [];
  if (latest) {
    if (highTh > 0 && latest.power > highTh) alerts.push(`⚠️ Power ${latest.power}W > high threshold ${highTh}W`);
    if (lowTh > 0 && latest.power < lowTh) alerts.push(`⚠️ Power ${latest.power}W < low threshold ${lowTh}W`);
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="block font-bold mb-1">Alert:</strong>
          {alerts.map((a, i) => (
            <div key={i}>{a}</div>
          ))}
        </div>
      )}

      {/* Appliance Info */}
      <div className="card space-y-4">
        <h2 className="text-2xl font-bold">{appliance.name}</h2>
        <p className="text-sm text-gray-500 capitalize">{appliance.type}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Low Threshold (W)</label>
            <input
              type="number"
              value={lowTh}
              onChange={(e) => setLowTh(+e.target.value)}
              className="input w-full"
              min={0}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">High Threshold (W)</label>
            <input
              type="number"
              value={highTh}
              onChange={(e) => setHighTh(+e.target.value)}
              className="input w-full"
              min={0}
            />
          </div>
        </div>
        <button onClick={saveThresholds} className="btn btn-primary mt-4" disabled={loading}>
          Save Thresholds
        </button>
      </div>

      {/* Avg Power & Control */}
      <div className="card flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="block font-medium">Average Power (W)</label>
          <input
            type="number"
            value={avg}
            onChange={(e) => setAvg(+e.target.value)}
            className="input w-24"
            min={0}
          />
          <button onClick={saveAvg} className="btn btn-secondary mt-4 sm:mt-0" disabled={loading}>
            Save Avg
          </button>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button onClick={toggleStatus} className="btn btn-accent" disabled={loading}>
            Toggle {appliance.currentStatus === "ON" ? "OFF" : "ON"}
          </button>
          <button onClick={resetTime} className="btn btn-warning" disabled={loading}>
            Reset Usage
          </button>
        </div>
      </div>

      {/* Live Readings */}
      {latest ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["voltage", "current", "power", "status"] as const).map((key) => (
            <div key={key} className="card text-center">
              <h3 className="text-sm text-gray-500 capitalize">{key}</h3>
              <p className="text-xl font-bold">
                {key === "status" ? latest.status : (latest as any)[key]}
                {key === "voltage"
                  ? " V"
                  : key === "current"
                  ? " A"
                  : key === "power"
                  ? " W"
                  : ""}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12 text-gray-500">No readings yet</div>
      )}

      {/* Billing Info */}
      {runInfo && (
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold mb-2">Usage & Billing</h3>
          <p><strong>Total Run Time:</strong> {runInfo.totalHours.toFixed(3)} hours</p>
          <p><strong>Energy Consumed:</strong> {runInfo.totalKWh.toFixed(3)} kWh</p>
          <p><strong>Bill (@ ₹{RATE_PER_KWH}/kWh):</strong> ₹{runInfo.bill?.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
