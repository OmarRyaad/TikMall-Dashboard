"use client";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  HashtagIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { EyeIcon, UserCircleIcon } from "../../icons";
import { useLanguage } from "../../context/LanguageContext";

interface Broadcast {
  _id: string;
  title?: string;
  status?: string;
  createdAt: string;
  uid?: string; // ZEGO liveID (roomID)
  viewersCount?: number;
  streamedBy?: {
    _id: string;
    role: string;
    storeName: string;
  };
  storeDepartment?: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    description: {
      en: string;
      ar: string;
    };
    icon: string;
  };
  streamUrl?: string;
}

// ===== ZEGOCLOUD TYPES =====
interface ZegoJoinRoomConfig {
  container: HTMLElement;
  scenario: {
    mode: number;
    config: {
      role: number;
      turnOnCameraWhenJoining: boolean;
      turnOnMicrophoneWhenJoining: boolean;
    };
  };
  showPreJoinView?: boolean;
  sharedLinks?: Array<{ name: string; url: string }>;
}

export interface ZegoUIKitPrebuiltType {
  generateKitTokenForTest: (
    appID: number,
    serverSecret: string,
    roomID: string,
    userID: string,
    userName: string
  ) => string;

  create: (kitToken: string) => {
    joinRoom: (config: ZegoJoinRoomConfig) => void;
  };

  LiveStreaming: number;
  Audience: number;
  destroy?: () => void;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt?: ZegoUIKitPrebuiltType;
  }
}

