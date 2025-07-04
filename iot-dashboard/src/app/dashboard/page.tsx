"use client";

import { useState, useEffect } from "react";
import { get } from "../hooks/useApi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import DeviceList from "../components/DeviceList";
import ApplianceList from "../components/ApplianceList";
import ApplianceDetail from "../components/ApplianceDetail";
import Chart from "../components/Chart";
import ApplianceModal from "../appliances/modal";
import DeviceModal from "../devices/add/page";

import { Device, Appliance, ApplianceData } from "../../types";

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selDev, setSelDev] = useState<Device | null>(null);
  const [appls, setAppls] = useState<Appliance[]>([]);
  const [selApp, setSelApp] = useState<Appliance | null>(null);
  const [data, setData] = useState<ApplianceData[]>([]);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [devModalOpen, setDevModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required.");
      return router.push("/login");
    }

    get<{ user: { name: string; email: string } }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {
        toast.error("Session expired.");
        router.push("/login");
      });

    refreshDevices();
  }, []);

  useEffect(() => {
    if (!selDev) return setAppls([]);
    refreshAppliances();
  }, [selDev]);

  useEffect(() => {
    setData([]);
    if (!selApp) return;

    get<ApplianceData[]>(`/data?applianceId=${selApp._id}`)
      .then(setData)
      .catch(() => toast.error("Failed to load historical data."));

    const token = localStorage.getItem("token");
    const url = `http://localhost:3001/api/stream?applianceId=${selApp._id}` +
      (token ? `&token=${token}` : "");
    const es = new EventSource(url);

    es.onmessage = (e) => {
      const rec: ApplianceData = JSON.parse(e.data);
      setData((prev) => [rec, ...prev.slice(0, 99)]);
    };

    es.onerror = () => {
      toast.error("Live data stream disconnected.");
      es.close();
    };

    return () => es.close();
  }, [selApp]);

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out.");
    router.push("/login");
  };

  const refreshDevices = () =>
    get<Device[]>("/devices").then(setDevices).catch(() => toast.error("Failed to load devices."));

  const refreshAppliances = () =>
    selDev &&
    get<Appliance[]>(`/appliances?deviceId=${selDev._id}`)
      .then((list) => {
        setAppls(list);
        const current = list.find((a) => a._id === selApp?._id);
        if (current) setSelApp(current);
      })
      .catch(() => toast.error("Failed to load appliances."));

  const refreshData = () =>
    selApp &&
    get<ApplianceData[]>(`/data?applianceId=${selApp._id}`)
      .then(setData)
      .catch(() => toast.error("Failed to refresh data."));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* HEADER */}
      <header className="bg-indigo-600 dark:bg-gray-800 text-white shadow p-4 sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <h1 className="text-xl font-semibold">IoT Dashboard</h1>
            {user && (
              <span className="text-sm text-indigo-100 dark:text-gray-300">
                {user.name} ({user.email})
              </span>
            )}
          </div>

          {/* Header buttons (hidden on small screens) */}
          <div className="hidden sm:flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelApp(null);
                setAppModalOpen(true);
              }}
              className="btn bg-white text-indigo-700 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-300"
            >
              + Appliance
            </button>
            <button
              onClick={() => setDevModalOpen(true)}
              className="btn bg-white text-indigo-700 hover:bg-gray-100 focus:ring-2 focus:ring-indigo-300"
            >
              + Device
            </button>
            <button
              onClick={logout}
              className="btn bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-400 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SIDEBAR */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          {/* Mobile-only buttons */}
          <div className="flex sm:hidden flex-col gap-2 mb-4">
            <button
              onClick={() => {
                setSelApp(null);
                setAppModalOpen(true);
              }}
              className="btn bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Appliance
            </button>
            <button
              onClick={() => setDevModalOpen(true)}
              className="btn bg-indigo-600 text-white hover:bg-indigo-700"
            >
              + Device
            </button>
            <button
              onClick={logout}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <DeviceList
            devices={devices}
            selectedId={selDev?._id}
            onSelect={(dev) => {
              setSelDev(dev);
              setSelApp(null);
            }}
          />
          {selDev && (
            <ApplianceList
              appliances={appls}
              selectedId={selApp?._id}
              onSelect={setSelApp}
              onEdit={(a) => {
                setSelApp(a);
                setAppModalOpen(true);
              }}
              refresh={refreshAppliances}
            />
          )}
        </aside>

        {/* MAIN PANEL */}
        <main className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ApplianceDetail
              appliance={selApp}
              data={data}
              refresh={() => {
                refreshData();
                refreshAppliances();
              }}
            />
            <Chart
              data={data}
              powerThresholdLow={selApp?.powerThresholdLow}
              powerThresholdHigh={selApp?.powerThresholdHigh}
            />
          </div>
        </main>
      </div>

      {/* MODALS */}
      <ApplianceModal
        open={appModalOpen}
        onClose={() => setAppModalOpen(false)}
        edit={selApp || undefined}
        deviceId={selDev?._id || ""}
        refresh={refreshAppliances}
      />
      <DeviceModal
        open={devModalOpen}
        onClose={() => setDevModalOpen(false)}
        refresh={refreshDevices}
      />
    </div>
  );
}
