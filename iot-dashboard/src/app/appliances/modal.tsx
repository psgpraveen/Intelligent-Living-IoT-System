"use client";

import { useState, useEffect } from "react";
import { post, put, del } from "../hooks/useApi";
import { Appliance } from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;
  edit?: Appliance;
  deviceId: string;
  refresh: () => void;
}

export default function ApplianceModal({
  open,
  onClose,
  edit,
  deviceId,
  refresh
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Fan");
  const [powerRating, setPowerRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form fields on open or when switching edit/add
  useEffect(() => {
    if (edit) {
      setName(edit.name);
      setType(edit.type);
      setPowerRating(edit.powerRating ?? 0);
    } else {
      setName("");
      setType("Fan");
      setPowerRating(0);
    }
    setError("");
  }, [open, edit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        powerRating,
        device: deviceId
      };
      if (edit) {
        await put(`/appliances/${edit._id}`, payload);
      } else {
        await post("/appliances", payload);
      }
      refresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!edit || !confirm("Delete this appliance?")) return;
    setError("");
    setLoading(true);
    try {
      await del(`/appliances/${edit._id}`);
      refresh();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="card w-96 space-y-4 bg-white"
      >
        <h3 className="text-xl font-semibold">
          {edit ? "Edit Appliance" : "Add Appliance"}
        </h3>

        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input w-full"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1">Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="input w-full"
            disabled={loading}
          >
            {["Fan", "Light", "Heater", "AC", "Refrigerator", "Other"].map(
              t => (
                <option value={t} key={t}>
                  {t}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block mb-1">Avg Power (W)</label>
          <input
            type="number"
            value={powerRating}
            onChange={e => setPowerRating(Number(e.target.value))}
            className="input w-full"
            min={0}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block mb-1">Device</label>
          <input
            type="text"
            value={deviceId}
            className="input w-full bg-gray-100 cursor-not-allowed"
            readOnly
          />
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="btn"
            disabled={loading}
          >
            Cancel
          </button>
          <div className="flex space-x-2">
            {edit && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? edit
                  ? "Saving..."
                  : "Adding..."
                : edit
                ? "Save"
                : "Add"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
