"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

interface StoreOwner {
  _id: string;
  name: string;
  phone: { number: string };
  isActive: boolean;
}

const StoreOwners = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchStoreOwners = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/store_owner/all?page=${pageNumber}&limit=10`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const data = await res.json();

      setStoreOwners(data.users || data.data?.results || []);
      setTotalPages(data.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  const searchStoreOwner = async () => {
    if (!searchValue.trim()) {
      fetchStoreOwners();
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/store_owner/${searchValue}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Store owner not found");

      const data = await res.json();
      setStoreOwners(data.users || []);
    } catch {
      toast.error(lang === "ar" ? "فشل في البحث!" : "Failed to search!");
      setStoreOwners([]);
    } finally {
      setLoading(false);
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

      if (!res.ok) throw new Error("Failed to delete store owner");

      toast.success(
        lang === "ar"
          ? "تم حذف صاحب المتجر بنجاح!"
          : "Store owner deleted successfully!"
      );

      setDeleteModalOpen(false);
      setOwnerToDelete(null);
      fetchStoreOwners();
    } catch {
      toast.error(
        lang === "ar"
          ? "خطأ أثناء حذف صاحب المتجر"
          : "Error deleting store owner"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreOwners(page);
  }, [page]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>

          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            {lang === "ar" ? "جاري تحميل" : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "أصحاب المتاجر" : "Store Owners"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

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

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-[#456FFF]">
          <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "أصحاب المتاجر" : "Store Owners"}
        </h2>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 w-full sm:w-auto dark:text-gray-300"
            placeholder={
              lang === "ar"
                ? "ابحث عن صاحب متجر..."
                : "Search for a store owner..."
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchStoreOwner()}
          />

          <button
            onClick={searchStoreOwner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            {lang === "ar" ? "بحث" : "Search"}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden w-full">
        {storeOwners.length > 0 ? (
          <>
            {/* Table Scroll Container */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] md:min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      #
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الاسم" : "Name"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "رقم الهاتف" : "Phone"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الحالة" : "Status"}
                    </th>
                    <th
                      className={`px-4 md:px-6 py-3 text-xs text-gray-500 uppercase ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    >
                      {lang === "ar" ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {storeOwners.map((owner, idx) => (
                    <tr
                      key={owner._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {idx + 1 + (page - 1) * 10}{" "}
                        {/* Adjust index for pagination */}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {owner.name}
                      </td>
                      <td
                        className={`px-4 md:px-6 py-3 text-sm dark:text-gray-300 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {owner.phone?.number || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            owner.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {owner.isActive
                            ? lang === "ar"
                              ? "نشط"
                              : "Active"
                            : lang === "ar"
                            ? "غير نشط"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 md:px-6 py-3">
                        <button
                          onClick={() => {
                            setOwnerToDelete(owner._id);
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
              <div
                className={`pb-2 flex gap-2 ${
                  isRTL ? "justify-end" : "justify-center"
                }`}
              >
                {(() => {
                  const visibleCount = 5;
                  const half = Math.floor(visibleCount / 2);

                  let start = page - half;
                  let end = page + half;

                  if (start < 1) {
                    start = 1;
                    end = Math.min(totalPages, visibleCount);
                  }

                  if (end > totalPages) {
                    end = totalPages;
                    start = Math.max(1, totalPages - visibleCount + 1);
                  }

                  if (totalPages <= visibleCount) {
                    start = 1;
                    end = totalPages;
                  }

                  return Array.from({ length: end - start + 1 }, (_, i) => {
                    const p = start + i;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-3 py-0.5 rounded min-w-[36px] text-sm font-medium transition-all ${
                          p === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            {lang === "ar" ? "لا يوجد أصحاب متاجر" : "No store owners found."}
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
                  ? "هل أنت متأكد من حذف هذا صاحب المتجر؟ هذا الإجراء لا يمكن التراجع عنه."
                  : "Are you sure you want to delete this store owner? This action cannot be undone."}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setOwnerToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>

                <button
                  onClick={() => ownerToDelete && handleDelete(ownerToDelete)}
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

export default StoreOwners;
