"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  UserIcon,
  VideoCameraIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface Moderator {
  _id?: string;
  name: string;
  phone: string;
  password: string;
  active: boolean;
  userManagement?: boolean;
  storeManagement?: boolean;
  liveBroadcast?: boolean;
  contentManagement?: boolean;
}

const Moderators = () => {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Moderator>>({});

  // Fetch moderators from admin API
  const fetchModerators = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/admin?page=1&limit=10"
      );
      const data = await res.json();
      setModerators(data?.admins || []);
    } catch {
      toast.error("Failed to fetch moderators!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (moderator: Moderator) => {
    setFormData(moderator);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setFormData({});
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleCancel = () => setIsOpen(false);

  const handleSave = async () => {
    try {
      const payload = {
        phone: { number: formData.phone },
        name: formData.name,
        password: formData.password,
        isActive: formData.active,
        permissions: {
          manageUsers: !!formData.userManagement,
          manageStoreOwners: !!formData.storeManagement,
          manageStreams: !!formData.liveBroadcast,
          manageDepartments: !!formData.contentManagement,
        },
      };

      const res = await fetch("https://api.tik-mall.com/admin/api/child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create moderator");
      }

      toast.success("Moderator created successfully!");
      fetchModerators();
      setIsOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this moderator?")) return;
    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/child/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete moderator");
      toast.success("Moderator deleted");
      fetchModerators();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

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
            Loading <span className="text-blue-500">Moderators</span>...
          </p>
        </div>
      </div>
    );
  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <h2 className="text-2xl font-bold mb-6 text-[#456FFF]">Moderators</h2>

      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAdd}
          className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
        >
          + Add Moderator
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
        <div className="max-w-full overflow-x-auto">
          {moderators.length ? (
            <table className="min-w-full border-collapse">
              <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Phone
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Active
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {moderators.map((mod, idx) => (
                  <tr
                    key={mod._id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {mod.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {mod.phone}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {mod.active ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(mod)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(mod._id!)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-300 dark:text-gray-500"
                fill="none"
                viewBox="0 0 64 64"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  stroke="currentColor"
                  opacity="0.1"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M32 32c6 0 10-4 10-10s-4-10-10-10-10 4-10 10 4 10 10 10zM16 52c0-8.837 7.163-16 16-16s16 7.163 16 16"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">
                No Moderators Yet
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                You haven’t added any moderators yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal with AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Container */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-6">
                {/* Title */}
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  {isEditMode ? "Edit Moderator" : "Add New Moderator"}
                </h2>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter moderator name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter moderator phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter moderator password"
                    value={formData.password || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active || false}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="active"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Active?
                    </label>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-lg">
                      <LockClosedIcon className="w-5 h-5 text-yellow-500" />
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Moderator Permissions
                      </label>
                    </div>
                  </div>

                  <p className="mb-4 text-gray-700 dark:text-gray-300">
                    Select the features this moderator can manage!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Management */}
                    <label className="flex flex-row-reverse items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        name="userManagement"
                        checked={formData.userManagement || false}
                        onChange={handleChange}
                        className="w-5 h-5 ml-3"
                      />
                      <div className="flex flex-col flex-1 mr-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          User Management
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Create, edit, and deactivate users
                        </span>
                      </div>
                      <UserIcon className="w-5 h-5 text-blue-500 mr-4" />
                    </label>

                    {/* Live Broadcast */}
                    <label className="flex flex-row-reverse items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        name="liveBroadcast"
                        checked={formData.liveBroadcast || false}
                        onChange={handleChange}
                        className="w-5 h-5 ml-3"
                      />
                      <div className="flex flex-col flex-1 mr-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Live Broadcast Management
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Controlling live streaming and media
                        </span>
                      </div>
                      <VideoCameraIcon className="w-5 h-5 text-purple-500 mr-4" />
                    </label>

                    {/* Store Management */}
                    <label className="flex flex-row-reverse items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        name="storeManagement"
                        checked={formData.storeManagement || false}
                        onChange={handleChange}
                        className="w-5 h-5 ml-3"
                      />
                      <div className="flex flex-col flex-1 mr-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Store Management
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Approval of store owners and their management
                        </span>
                      </div>
                      <ShoppingBagIcon className="w-5 h-5 text-green-500 mr-4" />
                    </label>

                    {/* Content Management */}
                    <label className="flex flex-row-reverse items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <input
                        type="checkbox"
                        name="contentManagement"
                        checked={formData.contentManagement || false}
                        onChange={handleChange}
                        className="w-5 h-5 ml-3"
                      />
                      <div className="flex flex-col flex-1 mr-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          Content Management
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Department and category management
                        </span>
                      </div>
                      <DocumentTextIcon className="w-5 h-5 text-yellow-500 mr-4" />
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                  >
                    {isEditMode ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Moderators;
