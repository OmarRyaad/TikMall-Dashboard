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
  name: string;
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
  const [formData, setFormData] = useState({ name: "", en: "", ar: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [viewLang, setViewLang] = useState<"en" | "ar">(
    lang === "ar" ? "ar" : "en"
  );

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
          name: data.name ?? "",
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
    if (!formData.name.trim()) {
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
      policyName: formData.name.trim(),
      policyData: {
        en: formData.en || "<p></p>",
        ar: formData.ar || "<p></p>",
      },
    };

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/policy/${encodeURIComponent(
          policy.name
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

  useEffect(() => {
    setViewLang(lang === "ar" ? "ar" : "en");
  }, [lang]);

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
      {/* Policy Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-blue-600 text-center">
        {lang === "ar" ? "الشروط والاحكام" : "Terms and Conditions"}
      </h1>

      {/* Language Toggle */}
      <div className="flex justify-center gap-3 mb-6">
        <button
          onClick={() => setViewLang("en")}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            viewLang === "en"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          English
        </button>
        <button
          onClick={() => setViewLang("ar")}
          className={`px-6 py-2 py-2 rounded-lg font-medium transition-all ${
            viewLang === "ar"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          }`}
        >
          العربية
        </button>
      </div>

      {/* Editor */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {viewLang === "ar"
              ? "تحرير المحتوى بالعربية"
              : "Editing Content in English"}
          </p>
        </div>
        <ReactQuill
          theme="snow"
          value={viewLang === "en" ? formData.en : formData.ar}
          onChange={(value: string) =>
            setFormData(
              viewLang === "en"
                ? { ...formData, en: value }
                : { ...formData, ar: value }
            )
          }
          className="h-96 bg-white dark:bg-gray-900"
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
