import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../context/LanguageContext";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyView = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const policyName = params.get("name");

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [viewLang, setViewLang] = useState<"en" | "ar">(
    lang === "ar" ? "ar" : "en"
  );

  const token = localStorage.getItem("accessToken");

  // Fetch policy by name
  const fetchPolicy = async () => {
    if (!policyName) return;
    try {
      setFetchLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/get/policy/${encodeURIComponent(
          policyName
        )}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
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
      }
    } catch {
      toast.error(
        lang === "ar"
          ? "خطأ في الاتصال بالشبكة"
          : "Network error while fetching policy"
      );
      setPolicy(null);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [policyName]);

  useEffect(() => {
    setViewLang(lang === "ar" ? "ar" : "en");
  }, [lang]);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center gap-3 p-3 rounded-full bg-white dark:bg-gray-800 shadow hover:shadow-md transition-all duration-200 group mb-6"
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

      {fetchLoading ? (
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
                {lang === "ar" ? "السياسة" : "Policy"}
              </span>
              ...
            </p>
          </div>
        </div>
      ) : policy ? (
        <div className="space-y-6">
          {/* Policy Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-blue-600 text-center">
            {policy.name}
          </h1>

          {/* Language Toggle */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setViewLang("en")}
              className={`px-8 py-3 rounded-xl font-medium text-lg transition-all shadow-md ${
                viewLang === "en"
                  ? "bg-blue-600 text-white shadow-blue-500/50"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setViewLang("ar")}
              className={`px-8 py-3 rounded-xl font-medium text-lg transition-all shadow-md ${
                viewLang === "ar"
                  ? "bg-blue-600 text-white shadow-blue-500/50"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              العربية
            </button>
          </div>

          {/* Policy Content */}
          <div
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl min-h-[400px] prose prose-lg max-w-none"
            dir={viewLang === "ar" ? "rtl" : "ltr"}
          >
            <div
              className="text-gray-800 dark:text-gray-100 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: viewLang === "ar" ? policy.policy.ar : policy.policy.en,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="bg-gray-100 dark:bg-gray-800 p-12 rounded-2xl shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
              {lang === "ar" ? "السياسة غير موجودة" : "Policy Not Found"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {lang === "ar"
                ? "عذرًا، السياسة التي تبحث عنها غير موجودة أو تم حذفها."
                : "Sorry, the policy you are looking for does not exist or has been removed."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyView;
