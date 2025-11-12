"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  name?: string;
  phone?: { number: string };
  role?: string;
  email?: { mail: string; isVerified: boolean };
}

interface Complaint {
  _id: string;
  userId: User | null;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);

  const token = localStorage.getItem("accessToken");

  const fetchComplaints = async (status: string, page: number) => {
    setLoading(true);
    try {
      // Construct query parameters
      const params = new URLSearchParams({
        status: status === "all" ? "" : status, // API ignores empty status
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(
        `https://api.tik-mall.com/admin/api/all/complaints?${params.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch complaints");

      const data = await res.json();
      setComplaints(data.complaints);
    } catch (error) {
      console.error(error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(statusFilter, page);
  }, [statusFilter, page, token]);

  const updateStatus = async (
    id: string,
    status: "rejected" | "reviewed" | "resolved"
  ) => {
    setUpdatingId(id);
    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/complaint/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");

      // Refresh complaints after update
      fetchComplaints(statusFilter, page);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
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
            Loading <span className="text-blue-500">Complaints</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6">
      <h2
        className="text-2xl md:text-3xl font-bold mb-4"
        style={{ color: "#456FFF" }}
      >
        Complaints
      </h2>

      {/* Status Filter */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <label className="font-medium text-gray-700">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1); // Reset page when changing filter
          }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 bg-gray-50 rounded-3xl shadow-lg border border-gray-200 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            No Complaints Found
          </h2>
          <p className="text-gray-500">
            There are currently no complaints with this status.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="flex flex-col justify-between p-5 border rounded-2xl shadow-md hover:shadow-xl transition-all bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-semibold text-lg text-gray-800">
                  {c.reason}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    c.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : c.status === "reviewed"
                      ? "bg-blue-600 text-white"
                      : c.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {c.status === "rejected"
                    ? "Refused"
                    : c.status === "reviewed"
                    ? "Reviewed"
                    : c.status === "resolved"
                    ? "Solved"
                    : c.status}
                </span>
              </div>

              <p className="text-gray-600 mb-2">{c.description}</p>
              <p className="text-gray-500 text-sm mb-2">
                By: {c.userId?.name || c.userId?.phone?.number || "Anonymous"}
              </p>
              <p className="text-gray-400 text-xs mb-4">
                Created: {new Date(c.createdAt).toLocaleString()}
              </p>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap mt-auto">
                <button
                  disabled={updatingId === c._id}
                  onClick={() => updateStatus(c._id, "rejected")}
                  className="flex-1 px-4 py-2 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition disabled:opacity-50 shadow-md"
                >
                  Reject
                </button>

                <button
                  disabled={updatingId === c._id}
                  onClick={() => updateStatus(c._id, "resolved")}
                  className="flex-1 px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 transition disabled:opacity-50 shadow-md"
                >
                  Solve
                </button>

                <button
                  disabled={updatingId === c._id}
                  onClick={() => updateStatus(c._id, "reviewed")}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 shadow-md"
                >
                  Reviewed
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
