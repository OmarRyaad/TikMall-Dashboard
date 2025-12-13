"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { FcGoogle } from "react-icons/fc";
import { useLanguage } from "../../../context/LanguageContext";

interface Customer {
  _id: string;
  name: string;
  phone: { number: string; isVerified?: boolean };
  isActive: boolean;
  isSocialLogin?: boolean;
  email?: { mail: string; isVerified: boolean };
  token?: string;
  role?: string;
}

const Customers = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchCustomers = async (pageNumber = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `https://api.tik-mall.com/admin/api/users/customers/${searchTerm}`
        : `https://api.tik-mall.com/admin/api/users/customer/all?page=${pageNumber}&limit=10`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error("Failed to fetch customers!");
      const data = await res.json();
      setCustomers(data.users || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch {
      toast.error(
        lang === "ar" ? "فشل جلب العملاء!" : "Failed to fetch customers!"
      );
    } finally {
      setLoading(false);
    }
  };

  const searchCustomer = async () => {
    if (!searchValue.trim()) {
      fetchCustomers();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/customers/${searchValue}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Customer not found!");

      const data = await res.json();
      setCustomers(data.users || []);
    } catch {
      toast.error(lang === "ar" ? "فشل في البحث!" : "Failed to search!");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivation = async (id: string, current: boolean) => {
    try {
      setActionLoading(true);

      const endpoint = current
        ? `https://api.tik-mall.com/admin/api/suspend/${id}` // Suspend if currently active
        : `https://api.tik-mall.com/admin/api/reactivate/${id}`; // Reactivate if currently inactive

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(
        current
          ? lang === "ar"
            ? "تم إلغاء التفعيل"
            : "Deactivated"
          : lang === "ar"
          ? "تم التفعيل"
          : "Activated"
      );

      fetchCustomers(page);
    } catch {
      toast.error(
        lang === "ar" ? "خطأ أثناء تغيير الحالة" : "Error updating status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to delete customer");

      toast.success(
        lang === "ar"
          ? "تم حذف العميل بنجاح!"
          : "Customer deleted successfully!"
      );
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      fetchCustomers();
    } catch {
      toast.error(
        lang === "ar" ? "خطأ أثناء حذف العميل" : "Error deleting customer"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

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
              {lang === "ar" ? "العملاء" : "Customers"}
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
        autoClose={3000}
        toastClassName="!z-[9999]"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-[#456FFF]">
          <UserIcon className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "العملاء" : "Customers"}
        </h2>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 w-full sm:w-auto dark:text-gray-300"
            placeholder={
              lang === "ar" ? "ابحث عن عميل..." : "Search for a customer..."
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
          />

          <button
            onClick={searchCustomer}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            {lang === "ar" ? "بحث" : "Search"}
          </button>
          {/* Refresh Button */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchCustomers()}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              {lang === "ar" ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden w-full">
        {customers.length > 0 ? (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] md:min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      #
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الاسم" : "Name"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "رقم الهاتف" : "Phone"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      Gmail
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الحالة" : "Status"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs font-medium text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((cust, idx) => (
                    <tr
                      key={cust._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td
                        className={`px-4 md:px-6 py-3 font-medium dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {idx + 1}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 font-medium dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {cust.name}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 font-medium dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {cust.phone?.number || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        {cust.email?.mail ? (
                          <div
                            className="flex items-center gap-1 cursor-pointer"
                            title={cust.email.mail}
                          >
                            <FcGoogle className={`"w-5 h-5 text-blue-500"`} />
                            {/* <span className="truncate max-w-[120px]">
                              {cust.email.mail}
                            </span> */}
                          </div>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                      </td>

                      <td className="px-4 md:px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cust.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cust.isActive
                            ? lang === "ar"
                              ? "نشط"
                              : "Active"
                            : lang === "ar"
                            ? "غير نشط"
                            : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 flex gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() =>
                            toggleActivation(cust._id, cust.isActive)
                          }
                          className={`px-2 py-1 text-sm rounded text-white ${
                            cust.isActive
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {cust.isActive
                            ? lang === "ar"
                              ? "إلغاء التفعيل"
                              : "Deactivate"
                            : lang === "ar"
                            ? "تفعيل"
                            : "Activate"}
                        </button>
                        <button
                          onClick={() => {
                            setCustomerToDelete(cust._id);
                            setDeleteModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
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
          <div className="flex flex-col items-center justify-center py-20 col-span-full">
            <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                />
              </svg>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium">
              {lang === "ar" ? "لا يوجد عملاء" : "No customers found."}
            </p>

            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {lang === "ar"
                ? "حاول إضافة عملاء جدد"
                : "Try adding new store owners."}
            </p>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {lang === "ar"
                  ? "هل أنت متأكد من حذف هذا العميل؟ هذا الإجراء لا يمكن التراجع عنه."
                  : "Are you sure you want to delete this customer? This action cannot be undone."}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setCustomerToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>

                <button
                  onClick={() =>
                    customerToDelete && handleDelete(customerToDelete)
                  }
                  disabled={deleteLoading}
                  className={`rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors ${
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

export default Customers;
