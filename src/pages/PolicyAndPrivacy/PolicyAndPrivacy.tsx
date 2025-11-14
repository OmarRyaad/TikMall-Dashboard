"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ReactQuill from "react-quill-new";
import "react-toastify/dist/ReactToastify.css";
import "react-quill-new/dist/quill.snow.css";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
}

const PolicyAndPrivacy = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [formData, setFormData] = useState({ name: "", en: "", ar: "" });
  const [createLoading, setCreateLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

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
      else toast.error(data?.message || "Failed to load policies");
    } catch {
      toast.error("Network error while fetching policies");
    } finally {
      setLoading(false);
    }
  };

  // Fetch single policy
  const fetchSinglePolicy = async (name: string) => {
    try {
      setFetchLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/get/policy/${encodeURIComponent(
          name
        )}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      const data = await res.json();
      if (!res.ok) toast.error(data?.message || "Failed to load policy");
      return res.ok ? data : null;
    } catch {
      toast.error("Network error while fetching policy");
      return null;
    } finally {
      setFetchLoading(false);
    }
  };

  // Open modals
  const openCreateModal = () => {
    setEditingPolicy(null);
    setFormData({ name: "", en: "", ar: "" });
    setModalOpen(true);
  };

  const openEditModal = async (name: string) => {
    const p = await fetchSinglePolicy(name);
    if (!p) return;
    setEditingPolicy(p);
    setFormData({ name: p.name, en: p.policy.en, ar: p.policy.ar });
    setModalOpen(true);
  };

  const openViewModal = async (name: string) => {
    const p = await fetchSinglePolicy(name);
    if (!p) return;
    setFormData({ name: p.name, en: p.policy.en, ar: p.policy.ar });
    setViewModalOpen(true);
  };

  const handleSubmit = async () => {
    const enContent = formData.en?.trim() || "<p></p>";
    const arContent = formData.ar?.trim() || "<p></p>";

    if (!formData.name.trim()) {
      toast.error("Please provide a name for the policy");
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
        toast.success(editingPolicy ? "Policy updated!" : "Policy created!");
        setModalOpen(false);
        setFormData({ name: "", en: "", ar: "" });
        setEditingPolicy(null);
        fetchPolicies();
      } else {
        console.log("API Error:", data);
        toast.error(data?.message || "Failed to save policy");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving policy");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

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
            Loading <span className="text-blue-500">Policies</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Policies & Privacy</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchPolicies}
            className="mb-4 px-5 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition-all duration-300"
          >
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
          >
            + Add Policy
          </button>
        </div>
      </div>

      {/* Policies Grid */}
      {policies.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          No policies yet. Click “Add Policy” to create your first policy.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {policies.map((p) => (
            <div
              key={p._id}
              className="
                relative flex flex-col justify-between
                rounded-2xl border border-gray-200
                bg-white dark:bg-gray-900
                shadow-sm hover:shadow-lg transition-shadow
                p-5
              "
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-3">
                <DocumentTextIcon className="w-7 h-7 text-purple-600 flex-shrink-0" />

                <h2 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {p.name}
                </h2>
              </div>

              {/* Policy text */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-3">
                {p.policy.en.replace(/<[^>]*>?/gm, "").slice(0, 140)}...
              </p>

              {/* Actions */}
              <div className="mt-5 flex justify-between items-center">
                <button
                  onClick={() => openViewModal(p.name)}
                  className="
            px-3 py-1.5 rounded-md text-xs font-medium
            border border-gray-300 text-gray-700 dark:text-gray-300
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-colors
          "
                >
                  View
                </button>

                <button
                  onClick={() => openEditModal(p.name)}
                  className="
            px-3 py-1.5 rounded-md text-xs font-medium
            bg-blue-600 text-white hover:bg-blue-700
            transition-colors
          "
                >
                  Edit
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">
                {editingPolicy ? "Edit Policy" : "Add New Policy"}
              </h2>
              <input
                type="text"
                placeholder="Policy Name"
                className="w-full border rounded p-2 mb-3"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <label className="block text-sm font-medium mb-1">
                English Content
              </label>
              <ReactQuill
                theme="snow"
                value={formData.en}
                onChange={(value: string) =>
                  setFormData({ ...formData, en: value })
                }
                className="mb-3 bg-white border rounded"
              />

              <ReactQuill
                theme="snow"
                value={formData.ar}
                onChange={(value: string) =>
                  setFormData({ ...formData, ar: value })
                }
                className="mb-3 bg-white border rounded"
              />

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createLoading}
                  className={`px-4 py-2 rounded text-white ${
                    createLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {createLoading
                    ? editingPolicy
                      ? "Updating..."
                      : "Creating..."
                    : editingPolicy
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {viewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{formData.name}</h2>
              {fetchLoading ? (
                <p className="text-center text-gray-500 py-10">Loading...</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">English</h3>
                    <div className="bg-gray-50 border rounded p-3 min-h-[120px] prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formData.en }} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Arabic</h3>
                    <div
                      className="bg-gray-50 border rounded p-3 min-h-[120px]"
                      dir="rtl"
                    >
                      <div dangerouslySetInnerHTML={{ __html: formData.ar }} />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Close
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
