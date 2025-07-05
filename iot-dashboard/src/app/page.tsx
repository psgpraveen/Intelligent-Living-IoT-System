import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 bg-gradient-to-b from-indigo-50 via-white to-indigo-100">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-700 leading-tight">
          Intelligent Living
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 font-medium">
          Real-Time Appliance Monitoring and Control System with IoT
        </p>
        <p className="max-w-2xl mx-auto text-gray-600 text-lg sm:text-xl">
          Control your home with intelligence. Monitor appliances in real-time, save energy, and gain full insight into power usage—right from your dashboard.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
          <Link
            href="/login"
            className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md shadow-md transition"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="btn border border-indigo-600 text-indigo-700 hover:bg-indigo-100 px-6 py-3 rounded-md transition"
          >
            Sign Up
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-16 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {[
          {
            title: "📡 Real-Time Monitoring",
            desc: "Track voltage, current, and power live for all connected appliances.",
          },
          {
            title: "⚙️ Smart Control",
            desc: "Turn appliances ON/OFF and automate based on thresholds or time.",
          },
          {
            title: "📊 Usage & Billing",
            desc: "Get total energy consumed and cost estimates based on real-time data.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl shadow-md p-6 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-indigo-700 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
