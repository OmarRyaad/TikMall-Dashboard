"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  UserIcon,
  VideoCameraIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  LockClosedIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

interface Permissions {
  manageAdmins?: boolean;
  manageStoreOwners?: boolean;
  manageMediaAndStreams?: boolean;
  manageDepartmentsAndFaqs?: boolean;
  manageCustomers?: boolean;
  manageComplains?: boolean;
  manageSendNotifications?: boolean;
  manageStatistics?: boolean;
}

interface Phone {
  number: string;
  isVerified?: boolean;
}

interface ApiModerator {
  _id: string;
  name: string;
  phone: Phone;
  password?: string;
  isActive: boolean;
  permissions: Permissions;
  isSuperAdmin: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Moderator {
  _id?: string;
  name: string;
  phone: string;
  password?: string;
  active: boolean;
  manageAdmins?: boolean;
  manageStoreOwners?: boolean;
  manageMediaAndStreams?: boolean;
  manageDepartmentsAndFaqs?: boolean;
  manageCustomers?: boolean;
  manageComplains?: boolean;
  manageSendNotifications?: boolean;
  manageStatistics?: boolean;
}

interface Pagination {
  total: number;
  limit: number;
  page: number;
  pages: number;
}

interface FetchModeratorsResponse {
  users: ApiModerator[];
  pagination?: Pagination;
}

const Moderators = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Moderator>>({
    active: true,
  });

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [moderatorToDelete, setModeratorToDelete] = useState<Moderator | null>(
    null
  );

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchModerators = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/admin/all?page=${pageNumber}&limit=10`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error("Failed to fetch moderators");
      const data = (await res.json()) as FetchModeratorsResponse;
      const formatted: Moderator[] = data.users
        .filter((u) => !u.isSuperAdmin)
        .map((u) => ({
          _id: u._id,
          name: u.name,
          phone: u.phone.number,
          active: u.isActive,
          manageAdmins: u.permissions.manageAdmins ?? false,
          manageStoreOwners: u.permissions.manageStoreOwners ?? false,
          manageMediaAndStreams: u.permissions.manageMediaAndStreams ?? false,
          manageDepartmentsAndFaqs:
            u.permissions.manageDepartmentsAndFaqs ?? false,
          manageCustomers: u.permissions.manageCustomers ?? false,
          manageComplains: u.permissions.manageComplains ?? false,
          manageSendNotifications:
            u.permissions.manageSendNotifications ?? false,
          manageStatistics: u.permissions.manageStatistics ?? false,
        }));
      setModerators(formatted);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err) {
      toast.error(
        lang === "ar" ? "فشل تحميل المشرفون" : "Failed to load moderators"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators(page);
  }, [page]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (moderator: Moderator) => {
    setFormData({ ...moderator, password: "" });
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      active: true,
      manageAdmins: false,
      manageStoreOwners: false,
      manageMediaAndStreams: false,
      manageDepartmentsAndFaqs: false,
      manageCustomers: false,
      manageComplains: false,
      manageSendNotifications: false,
      manageStatistics: false,
    });
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({ active: true });
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      (!isEditMode && !formData.password)
    ) {
      toast.error(
        lang === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        phone: { number: formData.phone },
        ...(formData.password && { password: formData.password }),
        isActive: formData.active ?? true,
        permissions: {
          manageAdmins: !!formData.manageAdmins,
          manageStoreOwners: !!formData.manageStoreOwners,
          manageMediaAndStreams: !!formData.manageMediaAndStreams,
          manageDepartmentsAndFaqs: !!formData.manageDepartmentsAndFaqs,
          manageCustomers: !!formData.manageCustomers,
          manageComplains: !!formData.manageComplains,
          manageSendNotifications: !!formData.manageSendNotifications,
          manageStatistics: !!formData.manageStatistics,
        },
      };

      const url = isEditMode
        ? `https://api.tik-mall.com/admin/api/modify-permissions/${formData._id}`
        : "https://api.tik-mall.com/admin/api/child";

      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok)
        throw new Error(
          (result as { message?: string }).message || "Operation failed"
        );

      toast.success(
        isEditMode
          ? lang === "ar"
            ? "تم تحديث المدير بنجاح!"
            : "Moderator updated!"
          : lang === "ar"
          ? "تم إنشاء المدير بنجاح!"
          : "Moderator created!"
      );
      fetchModerators();
      setIsOpen(false);
    } catch (error) {
      toast.error(
        (error as Error).message ||
          (lang === "ar" ? "حدث خطأ ما" : "Something went wrong")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (moderator: Moderator) => {
    setModeratorToDelete(moderator);
    setDeleteModalOpen(true);
  };

  const handleDelete = async (moderator: Moderator) => {
    if (!moderator._id) return;
    try {
      setDeleteLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/delete/${moderator._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      toast.success(
        lang === "ar" ? "تم حذف المدير بنجاح!" : "Moderator deleted!"
      );
      fetchModerators();
      setDeleteModalOpen(false);
      setModeratorToDelete(null);
    } catch (err) {
      toast.error(
        (err as Error).message ||
          (lang === "ar" ? "حدث خطأ أثناء الحذف" : "Something went wrong")
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            {lang === "ar" ? "جاري تحميل" : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "المشرفون" : "Moderators"}
            </span>
            ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`p-4 md:p-6 ${isRTL ? "text-right" : "text-left"}`}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-[#456FFF]">
          <UserGroupIcon className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "المشرفون" : "Moderators"}
        </h2>

        <button
          onClick={handleAdd}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300 self-start md:self-auto"
        >
          + {lang === "ar" ? "إضافة مدير" : "Add Moderator"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        {moderators.length > 0 ? (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[650px]">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {[
                      "#",
                      lang === "ar" ? "الاسم" : "Name",
                      lang === "ar" ? "رقم الهاتف" : "Phone",
                      lang === "ar" ? "الحالة" : "Status",
                      lang === "ar" ? "الإجراءات" : "Actions",
                    ].map((title, i) => (
                      <th
                        key={i}
                        className={`px-4 md:px-6 py-3 ${
                          isRTL ? "text-right" : "text-left"
                        } text-xs font-medium text-gray-500 uppercase`}
                      >
                        {title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {moderators.map((mod, idx) => (
                    <tr
                      key={mod._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {idx + 1}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {mod.name}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {mod.phone}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            mod.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {mod.active
                            ? lang === "ar"
                              ? "نشط"
                              : "Active"
                            : lang === "ar"
                            ? "غير نشط"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(mod)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                        >
                          {lang === "ar" ? "تعديل" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mod)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          {lang === "ar" ? "حذف" : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pb-2 flex gap-2 justify-center">
                {(() => {
                  const pages: (number | string)[] = [];

                  const addPage = (p: number | string) => {
                    if (!pages.includes(p)) pages.push(p);
                  };

                  const visible = 2;

                  addPage(1);

                  if (page > visible + 2) addPage("dots-start");

                  for (
                    let i = Math.max(2, page - visible);
                    i <= Math.min(totalPages - 1, page + visible);
                    i++
                  ) {
                    addPage(i);
                  }

                  if (page < totalPages - (visible + 1)) addPage("dots-end");

                  addPage(totalPages);

                  return pages.map((p, idx) =>
                    typeof p === "string" ? (
                      <span
                        key={idx}
                        className="px-2 text-gray-500 dark:text-gray-300"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-0.5 rounded min-w-[32px] text-sm font-medium transition-all ${
                          p === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {lang === "ar" ? "لا يوجد مدراء" : "No moderators found."}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-1xl p-6 md:p-7
                max-h-[72vh] overflow-y-auto"
              >
                <h3 className="text-2xl font-bold mb-6">
                  {isEditMode
                    ? lang === "ar"
                      ? "تعديل المدير"
                      : "Edit Moderator"
                    : lang === "ar"
                    ? "إضافة مدير جديد"
                    : "Add New Moderator"}
                </h3>

                <div className="space-y-5">
                  <input
                    type="text"
                    name="name"
                    placeholder={lang === "ar" ? "الاسم الكامل" : "Full Name"}
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder={
                      lang === "ar"
                        ? "رقم الهاتف (مثال: +20123456789)"
                        : "Phone Number (e.g. +20123456789)"
                    }
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                  />
                  {!isEditMode && (
                    <input
                      type="password"
                      name="password"
                      placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                    />
                  )}
                </div>

                {/* Permissions */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LockClosedIcon className="w-6 h-6 text-yellow-500" />{" "}
                    {lang === "ar" ? "الصلاحيات" : "Permissions"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        key: "manageAdmins",
                        label:
                          lang === "ar" ? "إدارة المديرين" : "Manage Admins",
                        Icon: UserIcon,
                      },
                      {
                        key: "manageStoreOwners",
                        label:
                          lang === "ar"
                            ? "إدارة المتاجر"
                            : "Manage Store Owners",
                        Icon: ShoppingBagIcon,
                      },
                      {
                        key: "manageMediaAndStreams",
                        label:
                          lang === "ar"
                            ? "البث ووسائط الإعلام"
                            : "Media & Streams",
                        Icon: VideoCameraIcon,
                      },
                      {
                        key: "manageDepartmentsAndFaqs",
                        label:
                          lang === "ar"
                            ? "الأقسام و الأسئلة الشائعة"
                            : "Departments & FAQs",
                        Icon: DocumentTextIcon,
                      },
                      {
                        key: "manageCustomers",
                        label:
                          lang === "ar" ? "إدارة العملاء" : "Manage Customers",
                        Icon: UserGroupIcon,
                      },
                      {
                        key: "manageComplains",
                        label: lang === "ar" ? "الشكاوى" : "Complains",
                        Icon: UserGroupIcon,
                      },
                      {
                        key: "manageSendNotifications",
                        label:
                          lang === "ar"
                            ? "إرسال الإشعارات"
                            : "Send Notifications",
                        Icon: LockClosedIcon,
                      },
                      {
                        key: "manageStatistics",
                        label: lang === "ar" ? "الإحصائيات" : "Statistics",
                        Icon: LockClosedIcon,
                      },
                    ].map(({ key, label, Icon }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-500" />
                          <span className="font-medium">{label}</span>
                        </div>
                        <input
                          type="checkbox"
                          name={key}
                          checked={!!formData[key as keyof Moderator]}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                  >
                    {loading
                      ? lang === "ar"
                        ? "جاري الحفظ..."
                        : "Saving..."
                      : isEditMode
                      ? lang === "ar"
                        ? "تحديث"
                        : "Update"
                      : lang === "ar"
                      ? "إنشاء"
                      : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && moderatorToDelete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {lang === "ar"
                  ? "هل أنت متأكد من حذف"
                  : "Are you sure you want to delete"}{" "}
                <strong>{moderatorToDelete.name}</strong>؟
              </p>
              <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setModeratorToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() =>
                    moderatorToDelete && handleDelete(moderatorToDelete)
                  }
                  disabled={deleteLoading}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    deleteLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading
                    ? lang === "ar"
                      ? "جاري الحذف..."
                      : "Deleting..."
                    : lang === "ar"
                    ? "حذف"
                    : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Moderators;
