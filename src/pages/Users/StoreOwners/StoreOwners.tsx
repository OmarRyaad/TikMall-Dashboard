"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
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
  const [searchValue, setSearchValue] = useState("");

  // Track current filter
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const [storeTypes, setStoreTypes] = useState<string[]>([]);

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
          owner.typeOfStore?.some(
            (t) => t[lang === "ar" ? "ar" : "en"] === currentFilter
          )
        );
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

  // Populate store types after fetching owners
  useEffect(() => {
    if (storeOwners.length) {
      const typesSet = new Set<string>();
      storeOwners.forEach((owner) => {
        owner.typeOfStore?.forEach((t) =>
          typesSet.add(t[lang === "ar" ? "ar" : "en"])
        );
      });
      setStoreTypes(Array.from(typesSet));
    }
  }, [storeOwners, lang]);

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setCurrentFilter(value);
    setPage(1);
  };

  useEffect(() => {
    fetchStoreOwners(page);
  }, [page, currentFilter]);

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
        <h2 className="flex items-center gap-2 text-2xl md:text-3xl font-bold text-[#456FFF]">
          <BuildingStorefrontIcon className="w-8 h-8 text-blue-600" />
          {lang === "ar" ? "أصحاب المتاجر" : "Store Owners"}
        </h2>

        {/* Search + Filter */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="flex gap-3 w-full sm:w-auto">
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
            {/* Refresh Button */}
            <div className="flex gap-2">
              <button
                onClick={() => fetchStoreOwners()}
                className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                {lang === "ar" ? "تحديث" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Filter (under search) */}
          <div className="flex items-center gap-2 mt-2">
            <label className="font-medium text-gray-700 dark:text-gray-300">
              {lang === "ar" ? "تصفية حسب نوع المتجر:" : "Type of store:"}
            </label>

            <select
              className="px-3 py-2 border rounded-lg dark:bg-gray-800 dark:text-gray-300"
              value={currentFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="all">{lang === "ar" ? "الكل" : "All"}</option>

              {storeTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/users/store-owners/store-owners-profile/${owner._id}`
                            )
                          }
                          className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          {lang === "ar" ? "عرض" : "View"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {totalPages && (
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
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            {lang === "ar" ? "لا يوجد أصحاب متاجر" : "No store owners found."}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwners;
