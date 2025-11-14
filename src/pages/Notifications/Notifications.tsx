import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    NotificationTitle: "",
    NotificationMessage: "",
    schedule: "instant",
    futureDate: new Date(),
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Get token from localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  const openCreateModal = async () => {
    setIsOpen(true);
    await fetchSelectedUsers();
  };

  const handleCancel = () => {
    setIsOpen(false);
    setFormData({
      NotificationTitle: "",
      NotificationMessage: "",
      schedule: "instant",
      futureDate: new Date(),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Fetch selected users
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
      setSelectedUserIds(data.userIds || []);
    } catch (error) {
      toast.error("Failed to fetch selected users.");
      console.error(error);
    }
  };

  // Send notification
  const handleSave = async (data: typeof formData) => {
    if (!data.NotificationTitle || !data.NotificationMessage) {
      toast.error("Please enter both title and message.");
      return;
    }

    const payload = {
      userIds: selectedUserIds,
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

      if (!res.ok) throw new Error("Failed to send notification");

      toast.success("Notification sent successfully!");
      handleCancel();
    } catch (error) {
      toast.error("Error sending notification");
      console.error(error);
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl md:text-3xl font-bold mb-4"
          style={{ color: "#456FFF" }}
        >
          Notifications
        </h2>
        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
          >
            + Send Notifications
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Send Notifications
                </h2>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="NotificationTitle"
                    placeholder="Enter notification title"
                    value={formData.NotificationTitle}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    name="NotificationMessage"
                    placeholder="Enter notification message"
                    value={formData.NotificationMessage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <div>
                    <h2 className="text-xl font-semibold mb-4">
                      Scheduling options
                    </h2>
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="schedule"
                          value="instant"
                          checked={formData.schedule === "instant"}
                          onChange={handleChange}
                          className="form-check-input"
                        />
                        Instant sending
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="schedule"
                          value="future"
                          checked={formData.schedule === "future"}
                          onChange={handleChange}
                          className="form-check-input"
                        />
                        Schedule for the future
                      </label>
                    </div>

                    {formData.schedule === "future" && (
                      <div className="mt-3">
                        <DatePicker
                          selected={formData.futureDate}
                          onChange={(date: Date | null) => {
                            if (date)
                              setFormData({ ...formData, futureDate: date });
                          }}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="MMMM d, yyyy h:mm aa"
                          className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          calendarClassName="rounded-xl shadow-lg"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Selected: {format(formData.futureDate, "PPPpp")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(formData)}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                  >
                    Send Notification
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
