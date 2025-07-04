"use client";

import { Device } from "@/types";

interface Props {
  devices: Device[];
  selectedId?: string;
  onSelect: (d: Device) => void;
}

export default function DeviceList({ devices, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Devices</h3>
      <ul className="space-y-3">
        {devices.map((d) => (
          <li
            key={d._id}
            onClick={() => onSelect(d)}
            className={`
              p-4 border rounded-lg cursor-pointer transition-shadow
              ${d._id === selectedId
                ? "bg-blue-100 border-blue-500 shadow-md"
                : "bg-white hover:bg-gray-50 hover:shadow-lg"}
            `}
          >
            <div className="font-medium text-gray-800">{d.name}</div>
            <div className="text-xs text-gray-500">{d.deviceId}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
