"use client";

import { CheckCircleIcon, MegaphoneIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

interface User {
  _id: string;
  name?: string;
  phone?: { number: string };
}

interface Complaint {
  _id: string;
  userId: User | null;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("accessToken");

  const fetchComplaints = async (status: string, page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: status === "all" ? "" : status,
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
      fetchComplaints(statusFilter, page);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  };

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
            Loading <span className="text-blue-500">Complaints</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />
      <h2
        className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white"
        style={{ color: "#456FFF" }}
      >
        <MegaphoneIcon className="w-7 h-7 text-blue-600" />
        Complaints
      </h2>

      {/* Status Filter */}
      <div className="mb-6 flex justify-end">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <label className="font-medium text-gray-700 dark:text-gray-300">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
            <tr>
              {["#", "Reason", "Description", "Status", "User", "Actions"].map(
                (title) => (
                  <th
                    key={title}
                    className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase"
                  >
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {complaints.length ? (
              complaints.map((c, idx) => (
                <tr
                  key={c._id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white">
                    {c.reason}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {c.description}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        c.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : c.status === "reviewed"
                          ? "bg-blue-600 text-white"
                          : c.status === "resolved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
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
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {c.userId?.name || c.userId?.phone?.number || "Anonymous"}
                  </td>
                  <td className="py-3 px-4 flex gap-1">
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "rejected")}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "resolved")}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      Solve
                    </button>
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "reviewed")}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Reviewed
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  colSpan={6}
                >
                  No complaints found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Complaints;
