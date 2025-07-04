"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Device } from "@/types";

export default function AddAppliancePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState({ name:"", deviceId:"", type:"Other" });
  const [error, setError] = useState("");
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    axios.get("http://localhost:3001/api/devices", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setDevices(res.data.data.devices))
      .catch(console.error);
      console.log(devices);
      
  }, [token]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e: any) => {
    e.preventDefault(); setError("");
    try {
      await axios.post("http://localhost:3001/api/appliances", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Add appliance failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold">Add Appliance</h2>
        <div>
          <label>Name</label>
          <input name="name" type="text" className="input mt-1" onChange={handleChange} required />
        </div>
        <div>
          <label>Device</label>
          <select name="deviceId" className="input mt-1" onChange={handleChange} required>
            <option value="">Select Device</option>
            {devices.map(d => (
              <option key={d._id} value={d._id}>{d.name} ({d.deviceId})</option>
            ))}
          </select>
        </div>
        <div>
          <label>Type</label>
          <select name="type" className="input mt-1" onChange={handleChange} required>
            {["Fan","Light","Heater","AC","Refrigerator","Other"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button className="btn btn-primary w-full">Add Appliance</button>
      </form>
    </div>
  );
}
