"use client";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

interface Broadcast {
  _id: string;
  title?: string;
  status?: string;
  createdAt: string;
}

const LiveBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchBroadcasts = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        "https://api.tik-mall.com/admin/api/live-streams/active",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: { items?: Broadcast[] } = await res.json();
      setBroadcasts(data.items ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch live broadcasts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] bg-transparent">
        <div className="relative flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>
          <div className="flex gap-2 mt-6">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
            <span className="w-3 h-3 rounded-full bg-blue-300 animate-bounce [animation-delay:0.3s]" />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Loading <span className="text-blue-500">Active Broadcasts</span>...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 text-lg mb-3">{error}</p>
        <button
          onClick={fetchBroadcasts}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );

  if (broadcasts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="mb-4 opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a1 1 0 011 1v10a1 1 0 01-1 1H4a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-700">
          No Active Broadcasts
        </h3>
        <p className="text-gray-500 mt-2 mb-6">
          There are currently no live broadcasts streaming right now.
        </p>
      </div>
    );

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />
      <ul className="space-y-3">
        {broadcasts.map((broadcast) => (
          <li
            key={broadcast._id}
            className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white"
          >
            <p className="text-lg font-medium text-gray-800">
              {broadcast.title || "Untitled"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Status:</strong> {broadcast.status || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Created At:</strong>{" "}
              {new Date(broadcast.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveBroadcasts;
