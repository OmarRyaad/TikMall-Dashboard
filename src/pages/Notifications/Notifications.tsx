import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BellAlertIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  phone: string;
}

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [formData, setFormData] = useState({
    NotificationTitle: "",
    NotificationMessage: "",
    schedule: "instant",
    futureDate: new Date(),
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<string[]>([]);
  const [loadingSend, setLoadingSend] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  const openCreateModal = async () => {
    setIsOpen(true);
    await fetchSelectedUsers();
  };

  const handleCancel = () => {
    setIsOpen(false);
    setDropdownOpen(false);
    setFormData({
      NotificationTitle: "",
      NotificationMessage: "",
      schedule: "instant",
      futureDate: new Date(),
    });
    setCheckedUsers([]);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchSelectedUsers = async () => {
    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/bulk/store_owner/ids",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setSelectedUsers(data.users || []);
    } catch (error) {
      toast.error("Failed to fetch selected users.");
      console.error(error);
    }
  };

  const toggleUserCheck = (id: string) => {
    setCheckedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (checkedUsers.length === selectedUsers.length) {
      setCheckedUsers([]);
    } else {
      setCheckedUsers(selectedUsers.map((u) => u.id));
    }
  };

  const handleSave = async (data: typeof formData) => {
    if (loadingSend) return;
    if (!data.NotificationTitle || !data.NotificationMessage) {
      toast.error("Please enter both title and message.");
      return;
    }
    if (checkedUsers.length === 0) {
      toast.error("Please select at least one user.");
      return;
    }

    setLoadingSend(true);
    const payload = {
      userIds: checkedUsers,
      title: data.NotificationTitle,
      body: data.NotificationMessage,
      type: "general",
      data: {},
      delay:
        data.schedule === "future"
          ? Math.floor((data.futureDate.getTime() - Date.now()) / 1000)
          : 0,
    };

    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/notify/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed");

      toast.success("Notification sent successfully!");
      handleCancel();
    } catch {
      toast.error("Error sending notification");
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex justify-between items-center mb-6">
        <h2
          className="flex items-center gap-2 text-2xl md:text-3xl font-bold"
          style={{ color: "#456FFF" }}
        >
          <BellAlertIcon className="w-8 h-8" />
          Notifications
        </h2>

        <button
          onClick={openCreateModal}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
        >
          + Send Notification
        </button>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />

            {/* Modal Container */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6
          scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-gray-700"
              >
                <h2 className="text-xl font-semibold mb-4">
                  Send Notification
                </h2>

                {/* Notification Title */}
                <label className="block text-sm font-medium mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  name="NotificationTitle"
                  value={formData.NotificationTitle}
                  onChange={handleChange}
                  className="w-full mb-3 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter title"
                />

                {/* Notification Message */}
                <label className="block text-sm font-medium mb-1">
                  Notification Message
                </label>
                <textarea
                  name="NotificationMessage"
                  value={formData.NotificationMessage}
                  onChange={handleChange}
                  className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                  placeholder="Enter message"
                  rows={3}
                />

                {/* Users Dropdown - INLINE */}
                <div className="mb-4 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex justify-between items-center p-4 border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/40 shadow-sm hover:shadow-md transition"
                  >
                    <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      Users
                      <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">
                        {selectedUsers.length}
                      </span>
                    </span>

                    <svg
                      className={`w-4 h-4 text-gray-500 dark:text-gray-300 transform transition-transform ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="mt-2 max-h-56 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-2xl 
                  bg-gray-50 dark:bg-gray-800/40 shadow-sm
                  scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-gray-700"
                    >
                      <div className="flex justify-end p-2">
                        <button
                          onClick={toggleSelectAll}
                          className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          {checkedUsers.length === selectedUsers.length
                            ? "Unselect All"
                            : "Select All"}
                        </button>
                      </div>

                      {selectedUsers.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                          No users found.
                        </p>
                      ) : (
                        <ul className="space-y-2 px-2 pb-2">
                          {selectedUsers.map((u) => (
                            <li
                              key={u.id}
                              className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition cursor-pointer"
                              onClick={() => toggleUserCheck(u.id)}
                            >
                              <input
                                type="checkbox"
                                checked={checkedUsers.includes(u.id)}
                                onChange={() => toggleUserCheck(u.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                              />
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                  {u.name}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {u.phone}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Scheduling Options */}
                <div className="mb-4">
                  <p className="font-medium mb-2">Scheduling options:</p>

                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="schedule"
                      value="instant"
                      checked={formData.schedule === "instant"}
                      onChange={handleChange}
                    />
                    Instant sending
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="schedule"
                      value="future"
                      checked={formData.schedule === "future"}
                      onChange={handleChange}
                    />
                    Schedule for the future
                  </label>

                  {formData.schedule === "future" && (
                    <div className="mt-3">
                      <DatePicker
                        selected={formData.futureDate}
                        onChange={(date: Date | null) =>
                          setFormData({
                            ...formData,
                            futureDate: date || new Date(),
                          })
                        }
                        showTimeSelect
                        dateFormat="dd/MM/yyyy h:mm aa"
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => handleSave(formData)}
                    disabled={loadingSend}
                    className={`px-4 py-2 rounded-lg text-white ${
                      loadingSend
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {loadingSend ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      "Send Notification"
                    )}
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

export default Notifications;
