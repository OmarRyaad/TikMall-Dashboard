"use client";

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  active: boolean;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/customer?page=1&limit=10"
      );
      if (!res.ok) throw new Error("Failed to fetch customers!");
      const data = await res.json();
      setCustomers(data.data.results || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to fetch customers!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
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
            Loading <span className="text-blue-500">Customers</span>...
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

      <h1 className="text-2xl font-bold mb-6" style={{ color: "#456FFF" }}>
        Customers
      </h1>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
        <div className="max-w-full overflow-x-auto">
          {loading ? (
            <p className="text-center py-10 text-gray-500 dark:text-gray-400">
              Loading...
            </p>
          ) : customers.length ? (
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {customers.map((customer, idx) => (
                  <tr
                    key={customer._id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {customer.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {customer.active ? "Yes" : "No"}
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
                No Customers Yet
              </h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
                You haven’t added any customers yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
