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
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all flex items-center gap-2"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
        Back
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
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setViewLang("ar")}
              className={`px-3 py-1 rounded ${
                viewLang === "ar"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Arabic
            </button>
          </div>

          {/* Policy Content */}
          <div
            className="bg-gray-50 border rounded p-6 min-h-[200px] prose max-w-none"
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
        <p className="text-center text-gray-500 py-10">Policy not found</p>
      )}
    </div>
  );
};

export default PolicyView;