const LiveBroadcasts = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const totalActive = broadcasts.length;

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [broadcastsToDelete, setBroadcastsToDelete] = useState<string | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  const fetchBroadcasts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/live-streams/active",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data: { items?: Broadcast[] } = await res.json();
      setBroadcasts(data.items ?? []);
    } catch (err) {
      console.error(err);
      setError(
        lang === "ar"
          ? "فشل جلب البثوث المباشرة."
          : "Failed to fetch live broadcasts."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadZegoScript = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.ZegoUIKitPrebuilt) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js";
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject("Failed to load ZEGO SDK");

      document.body.appendChild(script);
    });
  };

  const handleWatchBroadcast = async (broadcast: Broadcast) => {
    if (!broadcast.uid) return;

    setSelectedBroadcast(broadcast);

    try {
      await loadZegoScript();

      await new Promise((resolve) => requestAnimationFrame(resolve));

      const ZegoUIKitPrebuilt = window.ZegoUIKitPrebuilt;
      if (!ZegoUIKitPrebuilt || !containerRef.current) {
        console.error("❌ Zego SDK or container not ready");
        return;
      }

      const roomID = broadcast.uid;
      const userID = String(Math.floor(Math.random() * 100000));
      const userName = `SilentGuest_${userID}`;
      const appID = 1065201027;

      const serverSecret = "8f7648c057308ab28dd82c367208b4c5";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            role: ZegoUIKitPrebuilt.Audience,
            turnOnCameraWhenJoining: false,
            turnOnMicrophoneWhenJoining: false,
          },
        },
        showPreJoinView: false,
        sharedLinks: [
          {
            name: "Join silently",
            url:
              window.location.origin +
              window.location.pathname +
              "?roomID=" +
              roomID,
          },
        ],
      });

      console.log("✅ Joined silently as Audience!");
    } catch (error) {
      console.error("❌ Failed to join Zego room:", error);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to delete customer");

      toast.success(
        lang === "ar"
          ? "تم حذف العميل بنجاح!"
          : "Customer deleted successfully!"
      );
      setDeleteModalOpen(false);
      setBroadcastsToDelete(null);
      fetchBroadcasts();
    } catch {
      toast.error(
        lang === "ar" ? "خطأ أثناء حذف العميل" : "Error deleting customer"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    loadZegoScript();
  }, []);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] bg-transparent">
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
              {lang === "ar" ? "البثوث المباشرة النشطة" : "Active Broadcasts"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 text-lg mb-3">{error}</p>
        <button
          onClick={fetchBroadcasts}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          {lang === "ar" ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    );

  if (broadcasts.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="mb-4 opacity-80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-24 h-24 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h11a1 1 0 011 1v10a1 1 0 01-1 1H4a2 2 0 01-2-2V8a2 2 0 012-2z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-700">
          {lang === "ar" ? "لا توجد بثوث مباشرة نشطة" : "No Active Broadcasts"}
        </h3>
        <p className="text-gray-500 mt-2 mb-6">
          {lang === "ar"
            ? "لا يوجد حاليًا أي بث مباشر يعمل الآن."
            : "There are currently no live broadcasts streaming right now."}
        </p>
      </div>
    );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-bold mb-6 text-[#456FFF]">
        <VideoCameraIcon className="w-8 h-8 text-[#456FFF]" />
        {lang === "ar" ? "البثوث المباشرة النشطة" : "Active Live Broadcasts"}
        <span className="flex items-center gap-1 ml-3 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-semibold rounded-full">
          <HashtagIcon className="w-4 h-4" />
          {totalActive}
        </span>
      </h2>

      <div
        className={`flex gap-2 ${
          lang === "ar" ? "justify-start flex-row-reverse" : "justify-end"
        }`}
      >
        <button
          onClick={fetchBroadcasts}
          className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
        >
          <ArrowPathIcon className="w-5 h-5" />
          {lang === "ar" ? "تحديث" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {broadcasts.map((broadcast) => (
          <div
            key={broadcast._id}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-3">
              <img
                src={broadcast.storeDepartment?.icon}
                alt="icon"
                className="w-14 h-14 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {broadcast.title ||
                    (lang === "ar" ? "بث مباشر بدون عنوان" : "Untitled Live")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === "ar"
                    ? broadcast.storeDepartment?.name?.ar || "القسم"
                    : broadcast.storeDepartment?.name?.en || "Department"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-blue-500 dark:text-blue-400 group-hover:underline flex items-center gap-1">
                <HashtagIcon className="h-4 w-4" />
                ID: {broadcast._id.slice(-6)}
              </span>
              {broadcast.uid && (
                <span className="text-xs text-green-600 dark:text-green-400 group-hover:underline flex items-center gap-1">
                  <HashtagIcon className="h-3 w-3" />
                  ZEGO: {broadcast.uid.slice(-8)}
                </span>
              )}
            </div>

            <div className="mt-3 text-sm space-y-2">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BuildingStorefrontIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <p>
                  <strong>{lang === "ar" ? "المتجر:" : "Store:"}</strong>{" "}
                  {broadcast.streamedBy?.storeName || "غير متوفر"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <UserCircleIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <p>
                  <strong>{lang === "ar" ? "يقدمه:" : "Streamed By:"}</strong>{" "}
                  {broadcast.streamedBy?.role === "store_owner"
                    ? lang === "ar"
                      ? "صاحب المتجر"
                      : "Store Owner"
                    : broadcast.streamedBy?.role || "غير معروف"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <EyeIcon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleWatchBroadcast(broadcast)}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
              >
                {lang === "ar" ? "مشاهدة" : "Watch"}
              </button>

              <button
                onClick={() => {
                  setBroadcastsToDelete(broadcast._id);
                  setDeleteModalOpen(true);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-semibold"
              >
                {lang === "ar" ? "إنهاء" : "Terminate"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fallback iframe */}
      {iframeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10000] p-4">
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            <button
              onClick={() => setIframeUrl(null)}
              className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
            >
              ×
            </button>
            <div className="flex items-center justify-center h-[80vh] p-4">
              <iframe
                src={iframeUrl}
                className="w-full h-full rounded-lg"
                title="Live Broadcast"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* ZEGOCLOUD Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 z-[10001] bg-black">
          <button
            onClick={() => {
              setSelectedBroadcast(null);

              const ZegoUIKitPrebuilt = window.ZegoUIKitPrebuilt;
              if (ZegoUIKitPrebuilt?.destroy) {
                ZegoUIKitPrebuilt.destroy();
              }
            }}
            className="absolute top-4 right-4 z-[10002] bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-black"
          >
            ×
          </button>

          {/* Zego Full UI Container */}
          <div
            ref={containerRef}
            className="w-screen h-screen"
            style={{ direction: "ltr" }}
          />
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {lang === "ar"
                  ? "هل أنت متأكد من حذف هذا البث؟ هذا الإجراء لا يمكن التراجع عنه."
                  : "Are you sure you want to delete this live? This action cannot be undone."}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setBroadcastsToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>

                <button
                  onClick={() =>
                    broadcastsToDelete &&
                    handleDeleteBroadcast(broadcastsToDelete)
                  }
                  disabled={deleteLoading}
                  className={`rounded-md px-5 py-2.5 text-sm font-medium text-white transition-colors ${
                    deleteLoading
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deleteLoading
                    ? lang === "ar"
                      ? "جاري الحذف..."
                      : "Deleting..."
                    : lang === "ar"
                    ? "حذف"
                    : "Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveBroadcasts;
