import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const policyName = params.get("name");

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [viewLang, setViewLang] = useState<"en" | "ar">("en");

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
        toast.error(data?.message || "Failed to load policy");
        setPolicy(null);
      } else {
        setPolicy(data);
      }
    } catch {
      toast.error("Network error while fetching policy");
      setPolicy(null);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [policyName]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center gap-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <div className="p-1 bg-white dark:bg-gray-700 rounded-full shadow-md">
          <ChevronLeftIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
        </div>
        <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">
          Back
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
              Loading <span className="text-blue-500">Policy View</span>...
            </p>
          </div>
        </div>
      ) : policy ? (
        <div>
          {/* Policy Title */}
          <h1 className="text-3xl font-bold mb-6 text-blue-600">
            {policy.name}
          </h1>

          {/* Language Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewLang("en")}
              className={`px-3 py-1 rounded ${
                viewLang === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setViewLang("ar")}
              className={`px-3 py-1 rounded ${
                viewLang === "ar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
              }`}
            >
              Arabic
            </button>
          </div>

          {/* Policy Content */}
          <div
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-6 min-h-[200px] prose max-w-none text-gray-900 dark:text-gray-100"
            dir={viewLang === "ar" ? "rtl" : "ltr"}
          >
            <div
              dangerouslySetInnerHTML={{
                __html: viewLang === "ar" ? policy.policy.ar : policy.policy.en,
              }}
            />
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 py-10">
          Policy not found
        </p>
      )}
    </div>
  );
};

export default PolicyView;
