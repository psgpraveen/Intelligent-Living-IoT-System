"use client";
import { useState } from "react";
import { post } from "@/app/hooks/useApi";

interface Props {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
}

export default function DeviceModal({ open, onClose, refresh }: Props) {
  const [deviceId, setDeviceId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      await post("/devices", { deviceId, name });
      refresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add device");
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="card w-96 space-y-4">
        <h3 className="text-xl font-semibold">Add Device</h3>
        <div>
          <label className="block mb-1">Device ID</label>
          <input
            value={deviceId}
            onChange={e => setDeviceId(e.target.value)}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
            required
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="btn">Cancel</button>
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
      </form>
    </div>
  );
}
