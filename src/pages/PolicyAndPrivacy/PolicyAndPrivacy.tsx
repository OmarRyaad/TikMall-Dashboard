"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ReactQuill from "react-quill-new";
import "react-toastify/dist/ReactToastify.css";
import "react-quill-new/dist/quill.snow.css";
import {
  ArrowPathIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyAndPrivacy = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const navigate = useNavigate();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({ name: "", en: "", ar: "" });
  const [createLoading, setCreateLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Fetch all policies
  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/all/policies",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const data = await res.json();
      if (res.ok) setPolicies(data || []);
      else
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل تحميل السياسات" : "Failed to load policies")
        );
    } catch {
      toast.error(
        lang === "ar"
          ? "خطأ في الاتصال بالشبكة"
          : "Network error while fetching policies"
      );
    } finally {
      setLoading(false);
    }
  };

  const openViewPage = (name: string) => {
    navigate(
      `/policy-and-Privacy/policy-view?name=${encodeURIComponent(name)}`
    );
  };

  const handleSubmit = async () => {
    const enContent = formData.en?.trim() || "<p></p>";
    const arContent = formData.ar?.trim() || "<p></p>";

    if (!formData.name.trim()) {
      toast.error(
        lang === "ar"
          ? "يرجى كتابة اسم السياسة"
          : "Please provide a name for the policy"
      );
      return;
    }

    setCreateLoading(true);

    const body = {
      policyName: formData.name.trim(),
      policyData: { en: enContent, ar: arContent },
    };

    try {
      const res = await fetch(
        editingPolicy
          ? `https://api.tik-mall.com/admin/api/policy/${encodeURIComponent(
              editingPolicy._id
            )}`
          : "https://api.tik-mall.com/admin/api/new/policy",
        {
          method: editingPolicy ? "PATCH" : "POST",
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
          editingPolicy
            ? lang === "ar"
              ? "تم تحديث السياسة بنجاح!"
              : "Policy updated!"
            : lang === "ar"
            ? "تم إنشاء السياسة بنجاح!"
            : "Policy created!"
        );
        setModalOpen(false);
        setFormData({ name: "", en: "", ar: "" });
        setEditingPolicy(null);
        fetchPolicies();
      } else {
        console.log("API Error:", data);
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل حفظ السياسة" : "Failed to save policy")
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar"
          ? "خطأ في الاتصال أثناء حفظ السياسة"
          : "Network error while saving policy"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
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
              {lang === "ar" ? "السياسات" : "Policies"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="p-6 bg-gray-50 dark:bg-gray-900"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="flex items-center gap-2 text-2xl md:text-3xl font-bold"
          style={{ color: "#456FFF" }}
        >
          <ShieldCheckIcon className="w-9 h-9 text-blue-600" />
          {lang === "ar" ? "السياسات والخصوصية" : "Policies & Privacy"}
        </h2>

        {/* Refresh Button */}
        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Policies Grid */}
      {policies.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-20">
          {lang === "ar"
            ? "لا توجد سياسات حتى الآن. اضغط على “إضافة سياسة” لإنشاء أول سياسة."
            : "No policies yet. Click “Add Policy” to create your first policy."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {policies.map((p) => (
            <div
              key={p._id}
              className="relative flex flex-col justify-between rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow p-5"
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="w-7 h-7 text-purple-600" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {p.name}
                </h2>
              </div>

              {/* Policy Preview */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-3">
                {(lang === "ar" ? p.policy.ar : p.policy.en)
                  .replace(/<[^>]*>?/gm, "")
                  .slice(0, 140)}
                ...
              </p>

              {/* Actions */}
              <div className="mt-5 flex justify-between items-center">
                <button
                  onClick={() => openViewPage(p.name)}
                  className="px-4 py-4 rounded-md text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {lang === "ar" ? "عرض" : "View"}
                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/policy-and-Privacy/edit?name=${encodeURIComponent(
                        p.name
                      )}`
                    )
                  }
                  className="px-4 py-4 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  {lang === "ar" ? "تعديل" : "Edit"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setModalOpen(false)}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingPolicy
                  ? lang === "ar"
                    ? "تعديل السياسة"
                    : "Edit Policy"
                  : lang === "ar"
                  ? "إضافة سياسة جديدة"
                  : "Add New Policy"}
              </h2>

              <input
                type="text"
                placeholder={lang === "ar" ? "اسم السياسة" : "Policy Name"}
                className="w-full border border-gray-300 dark:border-gray-700 rounded p-3 mb-4 text-gray-800 dark:text-white bg-white dark:bg-gray-800 text-lg font-medium"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {lang === "ar" ? "المحتوى بالعربية" : "Arabic Content"}
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.ar}
                    onChange={(value: string) =>
                      setFormData({ ...formData, ar: value })
                    }
                    className="h-96 mb-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    modules={{ toolbar: true }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {lang === "ar" ? "المحتوى بالإنجليزية" : "English Content"}
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.en}
                    onChange={(value: string) =>
                      setFormData({ ...formData, en: value })
                    }
                    className="h-96 mb-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    modules={{ toolbar: true }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white transition-all"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createLoading}
                  className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
                    createLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {createLoading
                    ? editingPolicy
                      ? lang === "ar"
                        ? "جاري التحديث..."
                        : "Updating..."
                      : lang === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : editingPolicy
                    ? lang === "ar"
                      ? "تحديث"
                      : "Update"
                    : lang === "ar"
                    ? "إنشاء"
                    : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolicyAndPrivacy;
