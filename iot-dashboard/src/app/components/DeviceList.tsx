"use client";

import { useState } from "react";
import { Device } from "@/types";
import { del } from "../hooks/useApi";
import { toast } from "react-toastify";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";

interface Props {
  devices: Device[];
  selectedId?: string;
  onSelect: (d: Device) => void;
  refresh: () => void;
}

export default function DeviceList({ devices, selectedId, onSelect, refresh }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [password, setPassword] = useState("");

  const handleRequestDelete = (device: Device) => {
    setDeviceToDelete(device);
    setModalOpen(true);
    setPassword("");
  };

  const handleConfirmDelete = async () => {
    if (!deviceToDelete || !password) return;

    try {
      setLoadingId(deviceToDelete._id);
      await del(`/devices/${deviceToDelete._id}`, { password });
      toast.success("✅ Device and its appliances deleted.");
      refresh();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "❌ Failed to delete device.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    } finally {
      setModalOpen(false);
      setPassword("");
      setDeviceToDelete(null);
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-1">
        🖥️ Your Devices
      </h3>

      <ul className="space-y-3">
        {devices.map((d) => (
          <li
            key={d._id}
            onClick={() => onSelect(d)}
            className={`relative p-4 rounded-xl shadow-md cursor-pointer border transition-all group
              ${
                d._id === selectedId
                  ? "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400"
                  : "bg-white hover:bg-gray-50 border-gray-200"
              }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold text-gray-800">{d.name}</div>
                <div className="text-xs text-gray-500">{d.deviceId}</div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRequestDelete(d);
                }}
                disabled={loadingId === d._id}
                className="text-red-600 hover:text-red-800 transition-colors text-sm flex items-center gap-1"
                title="Delete Device"
              >
                <FiTrash2 className="text-base" />
                {loadingId === d._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal: Password Confirm */}
      {modalOpen && deviceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-2">
              Enter your password to delete <strong>{deviceToDelete.name}</strong>.
            </p>

            <input
              type="password"
              className="w-full border rounded px-3 py-2 mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setDeviceToDelete(null);
                  setPassword("");
                }}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
