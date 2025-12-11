"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { useLanguage } from "../../context/LanguageContext";

type SelectMode = "all" | "customer" | "store_owner" | "phone";
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

  const [mode, setMode] = useState<SelectMode>("store_owner");

  const [formData, setFormData] = useState({
    NotificationTitle: "",
    NotificationMessage: "",
    schedule: "instant" as "instant" | "future",
    futureDate: new Date(),
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
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

  const fetchSelectedUsers = async (mode: SelectMode, query: string) => {
    if (!token) return;
    setLoadingUsers(true);

    try {
      const url =
        mode === "phone" && query.trim()
          ? `https://api.tik-mall.com/admin/api/users/all/${query}`
          : `https://api.tik-mall.com/admin/api/users/${mode}/${query}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (mode === "phone") {
        let users: User[] = [];

        if (data?.user) users = [data.user];
        else if (data?.users) users = data.users;

        const normalized = users.map((u: APIUser) => ({
          id: u._id || u.id || "",
          name: u.name,
          phone: typeof u.phone === "string" ? u.phone : u.phone?.number || "",
        }));

        setSelectedUsers(normalized);
        setCheckedUsers([]);
      }
    } catch {
      setSelectedUsers([]);
      setCheckedUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (mode === "phone") return;

    const fetchUsers = async () => {
      if (!token) return;

      setLoadingUsers(true);
      try {
        const res = await fetch(
          `https://api.tik-mall.com/admin/api/users/${mode}/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        const users: User[] = (data.users || []).map((u: APIUser) => ({
          id: u._id || u.id || "",
          name: u.name,
          phone: typeof u.phone === "string" ? u.phone : u.phone?.number || "",
        }));

        setSelectedUsers(users);
        setCheckedUsers(users.map((u) => u.id));
      } catch {
        setSelectedUsers([]);
        setCheckedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [mode, token]);

  useEffect(() => {
    if (mode !== "phone") return;

    if (!search.trim()) {
      setSelectedUsers([]);
      setCheckedUsers([]);
      return;
    }

    fetchSelectedUsers("phone", search);
  }, [search, mode]);

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

  const handleModeChange = (newMode: SelectMode) => {
    setMode(newMode);

    if (newMode !== "phone") {
      setSearch("");
      setSelectedUsers([]);
      setCheckedUsers([]);
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
      type: "info",
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
      className="w-full p-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
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

      <div className="grid grid-cols-1 gap-8">
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
          <div className="px-8 py-3 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {lang === "ar" ? "اختر نوع المستخدمين" : "Select User Role"}
              </h3>

              <div className="flex gap-4 flex-wrap">
                {/* Radio buttons */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMode"
                    value="all"
                    checked={mode === "all"}
                    onChange={() => handleModeChange("all")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {lang === "ar" ? "كل الحسابات" : "All Accounts"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMode"
                    value="store_owner"
                    checked={mode === "store_owner"}
                    onChange={() => handleModeChange("store_owner")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {lang === "ar" ? "أصحاب المتاجر" : "All Store Owners"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMode"
                    value="customer"
                    checked={mode === "customer"}
                    onChange={() => handleModeChange("customer")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {lang === "ar" ? "العملاء" : "All Customers"}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userMode"
                    value="phone"
                    checked={mode === "phone"}
                    onChange={() => handleModeChange("phone")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {lang === "ar"
                      ? "الإرسال برقم الهاتف"
                      : "Send By Phone Number"}
                  </span>
                </label>
              </div>
            </div>

            {mode === "phone" && checkedUsers.length > 0 && (
              <div className="mt-4 text-gray-700 dark:text-gray-300 font-medium">
                {lang === "ar"
                  ? `عدد الأرقام المحددة: ${checkedUsers.length}`
                  : `Selected Numbers Count: ${checkedUsers.length}`}
              </div>
            )}

            {/* Search input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={mode !== "phone"}
              placeholder={
                mode === "phone"
                  ? lang === "ar"
                    ? "ابحث بالهاتف..."
                    : "Search by phone..."
                  : lang === "ar"
                  ? "اختر (الإرسال برقم الهاتف) أولاً"
                  : "Select (Send By Phone) first"
              }
              className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl
        bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition
        focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${mode !== "phone" ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
            />
          </div>

          {/* Users List */}
          {mode === "phone" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto px-6 py-3">
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      />
                    </svg>
                    <span className="text-blue-600 font-medium text-base">
                      {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                    </span>
                  </div>
                </div>
              ) : selectedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <svg
                    className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600 animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2a4 4 0 014-4h4M5 13l4 4m0 0l4-4m-4 4V3"
                    />
                  </svg>
                  <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {lang === "ar" ? "لا يوجد مستخدمون" : "No users found."}
                  </p>
                  <p className="text-center text-gray-400 dark:text-gray-500 mt-2 text-sm">
                    {lang === "ar"
                      ? "حاول تغيير معايير البحث"
                      : "Try adjusting your search criteria."}
                  </p>
                </div>
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
          )}

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
