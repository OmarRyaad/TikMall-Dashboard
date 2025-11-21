import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import { BellAlertIcon } from "@heroicons/react/24/outline";
import Flatpickr from "react-flatpickr";
import "../../index.css";

interface User {
  id: string;
  name: string;
  phone: string | { number: string; isVerified: boolean };
}

const Notifications = () => {
  const [formData, setFormData] = useState({
    NotificationTitle: "",
    NotificationMessage: "",
    schedule: "instant",
    futureDate: new Date(),
  });

  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [originalUsers, setOriginalUsers] = useState<User[]>([]);
  const [checkedUsers, setCheckedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loadingSend, setLoadingSend] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  useEffect(() => {
    fetchSelectedUsers();
  }, []);

  const normalizePhone = (
    phone: string | { number: string; isVerified: boolean }
  ) => {
    if (!phone) return "";
    if (typeof phone === "string") return phone;
    if (typeof phone === "object") return phone.number || "";
    return "";
  };

  const fetchSelectedUsers = async () => {
    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/bulk/store_owner/ids",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();

      const normalized = (data.users || []).map(
        (u: { phone: string | { number: string; isVerified: boolean } }) => ({
          ...u,
          phone: normalizePhone(u.phone),
        })
      );

      setSelectedUsers(normalized);
      setOriginalUsers(normalized);
    } catch (error) {
      toast.error("Failed to fetch selected users.");
      console.error(error);
    }
  };

  // 🔍 SEARCH USERS HANDLER
  useEffect(() => {
    const delay = setTimeout(() => {
      if (search.trim() === "") {
        setSelectedUsers(originalUsers);
        return;
      }

      const fetchSearch = async () => {
        try {
          const res = await fetch(
            `https://api.tik-mall.com/admin/api/users/store_owner/${search}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!res.ok) throw new Error("Search failed");

          const data = await res.json();

          let users: User[] = [];

          if (data?.user) users = [data.user];
          else if (data?.users) users = data.users;

          const normalized = users.map((u) => ({
            ...u,
            phone: normalizePhone(u.phone),
          }));

          setSelectedUsers(normalized);
        } catch {
          toast.error("User not found");
          setSelectedUsers([]);
        }
      };

      fetchSearch();
    }, 500);

    return () => clearTimeout(delay);
  }, [search, token, originalUsers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      setFormData({
        NotificationTitle: "",
        NotificationMessage: "",
        schedule: "instant",
        futureDate: new Date(),
      });
      setCheckedUsers([]);
    } catch {
      toast.error("Error sending notification");
    } finally {
      setLoadingSend(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50 dark:bg-gray-900">
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="flex justify-between items-center mb-8">
        <h2
          className="flex items-center gap-2 text-3xl font-bold"
          style={{ color: "#456FFF" }}
        >
          <BellAlertIcon className="w-10 h-10" />
          Send Notifications
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Notification Content
            </h3>

            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Notification Title
            </label>
            <input
              type="text"
              name="NotificationTitle"
              value={formData.NotificationTitle}
              onChange={handleChange}
              className="w-full mb-4 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              placeholder="Enter notification title"
            />

            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Notification Message
            </label>
            <textarea
              name="NotificationMessage"
              value={formData.NotificationMessage}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              placeholder="Write your message..."
            />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Scheduling
            </h3>

            <label className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="schedule"
                value="instant"
                checked={formData.schedule === "instant"}
                onChange={handleChange}
              />
              Instant Sending
            </label>

            <label className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="schedule"
                value="future"
                checked={formData.schedule === "future"}
                onChange={handleChange}
              />
              Schedule for Future
            </label>

            {formData.schedule === "future" && (
              <div className="relative">
                <Flatpickr
                  value={formData.futureDate}
                  onChange={([date]) =>
                    setFormData({ ...formData, futureDate: date })
                  }
                  options={{
                    enableTime: true,
                    dateFormat: "d/m/Y h:i K",
                    time_24hr: false,
                    onOpen: () => {
                      document
                        .querySelectorAll(".flatpickr-calendar")
                        .forEach((el) => {
                          el.classList.toggle(
                            "dark",
                            document.documentElement.classList.contains("dark")
                          );
                        });
                    },
                  }}
                  className="w-full px-4 py-3 pr-10 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-all cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* USERS SIDE */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg px-7 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Users
            </h3>

            <button
              onClick={toggleSelectAll}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg"
            >
              {checkedUsers.length === selectedUsers.length
                ? "Unselect All"
                : "Select All"}
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by phone..."
            className="w-full mt-4 mb-3 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />

          <div className="max-h-[380px] overflow-y-auto">
            {selectedUsers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No users found.
              </p>
            ) : (
              <ul className="space-y-3">
                {selectedUsers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-pointer"
                    onClick={() => toggleUserCheck(u.id)}
                  >
                    <input
                      type="checkbox"
                      checked={checkedUsers.includes(u.id)}
                      onChange={() => toggleUserCheck(u.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />

                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {u.name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {normalizePhone(u.phone)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          onClick={() => handleSave(formData)}
          disabled={loadingSend}
          className={`px-6 py-3 rounded-xl text-white text-lg transition ${
            loadingSend
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loadingSend ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </div>
  );
};

export default Notifications;
