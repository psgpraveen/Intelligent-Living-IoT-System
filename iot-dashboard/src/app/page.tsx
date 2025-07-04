import Link from "next/link";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center gap-8 min-h-screen">
      <h1 className="text-4xl font-bold text-center">IoT Appliance Monitoring</h1>
      <p className="max-w-xl text-center text-gray-600">
        Manage devices, monitor real-time power, set thresholds, and view billing.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="btn btn-primary">Login</Link>
        <Link href="/signup" className="btn btn-secondary">Sign Up</Link>
      </div>
    </main>
  );
}
