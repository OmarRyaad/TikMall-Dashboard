"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../context/LanguageContext";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

interface User {
  _id: string;
  name: string;
  phone: { number: string };
  email: { mail: string; isVerified: boolean };
}

interface Complaint {
  _id: string;
  userId: User | null;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "reviewed" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const ContactUs = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // For custom delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken");

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/all/complaints",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch complaints");
      const data = await res.json();
      const sorted = data.complaints.sort(
        (a: Complaint, b: Complaint) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setComplaints(sorted);
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "فشل في جلب الشكاوى" : "Failed to fetch complaints"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string) => {
    try {
      setLoadingIds((prev) => [...prev, id]);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/complaint/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "resolved" }),
        }
      );
      if (!res.ok) throw new Error("Failed to update complaint");
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "resolved" } : c))
      );
      toast.success(
        lang === "ar" ? "تم وضع الشكوى كمراجعة" : "Complaint marked as reviewed"
      );
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "فشل في تحديث الشكوى" : "Failed to update complaint"
      );
    } finally {
      setLoadingIds((prev) => prev.filter((lid) => lid !== id));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoadingId(id);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/complaint/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete complaint");
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      toast.success(lang === "ar" ? "تم حذف الشكوى" : "Complaint deleted");
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "فشل في حذف الشكوى" : "Failed to delete complaint"
      );
    } finally {
      setDeleteLoadingId(null);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints =
    filter === "all"
      ? complaints
      : complaints.filter((c) => c.status === filter);

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
            {lang === "ar" ? "جاري التحميل" : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "الشكاوي" : "Complaints"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex justify-between items-center mb-8">
          <h2
            className="flex items-center gap-3 text-3xl md:text-4xl font-bold"
            style={{ color: "#456FFF" }}
          >
            <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-blue-600" />
            {lang === "ar" ? "رسائل التواصل" : "Contact Messages"}
          </h2>
        </div>

        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value as "all" | "pending" | "resolved")
          }
          className="border border-gray-300 dark:border-gray-700 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-200 transition"
        >
          <option value="all">{lang === "ar" ? "الكل" : "All"}</option>
          <option value="pending">
            {lang === "ar" ? "قيد الانتظار" : "Pending"}
          </option>
          <option value="resolved">
            {lang === "ar" ? "تمت المراجعة" : "Reviewed"}
          </option>
        </select>
      </div>
      {/* Empty State */}
      {filteredComplaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center text-gray-500 dark:text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mb-6 text-gray-300 dark:text-gray-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold mb-2">
            {lang === "ar" ? "لا توجد شكاوى" : "No complaints found"}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 max-w-md">
            {lang === "ar"
              ? "لا توجد شكاوى للعرض حالياً. يرجى المحاولة لاحقاً."
              : "There are currently no complaints to display. Please check back later."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-xl transition relative bg-white dark:bg-gray-800"
            >
              {/* Accent bar */}
              <div
                className={`absolute top-0 left-0 h-1 w-full rounded-t-xl ${
                  c.status === "pending" ? "bg-yellow-400" : "bg-green-500"
                }`}
              />

              <div className="space-y-2">
                <p>
                  <strong>{lang === "ar" ? "الاسم:" : "Name:"}</strong>{" "}
                  {c?.userId?.name}
                </p>
                <p>
                  <strong>{lang === "ar" ? "الهاتف:" : "Phone:"}</strong>{" "}
                  {c?.userId?.phone?.number}
                </p>
                <p>
                  <strong>
                    {lang === "ar" ? "البريد الإلكتروني:" : "Email:"}
                  </strong>{" "}
                  {c?.userId?.email?.mail || "N/A"}{" "}
                  <span
                    className={
                      c?.userId?.email?.isVerified
                        ? "text-green-500"
                        : "text-red-400"
                    }
                  >
                    (
                    {c?.userId?.email?.isVerified
                      ? lang === "ar"
                        ? "تم التحقق"
                        : "Verified"
                      : lang === "ar"
                      ? "لم يتم التحقق"
                      : "Unverified"}
                    )
                  </span>
                </p>
                <p>
                  <strong>{lang === "ar" ? "السبب:" : "Reason:"}</strong>{" "}
                  {c?.reason}
                </p>
                <p>
                  <strong>{lang === "ar" ? "الوصف:" : "Description:"}</strong>{" "}
                  {c.description}
                </p>
                <p>
                  <strong>{lang === "ar" ? "الحالة:" : "Status:"}</strong>{" "}
                  <span
                    className={
                      c.status === "pending"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }
                  >
                    {c.status === "pending"
                      ? lang === "ar"
                        ? "قيد الانتظار"
                        : "Pending"
                      : lang === "ar"
                      ? "تمت المراجعة"
                      : "Reviewed"}
                  </span>
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  <strong>
                    {lang === "ar" ? "تاريخ الإنشاء:" : "Created At:"}
                  </strong>{" "}
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                {c.status === "pending" && (
                  <button
                    onClick={() => handleReview(c._id)}
                    disabled={loadingIds.includes(c._id)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    {loadingIds.includes(c._id)
                      ? lang === "ar"
                        ? "جاري المعالجة..."
                        : "Loading..."
                      : lang === "ar"
                      ? "تمت المراجعة"
                      : "Reviewed"}
                  </button>
                )}
                <button
                  onClick={() => setConfirmDeleteId(c._id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-sm w-full text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <p className="mb-6 text-lg">
                {lang === "ar"
                  ? "هل أنت متأكد من حذف هذه الشكوى؟"
                  : "Are you sure you want to delete this complaint?"}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    if (!confirmDeleteId) return;
                    const idToDelete = confirmDeleteId;
                    setConfirmDeleteId(null);
                    handleDelete(idToDelete);
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  disabled={deleteLoadingId === confirmDeleteId}
                >
                  {deleteLoadingId === confirmDeleteId
                    ? lang === "ar"
                      ? "جاري الحذف..."
                      : "Deleting..."
                    : lang === "ar"
                    ? "حذف"
                    : "Delete"}
                </button>

                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 transition"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactUs;
