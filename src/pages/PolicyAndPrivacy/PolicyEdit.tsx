"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

interface Policy {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyEdit = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const policyName = params.get("name");

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    en: "",
    ar: "",
  });

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  // Fetch policy by name
  const fetchPolicy = async () => {
    if (!policyName) return;
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/get/policy/${encodeURIComponent(
          policyName
        )}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل تحميل السياسة" : "Failed to load policy")
        );
        setPolicy(null);
      } else {
        setPolicy(data);
        setFormData({
          nameEn: data.name.en ?? "",
          nameAr: data.name.ar ?? "",
          en: data.policy.en ?? "",
          ar: data.policy.ar ?? "",
        });
      }
    } catch {
      toast.error(
        lang === "ar"
          ? "خطأ في الاتصال بالشبكة"
          : "Network error while fetching policy"
      );
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  // Save / update policy
  const handleSubmit = async () => {
    if (!formData.nameEn.trim() && !formData.nameAr.trim()) {
      toast.error(
        lang === "ar"
          ? "يرجى كتابة اسم السياسة"
          : "Please provide a name for the policy"
      );
      return;
    }

    if (!policy?._id) {
      toast.error(
        lang === "ar"
          ? "لا يمكن تحديث السياسة: معرف غير صالح"
          : "Cannot update policy: invalid ID"
      );
      return;
    }

    setSaveLoading(true);

    const body = {
      policyName: {
        en: formData.nameEn.trim(),
        ar: formData.nameAr.trim(),
      },
      policyData: {
        en: formData.en || "<p></p>",
        ar: formData.ar || "<p></p>",
      },
    };

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/policy/${encodeURIComponent(
          policyName ?? ""
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(
          lang === "ar" ? "تم حفظ السياسة بنجاح!" : "Policy updated!"
        );
        navigate("/policy-and-Privacy");
      } else {
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل تحديث السياسة" : "Failed to update policy")
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar"
          ? "خطأ في الاتصال أثناء الحفظ"
          : "Network error while updating policy"
      );
    } finally {
      setSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [policyName]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
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
            {lang === "ar" ? "جاري تحميل" : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "تعديل السياسة" : "Editing Policy"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  if (!policy)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-10 rounded-2xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-3">
            {lang === "ar" ? "السياسة غير موجودة" : "Policy Not Found"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {lang === "ar"
              ? "عذرًا، السياسة التي تبحث عنها غير موجودة أو تم حذفها."
              : "Sorry, the policy you are looking for does not exist or has been removed."}
          </p>
        </div>
      </div>
    );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="p-6 max-w-5xl mx-auto space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center gap-2 p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all duration-200 group"
      >
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
          <ChevronLeftIcon
            className={`h-5 w-5 text-blue-600 ${isRTL ? "rotate-180" : ""}`}
          />
        </div>
        <span className="text-gray-700 dark:text-gray-200 font-medium">
          {lang === "ar" ? "رجوع" : "Back"}
        </span>
      </button>

      {/* Policy Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-600 text-center">
        {lang === "ar" ? policy.name.ar : policy.name.en}
      </h1>

      {/* Editors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Arabic Editor */}
        <div className="flex flex-col gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-t-xl border-b-0">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              تحرير المحتوى بالعربية
            </p>
          </div>
          <div dir="rtl" className="border-2 border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
            <ReactQuill
              theme="snow"
              value={formData.ar}
              onChange={(value: string) => setFormData({ ...formData, ar: value })}
              className="h-[500px]"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ align: [] }],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
            <div className="h-12"></div> {/* Spacer for Quill toolbar overlap if any or just padding */}
          </div>
        </div>

        {/* English Editor */}
        <div className="flex flex-col gap-2">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-t-xl border-b-0">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Editing Content in English
            </p>
          </div>
          <div dir="ltr" className="border-2 border-gray-200 dark:border-gray-700 rounded-b-xl overflow-hidden shadow-lg bg-white dark:bg-gray-900">
            <ReactQuill
              theme="snow"
              value={formData.en}
              onChange={(value: string) => setFormData({ ...formData, en: value })}
              className="h-[500px]"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  [{ align: [] }],
                  ["link"],
                  ["clean"],
                ],
              }}
            />
            <div className="h-12"></div> {/* Spacer for Quill toolbar overlap */}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saveLoading}
          className={`px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
            saveLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover: hover:from-blue-700 hover:to-blue-800"
          }`}
        >
          {saveLoading
            ? lang === "ar"
              ? "جاري الحفظ..."
              : "Saving..."
            : lang === "ar"
            ? "حفظ التغييرات"
            : "Save Policy"}
        </button>
      </div>
    </div>
  );
};

export default PolicyEdit;
