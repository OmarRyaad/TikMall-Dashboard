"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AnimatePresence, motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface StoreOwner {
  _id: string;
  name: string;
  phone: { number: string };
  isActive: boolean;
}

const StoreOwners = () => {
  const [storeOwners, setStoreOwners] = useState<StoreOwner[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchStoreOwners = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/users/store_owner/all",
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to fetch store owners");

      const data = await res.json();
      setStoreOwners(data.users || data.data?.results || []);
    } catch {
      toast.error("Failed to fetch store owners!");
    } finally {
      setLoading(false);
    }
  };

  const searchStoreOwner = async () => {
    if (!searchValue.trim()) {
      fetchStoreOwners();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/store_owner/${searchValue}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Store owner not found");

      const data = await res.json();
      setStoreOwners(data.users || []);
    } catch {
      toast.error("Failed to search!");
      setStoreOwners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to delete store owner");

      toast.success("Store owner deleted successfully!");

      setDeleteModalOpen(false);
      setOwnerToDelete(null);

      fetchStoreOwners();
    } catch {
      toast.error("Error deleting store owner");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreOwners();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>

          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            Loading <span className="text-blue-500">Store Owners</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#456FFF]">
          Store Owners
        </h2>

        {/* 🔍 Search */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 w-full sm:w-auto"
            placeholder="Search for a store owner..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <button
            onClick={searchStoreOwner}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            Search
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow overflow-hidden w-full">
        {storeOwners.length > 0 ? (
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full min-w-[600px] md:min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    #
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {storeOwners.map((owner, idx) => (
                  <tr
                    key={owner._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 md:px-6 py-3 text-sm">{idx + 1}</td>
                    <td className="px-4 md:px-6 py-3 font-medium">
                      {owner.name}
                    </td>
                    <td className="px-4 md:px-6 py-3 text-sm text-gray-600">
                      {owner.phone?.number}
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          owner.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {owner.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 md:px-6 py-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setOwnerToDelete(owner._id);
                          setDeleteModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-md text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
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
            No store owners found.
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Confirm Delete
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this store owner?
              </p>

              <div className="mt-5 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setOwnerToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  onClick={() => ownerToDelete && handleDelete(ownerToDelete)}
                  disabled={deleteLoading}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    deleteLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoreOwners;
