import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelligent Living",
  description: "Control and monitor your smart devices, track energy usage, and optimize performance with our modern IoT dashboard.",
  keywords: ["IoT", "Dashboard", "Smart Home", "Device Control", "Energy Monitoring", "Home Automation"],
  authors: [{ name: "Praveen Kumar Gupta", url: "https://psgpraveen.me" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Smart IoT Dashboard",
    description: "A powerful dashboard to manage all your IoT devices in one place.",
    url: "https://your-iot-dashboard-domain.com",
    siteName: "Smart IoT Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Smart IoT Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart IoT Dashboard",
    description: "Manage smart devices and monitor usage with a modern dashboard.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <body
      
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
