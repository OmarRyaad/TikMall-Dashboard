"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

interface StoreOwner {
  isApproved: boolean;
  _id: string;
  name: string;
  phone?: { number: string };
  storeName?: string;
  typeOfStore?: { ar: string; en: string }[];
  commercialRecordImg?: string;
  personaIdentityImg?: string;
  profileImg?: string;
  isActive: boolean;
}

const StoreOwners = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  // PAGINATION
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: boolean;
  }>({});

  const [searchValue, setSearchValue] = useState("");

  // Track current filter
  const [allStoreTypes, setAllStoreTypes] = useState<
    { ar: string; en: string }[]
  >([]);

  const [statusFilter, setStatusFilter] = useState<string>("all"); // 'all' | 'active' | 'inactive'

  const [currentFilter, setCurrentFilter] = useState<string>("all");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchStoreOwners = async (pageNumber = 1) => {
    try {
      setLoading(true);

      const baseUrl =
        "https://api.tik-mall.com/admin/api/users/store_owner/all";
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: "1000",
      });

      if (currentFilter && currentFilter !== "all") {
        params.append("filter", currentFilter);
      }

      const res = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      let owners = data.users || data.data?.results || [];

      if (currentFilter !== "all" && currentFilter !== "") {
        owners = owners.filter((owner: StoreOwner) =>
          owner.typeOfStore?.some((t) => t.en === currentFilter)
        );
      }

      if (statusFilter === "active") {
        owners = owners.filter((owner: StoreOwner) => owner.isActive);
      } else if (statusFilter === "inactive") {
        owners = owners.filter((owner: StoreOwner) => !owner.isActive);
      }

      setStoreOwners(owners);
      setTotalPages(data.pagination?.pages || 1);
    } finally {
      setLoading(false);
    }
  };

  const searchStoreOwner = async () => {
    if (!searchValue.trim()) {
      setCurrentFilter("all");
      setPage(1);
      fetchStoreOwners(1);
      return;
    }

    setCurrentFilter("");
    setPage(1);
    setTotalPages(1);

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

      const results = data.users || data.user || data || [];
      setStoreOwners(Array.isArray(results) ? results : [results]);
    } catch {
      toast.error(lang === "ar" ? "فشل في البحث!" : "Failed to search!");
      setStoreOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));

      const res = await fetch(
        `https://api.tik-mall.com/admin/api/approve/${id}`,
        {
          method: "PATCH",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Approval failed");

      toast.success(
        lang === "ar" ? "تم الموافقة على المتجر" : "Store approved successfully"
      );

      fetchStoreOwners();
    } catch (err) {
      console.log(err);
      toast.error(
        lang === "ar" ? "خطأ أثناء الموافقة" : "Error approving store"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setCurrentFilter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchValue("");
    setCurrentFilter("all");
    setStatusFilter("all");
    setPage(1);
    fetchStoreOwners(1);
  };

  // Populate store types after fetching owners
  useEffect(() => {
    if (!storeOwners.length) return;

    const map = new Map<string, { ar: string; en: string }>();

    storeOwners.forEach((owner) => {
      owner.typeOfStore?.forEach((t) => {
        map.set(t.en, t);
      });
    });

    setAllStoreTypes(Array.from(map.values()));
  }, [storeOwners]);

  useEffect(() => {
    fetchStoreOwners(page);
  }, [page, currentFilter, statusFilter]);

  useEffect(() => {
    setCurrentFilter("all");
  }, [lang]);

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
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
        {/* Title */}
        <h2 className="flex items-center gap-8 text-2xl md:text-3xl font-bold text-[#456FFF]">
          <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "أصحاب المتاجر" : "Store Owners"}
        </h2>

        {/* Search + Filter */}
        <div className="flex flex-col gap-4 w-full">
          {/* Search + Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
            <input
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 flex-1 dark:text-gray-300"
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              {lang === "ar" ? "بحث" : "Search"}
            </button>
            <button
              onClick={() => fetchStoreOwners()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
              {lang === "ar" ? "تحديث" : "Refresh"}
            </button>
            {(searchValue ||
              currentFilter !== "all" ||
              statusFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
                {lang === "ar" ? "إعادة تعيين" : "Reset"}
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Store Type */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <BuildingStorefrontIcon className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {lang === "ar"
                  ? "تصفية حسب نوع المتجر:"
                  : "Filter by type of store:"}
              </span>
              <select
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300"
                value={currentFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="all">{lang === "ar" ? "الكل" : "All"}</option>
                {allStoreTypes.map((type) => (
                  <option key={type.en} value={type.en}>
                    {lang === "ar" ? type.ar : type.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Status */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {lang === "ar"
                  ? "تصفية حسب حالة الحساب:"
                  : "Filter by account status:"}
              </span>
              <select
                className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:text-gray-300"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">{lang === "ar" ? "الكل" : "All"}</option>
                <option value="active">
                  {lang === "ar" ? "مفعل" : "Active"}
                </option>
                <option value="inactive">
                  {lang === "ar" ? "غير مفعل" : "Inactive"}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow w-full overflow-hidden">
        {storeOwners.length > 0 ? (
          <>
            {/* Scroll container */}
            <div className="w-full max-w-full overflow-x-auto">
              <table className="table-auto w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      #
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "الاسم" : "Name"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "رقم الهاتف" : "Phone"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "اسم المتجر" : "Store Name"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "نوع المتجر" : "Store Type"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "السجل التجاري" : "Commercial"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "الهوية" : "Identity"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "صورة الملف الشخصي" : "Image"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
                      {lang === "ar" ? "الحالة" : "Status"}
                    </th>
                    <th className="px-4 py-3 text-xs text-gray-500 uppercase text-center">
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
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {idx + 1 + (page - 1) * 10}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {owner.name}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {owner.phone?.number || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {owner.storeName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300">
                        {owner.typeOfStore?.length
                          ? owner.typeOfStore
                              .map((t) => t[lang === "ar" ? "ar" : "en"])
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {owner.commercialRecordImg ? (
                          <img
                            src={owner.commercialRecordImg}
                            className="w-8 h-8 object-cover rounded"
                            alt="CR"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {owner.personaIdentityImg ? (
                          <img
                            src={owner.personaIdentityImg}
                            className="w-8 h-8 object-cover rounded"
                            alt="ID"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {owner.profileImg ? (
                          <img
                            src={owner.profileImg}
                            className="w-8 h-8 object-cover rounded"
                            alt="Profile"
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-8 text-center flex justify-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() =>
                            navigate(
                              `/users/store-owners/store-owners-profile/${owner._id}`
                            )
                          }
                          className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          {lang === "ar" ? "عرض" : "View"}
                        </button>

                        {/* Approve / Activate Account */}
                        {!owner?.isApproved && (
                          <button
                            onClick={() => owner && handleApprove(owner._id)}
                            disabled={actionLoading[owner._id]}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                              actionLoading[owner._id]
                                ? "bg-blue-300 cursor-not-allowed text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                            }`}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            {actionLoading[owner._id]
                              ? lang === "ar"
                                ? "جاري التفعيل..."
                                : "Approving..."
                              : lang === "ar"
                              ? "تفعيل الحساب"
                              : "Approve"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages && currentFilter === "all" && (
              <div className="pb-2 flex gap-2 justify-center">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-0.5 rounded min-w-[32px] text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
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
              {lang === "ar" ? "لا يوجد أصحاب متاجر" : "No store owners found."}
            </p>

            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {lang === "ar"
                ? "حاول إضافة أصحاب متاجر جدد"
                : "Try adding new store owners."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwners;
