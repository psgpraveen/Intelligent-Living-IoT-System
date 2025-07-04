"use client";
import { Appliance } from "@/types";
import { del, post } from "../hooks/useApi";
import { useState } from "react";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import { Switch } from "@headlessui/react";
import { toast } from "react-toastify";

interface Props {
  appliances: Appliance[];
  selectedId?: string;
  onSelect: (a: Appliance) => void;
  onEdit: (a: Appliance) => void;
  refresh: () => void;
}

export default function ApplianceList({
  appliances,
  selectedId,
  onSelect,
  onEdit,
  refresh,
}: Props) {
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  const handleApiCall = async (
    apiFn: () => Promise<void>,
    successMessage: string
  ) => {
    try {
      await apiFn();
      toast.success(successMessage);
      refresh();
    } catch {
      toast.error("An error occurred.");
    }
  };

  const toggleStatus = async (a: Appliance) => {
    setLoadingToggle(a._id);
    await handleApiCall(
      () =>
        post(`/appliances/${a._id}/control`, {
          action: a.currentStatus === "ON" ? "turn_off" : "turn_on",
        }),
      `Appliance ${a.name} turned ${a.currentStatus === "ON" ? "OFF" : "ON"}.`
    );
    setLoadingToggle(null);
  };

  const remove = async (a: Appliance) => {
    if (!confirm(`Delete appliance “${a.name}”?`)) return;
    await handleApiCall(
      () => del(`/appliances/${a._id}`),
      `Appliance ${a.name} deleted.`
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Appliances</h3>
      <ul className="space-y-3">
        {appliances.map((a) => (
          <li
            key={a._id}
            onClick={() => onSelect(a)}
            className={`
              relative flex flex-col sm:flex-row items-center justify-between bg-blue-200 p-4 border rounded-lg
              transition-shadow cursor-pointer
              ${
                a._id === selectedId
                  ? "border-green-500 bg-green-50 shadow-md"
                  : "border-gray-200 hover:shadow-lg hover:bg-white"
              }
            `}
          >
            <div className="flex-1 text-center sm:text-left">
              <p className="font-medium text-gray-800">{a.name}</p>
              <p className="text-sm text-gray-500 capitalize">{a.type}</p>
            </div>

            {/* Status badge */}
            <span
              className={`
                inline-block px-2 py-1 text-xs font-semibold rounded-full uppercase
                ${
                  a.currentStatus === "ON"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              `}
            >
              {a.currentStatus}
            </span>

            {/* Toggle switch */}
            <Switch
              checked={a.currentStatus === "ON"}
              onChange={() => toggleStatus(a)}
              disabled={loadingToggle === a._id}
              className={`
                ml-4 relative inline-flex h-6 w-11 items-center rounded-full
                transition-colors focus:outline-none
                ${
                  a.currentStatus === "ON" ? "bg-green-500" : "bg-gray-300"
                }
                ${loadingToggle === a._id ? "opacity-50 cursor-wait" : ""}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform bg-white rounded-full
                  transition-transform
                  ${
                    a.currentStatus === "ON" ? "translate-x-6" : "translate-x-1"
                  }
                `}
              />
            </Switch>

            {/* Actions */}
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(a);
                }}
                className="p-1 text-blue-500 hover:text-blue-700"
                aria-label={`Edit appliance ${a.name}`}
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(a);
                }}
                className="p-1 text-red-500 hover:text-red-700"
                aria-label={`Delete appliance ${a.name}`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
