"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

interface Policy {
  _id: string;
  name: string;
  policy: {
    en: string;
    ar: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const PolicyAndPrivacy = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [editingPolicyName, setEditingPolicyName] = useState<string | null>(
    null
  );
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [fetchSingleLoading, setFetchSingleLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    en: "",
    ar: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchPolicies = async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/all/policies",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        setPolicies(data || []);
      } else {
        toast.error(data?.message || "Failed to load policies");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching policies");
    } finally {
      setLoading(false);
    }
  };

  const fetchSinglePolicy = async (name: string): Promise<Policy | null> => {
    try {
      setFetchSingleLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/get/policy/${encodeURIComponent(
          name
        )}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.ok) {
        return data;
      } else {
        toast.error(data?.message || "Failed to load policy");
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching policy");
      return null;
    } finally {
      setFetchSingleLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPolicyName(null);
    setFormData({ name: "", en: "", ar: "" });
    setModalOpen(true);
  };

  const openEditModal = async (name: string) => {
    setEditingPolicyName(name);
    const p = await fetchSinglePolicy(name);
    if (p) {
      setFormData({
        name: p.name,
        en: p.policy?.en || "",
        ar: p.policy?.ar || "",
      });
      setModalOpen(true);
    }
  };

  const openViewModal = async (name: string) => {
    setViewModalOpen(true);
    setFetchSingleLoading(true);
    const p = await fetchSinglePolicy(name);
    setFetchSingleLoading(false);
    if (p) {
      setFormData({
        name: p.name,
        en: p.policy?.en || "",
        ar: p.policy?.ar || "",
      });
    } else {
      setTimeout(() => setViewModalOpen(false), 800);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formData.name.trim() || !formData.en.trim() || !formData.ar.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreateLoading(true);
    try {
      if (editingPolicyName) {
        const res = await fetch(
          `https://api.tik-mall.com/admin/api/policy/${encodeURIComponent(
            editingPolicyName
          )}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              _id: policies.find((p) => p.name === editingPolicyName)?._id,
              name: formData.name.trim(),
              policy: {
                en: formData.en.trim() || "",
                ar: formData.ar.trim() || "",
              },
            }),
          }
        );
        let data;
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (res.ok) {
          toast.success("Policy updated successfully");
          setModalOpen(false);
          setEditingPolicyName(null);
          setTimeout(() => void fetchPolicies(), 300);
        } else {
          toast.error(data?.message || "Failed to update policy");
        }
      } else {
        const res = await fetch(
          "https://api.tik-mall.com/admin/api/new/policy",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              name: formData.name,
              policy: { en: formData.en, ar: formData.ar },
            }),
          }
        );
        let data;
        try {
          data = await res.json();
        } catch {
          data = {};
        }

        if (res.ok) {
          toast.success("Policy added successfully");
          setModalOpen(false);
          setFormData({ name: "", en: "", ar: "" });
          setTimeout(() => void fetchPolicies(), 300);
        } else {
          toast.error(data?.message || "Failed to add policy");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while saving policy");
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    void fetchPolicies();
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
    <div className="p-6 relative">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[10000]"
      />

      {/* Header + Add */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ color: "#456FFF" }}
        >
          Policies & Privacy
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void fetchPolicies()}
            className="rounded-xl border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Refresh
          </button>
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Add Policy
          </button>
        </div>
      </div>

      {/* Policies Grid or Empty UI */}
      {policies.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            className="w-24 h-24 flex items-center justify-center bg-blue-100 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m4-4h-6v6h6V8zM4 20h16M4 4h16"
              />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-2xl font-bold text-gray-800 dark:text-gray-100"
          >
            No Policies Found!
          </motion.h2>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-gray-500 dark:text-gray-300 max-w-xs"
          >
            You haven't added any policies yet. Click the button above to create
            your first policy.
          </motion.p>
          <motion.button
            onClick={openCreateModal}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.4,
              duration: 0.4,
              type: "spring",
              stiffness: 120,
            }}
            className="mt-3 rounded-xl bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 transition"
          >
            + Add Policy
          </motion.button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {policies.map((policy) => (
            <div
              key={policy._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md p-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
                  {policy.name}
                </h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                  {policy.policy?.en
                    ? policy.policy.en.replace(/<[^>]*>?/gm, "").slice(0, 140) +
                      (policy.policy.en.length > 140 ? "..." : "")
                    : policy.policy?.ar.replace(/<[^>]*>?/gm, "").slice(0, 140)}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => void openViewModal(policy.name)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                  >
                    View
                  </button>
                  <button
                    onClick={() => void openEditModal(policy.name)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals: Create/Edit & View */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                {editingPolicyName ? "Edit Policy" : "Add New Policy"}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Policy Name (unique identifier)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                />
                <textarea
                  placeholder="Policy Content (English) — HTML allowed"
                  value={formData.en}
                  onChange={(e) =>
                    setFormData({ ...formData, en: e.target.value })
                  }
                  className="w-full min-h-[100px] rounded-md border border-gray-300 p-2 text-sm"
                />
                <textarea
                  placeholder="Policy Content (Arabic)"
                  value={formData.ar}
                  onChange={(e) =>
                    setFormData({ ...formData, ar: e.target.value })
                  }
                  dir="rtl"
                  className="w-full min-h-[80px] rounded-md border border-gray-300 p-2 text-sm text-right"
                />
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingPolicyName(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => void handleSubmit()}
                  disabled={createLoading}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    createLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {createLoading
                    ? editingPolicyName
                      ? "Updating..."
                      : "Creating..."
                    : editingPolicyName
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {viewModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {formData.name}
                </h3>
              </div>
              {fetchSingleLoading ? (
                <div className="py-8 text-center text-gray-600">Loading...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      English Content
                    </h4>
                    <div className="prose max-w-none bg-gray-50 border rounded p-3 min-h-[120px] text-sm">
                      <div dangerouslySetInnerHTML={{ __html: formData.en }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Arabic Content
                    </h4>
                    <div
                      className="bg-gray-50 border rounded p-3 min-h-[120px] text-sm"
                      dir="rtl"
                    >
                      {formData.ar}
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
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
