"use client";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const policyName = params.get("name");

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({ name: "", en: "", ar: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [viewLang, setViewLang] = useState<"en" | "ar">("en");

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
        toast.error(data?.message || "Failed to load policy");
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
      toast.error("Network error while fetching policy");
      setPolicy(null);
    } finally {
      setLoading(false);
    }
  };

  // Save / update policy
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Please provide a name for the policy");
      return;
    }

    if (!policy?._id) {
      toast.error("Cannot update policy: invalid ID");
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
          policy._id
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
        toast.success("Policy updated!");
        navigate("/policy-and-Privacy");
      } else {
        toast.error(data?.message || "Failed to update policy");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while updating policy");
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
            Loading <span className="text-blue-500">Editing Policies</span>...
          </p>
        </div>
      </div>
    );

  if (!policy)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 dark:bg-gray-800 p-10 rounded-lg shadow-lg flex flex-col items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Policy Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs">
            Sorry, the policy you are looking for does not exist or has been
            removed.
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ToastContainer position="top-right" />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-all flex items-center gap-2"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
        Back
      </button>

      {/* Policy Title */}
      <h1 className="text-3xl font-bold text-blue-600">{policy.name}</h1>

      {/* Language toggle */}
      <div className="flex gap-2">
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

      {/* Policy Name */}
      <input
        type="text"
        className="w-full border rounded p-2"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Policy Name"
      />

      {/* ReactQuill editor */}
      <div className="border rounded overflow-hidden">
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
          className="min-h-[300px] h-[400px] bg-white"
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={saveLoading}
        className={`px-4 py-2 rounded text-white ${
          saveLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {saveLoading ? "Saving..." : "Save Policy"}
      </button>
    </div>
  );
};

export default PolicyEdit;
