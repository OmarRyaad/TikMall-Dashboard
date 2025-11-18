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

interface Permissions {
  manageAdmins?: boolean;
  manageStoreOwners?: boolean;
  manageMediaAndStreams?: boolean;
  manageDepartmentsAndFaqs?: boolean;
  manageCustomers?: boolean;
  manageComplains?: boolean;
  manageSendNotifications?: boolean;
  manageStatistics?: boolean;
}

interface Phone {
  number: string;
  isVerified?: boolean;
}

interface ApiModerator {
  _id: string;
  name: string;
  phone: Phone;
  password?: string;
  isActive: boolean;
  permissions: Permissions;
  isSuperAdmin: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Moderator {
  _id?: string;
  name: string;
  phone: string;
  password?: string;
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
  const [formData, setFormData] = useState<Partial<Moderator>>({
    active: true,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/users/admin/all",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to fetch moderators");

      const data = (await res.json()) as { users: ApiModerator[] };

      const formatted: Moderator[] = data.users
        .filter((u) => !u.isSuperAdmin)
        .map((u) => ({
          _id: u._id,
          name: u.name,
          phone: u.phone.number,
          active: u.isActive,
          userManagement: u.permissions.manageAdmins ?? false,
          storeManagement: u.permissions.manageStoreOwners ?? false,
          liveBroadcast: u.permissions.manageMediaAndStreams ?? false,
          contentManagement: u.permissions.manageDepartmentsAndFaqs ?? false,
        }));

      setModerators(formatted);
    } catch (err) {
      toast.error("Failed to load moderators");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (moderator: Moderator) => {
    setFormData({ ...moderator, password: "" });
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      password: "",
      active: true,
      userManagement: false,
      storeManagement: false,
      liveBroadcast: false,
      contentManagement: false,
    });
    setIsEditMode(false);
    setIsOpen(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({ active: true });
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      (!isEditMode && !formData.password)
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        phone: { number: formData.phone },
        ...(formData.password && { password: formData.password }),
        isActive: formData.active ?? true,
        permissions: {
          manageAdmins: !!formData.userManagement,
          manageStoreOwners: !!formData.storeManagement,
          manageMediaAndStreams: !!formData.liveBroadcast,
          manageDepartmentsAndFaqs: !!formData.contentManagement,
          manageCustomers: false,
          manageComplains: false,
          manageSendNotifications: false,
          manageStatistics: false,
        },
      };

      const url = isEditMode
        ? `https://api.tik-mall.com/admin/api/modify-permissions/${formData._id}`
        : "https://api.tik-mall.com/admin/api/modify-permissions";

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          (result as { message?: string }).message || "Operation failed"
        );
      }

      toast.success(isEditMode ? "Moderator updated!" : "Moderator created!");
      fetchModerators();
      setIsOpen(false);
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this moderator?")) return;

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/child/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          (err as { message?: string }).message || "Delete failed"
        );
      }

      toast.success("Moderator deleted");
      fetchModerators();
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Loading <span className="text-blue-500">Moderators</span>...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#456FFF]">
          Moderators
        </h2>
        <button
          onClick={handleAdd}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300 self-start md:self-auto"
        >
          + Add Moderator
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden">
        {moderators.length > 0 ? (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[650px]">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["#", "Name", "Phone", "Status", "Actions"].map(
                    (title, i) => (
                      <th
                        key={i}
                        className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {title}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {moderators.map((mod, idx) => (
                  <tr
                    key={mod._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 md:px-6 py-3 text-sm">{idx + 1}</td>
                    <td className="px-4 md:px-6 py-3 font-medium">
                      {mod.name}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-sm text-gray-600">
                      {mod.phone}
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          mod.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {mod.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 md:px-6 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(mod)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => mod._id && handleDeleteClick(mod._id)}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            No moderators found.
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl p-6 md:p-8">
                <h3 className="text-2xl font-bold mb-6">
                  {isEditMode ? "Edit Moderator" : "Add New Moderator"}
                </h3>

                {/* Inputs */}
                <div className="space-y-5">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                  />

                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number (e.g. +20123456789)"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                  />

                  {!isEditMode && (
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800"
                    />
                  )}

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active ?? true}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Active Account</span>
                  </label>
                </div>

                {/* Permissions */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LockClosedIcon className="w-6 h-6 text-yellow-500" />
                    Permissions
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        key: "userManagement" as const,
                        label: "User Management",
                        Icon: UserIcon,
                      },
                      {
                        key: "liveBroadcast" as const,
                        label: "Live Broadcast",
                        Icon: VideoCameraIcon,
                      },
                      {
                        key: "storeManagement" as const,
                        label: "Store Management",
                        Icon: ShoppingBagIcon,
                      },
                      {
                        key: "contentManagement" as const,
                        label: "Content Management",
                        Icon: DocumentTextIcon,
                      },
                    ].map(({ key, label, Icon }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-6 h-6 text-blue-500" />
                          <span className="font-medium">{label}</span>
                        </div>

                        <input
                          type="checkbox"
                          name={key}
                          checked={!!formData[key]}
                          onChange={handleChange}
                          className="w-5 h-5"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
                  >
                    {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
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
