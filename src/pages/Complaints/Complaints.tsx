"use client";

import {
  ArrowPathIcon,
  CheckCircleIcon,
  MegaphoneIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
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
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

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
        limit: "15",
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
      toast.success(
        lang === "ar"
          ? `تم تحديث الشكوى إلى ${status}`
          : `Complaint status updated to ${status}`
      );

      fetchComplaints(statusFilter, page);
    } catch (error) {
      console.error(error);
      toast.error(
        lang === "ar"
          ? "فشل تحديث حالة الشكوى"
          : "Failed to update complaint status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] bg-transparent">
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="relative flex flex-col items-center"
        >
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
            {lang === "ar" ? "جاري تحميل الشكاوى..." : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "الشكاوى" : "Complaints"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
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
        {lang === "ar" ? "الشكاوى" : "Complaints"}
      </h2>

      {/* Status Filter */}
      <div className="mb-6 flex justify-end gap-2">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <label className="font-medium text-gray-700 dark:text-gray-300">
            {lang === "ar" ? "تصفية حسب الحالة:" : "Filter by status:"}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100"
          >
            <option value="all">{lang === "ar" ? "الكل" : "All"}</option>
            <option value="pending">
              {lang === "ar" ? "معلقة" : "Pending"}
            </option>
            <option value="reviewed">
              {lang === "ar" ? "تمت المراجعة" : "Reviewed"}
            </option>
            <option value="resolved">
              {lang === "ar" ? "تم الحل" : "Resolved"}
            </option>
            <option value="rejected">
              {lang === "ar" ? "مرفوضة" : "Rejected"}
            </option>
          </select>
        </div>
        {/* Refresh Button */}
        <div className="flex gap-2">
          <button
            onClick={() => fetchComplaints(statusFilter, page)}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800">
            <tr>
              {[
                "#",
                lang === "ar" ? "السبب" : "Reason",
                lang === "ar" ? "الوصف" : "Description",
                lang === "ar" ? "الحالة" : "Status",
                lang === "ar" ? "المستخدم" : "User",
                lang === "ar" ? "الإجراءات" : "Actions",
              ].map((title) => (
                <th
                  key={title}
                  className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {complaints.length ? (
              complaints.map((c, idx) => (
                <tr
                  key={c._id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                >
                  <td
                    className={`py-3 px-4 text-sm font-medium text-gray-800 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-medium text-gray-800 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {c.reason}
                  </td>
                  <td
                    className={`py-3 px-4 text-sm font-medium text-gray-800 dark:text-white ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
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
                      {c.status === "pending"
                        ? lang === "ar"
                          ? "معلقة"
                          : "Pending"
                        : c.status === "reviewed"
                        ? lang === "ar"
                          ? "رُجعت"
                          : "Reviewed"
                        : c.status === "resolved"
                        ? lang === "ar"
                          ? "تم الحل"
                          : "Solved"
                        : c.status === "rejected"
                        ? lang === "ar"
                          ? "مرفوضة"
                          : "Refused"
                        : c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                    {c.userId?.name ||
                      c.userId?.phone?.number ||
                      (lang === "ar" ? "مجهول" : "Anonymous")}
                  </td>
                  <td className="py-3 px-4 flex gap-1">
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "rejected")}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {lang === "ar" ? "رفض" : "Reject"}
                    </button>
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "resolved")}
                      className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {lang === "ar" ? "حل" : "Solve"}
                    </button>
                    <button
                      disabled={updatingId === c._id}
                      onClick={() => updateStatus(c._id, "reviewed")}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {lang === "ar" ? "مراجعة" : "Reviewed"}
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
                  {lang === "ar" ? "لا توجد شكاوى" : "No complaints found"}
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
