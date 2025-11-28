"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useLanguage } from "../../context/LanguageContext";

type Role = "customer" | "store_owner";

interface User {
  id: string;
  name: string;
  phone: string | { number: string; isVerified: boolean };
}
interface APIUser {
  _id?: string;
  id?: string;
  name: string;
  phone: string | { number: string; isVerified: boolean };
}

const Notifications = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [role, setRole] = useState<Role>("store_owner");

  const [formData, setFormData] = useState({
    NotificationTitle: "",
    NotificationMessage: "",
    schedule: "instant" as "instant" | "future",
    futureDate: new Date(),
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  const normalizePhone = (
    phone: string | { number: string; isVerified: boolean }
  ) => {
    if (!phone) return "";
    if (typeof phone === "string") return phone;
    return phone.number || "";
  };

  // Fetch Users
  const fetchSelectedUsers = async (role: Role, query: string) => {
    if (!token) return;

    setLoadingUsers(true);

    try {
      const url =
        query === "all"
          ? `https://api.tik-mall.com/admin/api/users/${role}/all?page=1&limit=100`
          : `https://api.tik-mall.com/admin/api/users/${role}/${query}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      let users: User[] = [];
      if (data?.user) users = [data.user];
      else if (data?.users) users = data.users;

      const normalized = users.map((u: APIUser) => ({
        id: u._id || u.id || "",
        name: u.name,
        phone: typeof u.phone === "string" ? u.phone : u.phone?.number || "",
      }));

      setSelectedUsers(normalized);
      setOriginalUsers(normalized);
    } catch (error) {
      console.error(error);
      toast.error(
        lang === "ar" ? "فشل جلب المستخدمين" : "Failed to fetch users"
      );
      setSelectedUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initial fetch and fetch on role change
  useEffect(() => {
    fetchSelectedUsers(role, "all");
  }, [token, role]);

  // Search handler
  useEffect(() => {
    if (!search.trim()) {
      setSelectedUsers(originalUsers);
      return;
    }
    fetchSelectedUsers(role, search);
  }, [search, token, originalUsers, role]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleUserCheck = (id: string) => {
    setCheckedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (checkedUsers.length === selectedUsers.length) {
      setCheckedUsers([]);
    } else {
      setCheckedUsers(selectedUsers.map((u) => u.id));
    }
  };

  const handleSave = async (data: typeof formData) => {
    if (loadingSend) return;

    if (!data.NotificationTitle.trim() || !data.NotificationMessage.trim()) {
      toast.error(
        lang === "ar"
          ? "يرجى إدخال العنوان والرسالة"
          : "Please enter both title and message."
      );
      return;
    }
    if (checkedUsers.length === 0) {
      toast.error(
        lang === "ar"
          ? "يرجى اختيار مستخدم واحد على الأقل"
          : "Please select at least one user."
      );
      return;
    }

    setLoadingSend(true);

    const payload = {
      userIds: checkedUsers,
      title: data.NotificationTitle,
      body: data.NotificationMessage,
      type: "general",
      data: {},
      delay:
        data.schedule === "future"
          ? Math.floor((data.futureDate.getTime() - Date.now()) / 1000)
          : 0,
    };

    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/notify/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success(
        lang === "ar"
          ? "تم إرسال الإشعار بنجاح!"
          : "Notification sent successfully!"
      );

      setFormData({
        NotificationTitle: "",
        NotificationMessage: "",
        schedule: "instant",
        futureDate: new Date(),
      });
      setCheckedUsers([]);
      setSearch("");
    } catch {
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء إرسال الإشعار"
          : "Error sending notification"
      );
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <div className="flex justify-between items-center mb-8">
        <h2
          className="flex items-center gap-3 text-3xl md:text-4xl font-bold"
          style={{ color: "#456FFF" }}
        >
          <BellAlertIcon className="w-10 h-10 text-blue-600" />
          {lang === "ar" ? "إرسال إشعارات" : "Send Notifications"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Notification Content & Scheduling */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notification Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2">
              <BellAlertIcon className="w-6 h-6 text-blue-600" />
              {lang === "ar" ? "محتوى الإشعار" : "Notification Content"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === "ar" ? "عنوان الإشعار" : "Notification Title"}
                </label>
                <input
                  type="text"
                  name="NotificationTitle"
                  value={formData.NotificationTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={
                    lang === "ar"
                      ? "مثال: تخفيضات كبيرة اليوم!"
                      : "e.g. Big Sale Today!"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  {lang === "ar" ? "نص الرسالة" : "Notification Message"}
                </label>
                <textarea
                  name="NotificationMessage"
                  value={formData.NotificationMessage}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  placeholder={
                    lang === "ar"
                      ? "اكتب رسالتك هنا..."
                      : "Write your message..."
                  }
                />
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-5 text-gray-900 dark:text-white">
              {lang === "ar" ? "موعد الإرسال" : "Scheduling"}
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="instant"
                  checked={formData.schedule === "instant"}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {lang === "ar" ? "إرسال فوري" : "Instant Sending"}
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  value="future"
                  checked={formData.schedule === "future"}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                  {lang === "ar" ? "جدولة لوقت لاحق" : "Schedule for Future"}
                </span>
              </label>

              {formData.schedule === "future" && (
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {lang === "ar"
                      ? "اختر التاريخ والوقت"
                      : "Select Date & Time"}
                  </label>
                  <Flatpickr
                    value={formData.futureDate}
                    onChange={([date]) =>
                      setFormData({ ...formData, futureDate: date })
                    }
                    options={{
                      enableTime: true,
                      dateFormat: lang === "ar" ? "d/m/Y h:i K" : "m/d/Y h:i K",
                      time_24hr: false,
                      locale: lang === "ar" ? "ar" : "en",
                    }}
                    className="w-full px-4 py-3 text-lg font-medium text-gray-900 bg-white border-2 border-gray-300 rounded-xl shadow-sm hover:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 dark:bg-gray-900 dark:text-white dark:border-gray-600 transition-all cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Users List + Role Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 space-y-4">
            {/* Role Selector */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {lang === "ar" ? "اختر نوع المستخدمين" : "Select User Role"}
              </h3>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="store_owner"
                    checked={role === "store_owner"}
                    onChange={() => setRole("store_owner")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    {lang === "ar" ? "أصحاب المتاجر" : "Store Owners"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="customer"
                    checked={role === "customer"}
                    onChange={() => setRole("customer")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">
                    {lang === "ar" ? "العملاء" : "Customers"}
                  </span>
                </label>
              </div>
            </div>

            {/* Recipients Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {lang === "ar" ? "المستلمون" : "Recipients"}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                  ({checkedUsers.length}/{selectedUsers.length})
                </span>
              </h3>

              <button
                onClick={toggleSelectAll}
                className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                {checkedUsers.length === selectedUsers.length
                  ? lang === "ar"
                    ? "إلغاء الكل"
                    : "Unselect All"
                  : lang === "ar"
                  ? "تحديد الكل"
                  : "Select All"}
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                lang === "ar" ? "ابحث بالهاتف..." : "Search by phone..."
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto px-6 py-3">
            {loadingUsers ? (
              <div className="flex justify-center items-center py-14">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="animate-spin h-12 w-12 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                  </svg>
                  <span className="text-blue-600 font-medium text-base">
                    {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                  </span>
                </div>
              </div>
            ) : selectedUsers.length === 0 ? (
              <p className="text-center py-10 text-gray-500 dark:text-gray-400">
                {lang === "ar" ? "لا يوجد مستخدمون" : "No users found."}
              </p>
            ) : (
              <ul className="space-y-2 mt-1">
                {selectedUsers.map((u) => (
                  <li
                    key={u.id}
                    onClick={() => toggleUserCheck(u.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={checkedUsers.includes(u.id)}
                      onChange={() => toggleUserCheck(u.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {u.name || (lang === "ar" ? "بدون اسم" : "No Name")}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {normalizePhone(u.phone) ||
                          (lang === "ar" ? "لا يوجد رقم" : "No phone")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-10 text-center">
        <button
          onClick={() => handleSave(formData)}
          disabled={loadingSend}
          className={`px-12 py-4 rounded-2xl text-white text-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl ${
            loadingSend
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {loadingSend
            ? lang === "ar"
              ? "جاري الإرسال..."
              : "Sending..."
            : lang === "ar"
            ? "إرسال الإشعار الآن"
            : "Send Notification Now"}
        </button>
      </div>
    </div>
  );
};

export default Notifications;
