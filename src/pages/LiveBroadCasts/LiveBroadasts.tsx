"use client";
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  HashtagIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import { ToastContainer, toast } from "react-toastify"; // Added toast import
import { EyeIcon, UserCircleIcon } from "../../icons";
import { useLanguage } from "../../context/LanguageContext";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import CryptoJS from "crypto-js";

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
  streamUrl?: string; // Fallback iframe URL
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
  const zegoInstanceRef = useRef<ReturnType<
    typeof ZegoUIKitPrebuilt.create
  > | null>(null);

  const totalActive = broadcasts.length;

  // ==== ZEGOCLOUD Credentials ====
  const ZEGO_APP_ID = 1065201027;
  const ZEGO_SERVER_SECRET =
    "bfe3a5e0c3cfd5258e5a2368ef225386c15e433c345ab25c2f994d71bcafcc4f"; // WARNING: Client-side exposure is insecure!

  // Fixed Zego Token Generation (Token04 format)
  async function generateZegoToken(
    appId: number,
    userId: string,
    roomId: string,
    effectiveTimeInSeconds: number = 7200
  ): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const expireTime = timestamp + effectiveTimeInSeconds;
    const nonce = Math.floor(Math.random() * 0x7fffffff); // 32-bit signed int

    // Privilege payload for audience: disable publish (1=0), enable login (2=1)
    const privilegePayload = JSON.stringify({
      room_id: roomId,
      privilege: { 1: 0, 2: 1 },
      stream_id_list: null,
    });

    // Binary buffer for signing (little-endian)
    const bufferSize = 28 + privilegePayload.length; // 4(appId) + 8(ctime) + 4(nonce) + 8(expire) + 4(len) + payload
    const buffer = new ArrayBuffer(bufferSize);
    const dataView = new DataView(buffer);

    // Pack fields
    dataView.setUint32(0, appId, true); // appId uint32 LE
    dataView.setBigInt64(4, BigInt(timestamp), true); // ctime int64 LE
    dataView.setInt32(12, nonce, true); // nonce int32 LE
    dataView.setBigInt64(16, BigInt(expireTime), true); // expire int64 LE
    dataView.setUint32(24, privilegePayload.length, true); // payload len uint32 LE
    // Copy payload string as UTF-8 bytes
    for (let i = 0; i < privilegePayload.length; i++) {
      dataView.setUint8(28 + i, privilegePayload.charCodeAt(i));
    }

    // Sign with HMAC-SHA256 (secret as hex bytes)
    const secretBytes = CryptoJS.enc.Hex.parse(ZEGO_SERVER_SECRET);
    const bufferHex = CryptoJS.lib.WordArray.create(new Uint8Array(buffer));
    const hash = CryptoJS.HmacSHA256(bufferHex, secretBytes);
    const signatureHex = hash.toString(CryptoJS.enc.Hex);

    // Token struct
    const tokenPayload = {
      app_id: appId,
      user_id: userId,
      nonce,
      ctime: timestamp,
      expire: expireTime,
      signature: signatureHex,
      payload: privilegePayload, // Include privileges here
    };

    // Base64 URL-safe
    const jsonStr = JSON.stringify(tokenPayload);
    const base64 = btoa(jsonStr)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const rawToken = `04${base64}`;
    console.log(
      "Generated Zego Token:",
      rawToken.substring(0, 50) + "... (length:",
      rawToken.length,
      ")"
    ); // Debug: Validate length
    return rawToken;
  }

  const fetchBroadcasts = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");

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

  // ZEGOCLOUD Integration
  useEffect(() => {
    if (!selectedBroadcast?.uid) return;
    const roomID = selectedBroadcast.uid;

    const container = document.getElementById("zego-container");
    if (!container) {
      console.warn("Zego container not found");
      return;
    }

    const userID = `admin_viewer_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const userName = userID;

    let renewalTimer: NodeJS.Timeout | null = null;
    let currentZegoInstance: ReturnType<
      typeof ZegoUIKitPrebuilt.create
    > | null = null;

    const createAndJoinWithToken = async () => {
      try {
        const rawToken = await generateZegoToken(
          ZEGO_APP_ID,
          userID,
          roomID,
          7200
        );
        console.log(
          "Raw Zego Token generated:",
          rawToken.substring(0, 60) + "..."
        );

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          ZEGO_APP_ID,
          rawToken,
          roomID,
          userID,
          userName
        );
        console.log("Kit Token generated (length:", kitToken.length, ")");

        currentZegoInstance?.destroy();
        currentZegoInstance = ZegoUIKitPrebuilt.create(kitToken);
        zegoInstanceRef.current = currentZegoInstance;

        if (renewalTimer) clearTimeout(renewalTimer);
        const bufferTime = 30 * 60 * 1000; // 30 minutes buffer
        renewalTimer = setTimeout(() => {
          console.log("Proactive token renewal: Recreating instance");
          createAndJoinWithToken();
        }, 7200 * 1000 - bufferTime); // Renew after ~1.5 hours

        currentZegoInstance.joinRoom({
          container,
          scenario: {
            mode: ZegoUIKitPrebuilt.LiveStreaming,
            config: { role: ZegoUIKitPrebuilt.Audience },
          },
          showMyCameraToggleButton: false,
          showMyMicrophoneToggleButton: false,
          showAudioVideoSettingsButton: false,
          showScreenSharingButton: false,
          showTextChat: true,
          showUserList: false,
          showRoomTimer: true,
          showLeaveRoomConfirmDialog: false,
          lowerLeftNotification: {
            showUserJoinAndLeave: false,
            showTextChat: false,
          },
          onLeaveRoom: () => {
            // ← FIXED: No parameters!
            console.log("Left room - possible token expiry or user action");
            setSelectedBroadcast(null);
            toast.warn(
              lang === "ar"
                ? "تم مغادرة البث، يتم استخدام النسخة الاحتياطية"
                : "Left the stream, using fallback"
            );
            if (selectedBroadcast?.streamUrl) {
              setIframeUrl(selectedBroadcast.streamUrl);
            }
          },
          onJoinRoom: () => console.log("Joined room:", roomID),
          ...(isRTL && {
            layout: "Sidebar",
            style: { container: { direction: "rtl" } },
          }),
        });
      } catch (err) {
        console.error("Failed to create/join with token:", err);
        toast.error(
          lang === "ar"
            ? "فشل تحميل البث، يتم استخدام النسخة الاحتياطية"
            : "Failed to load stream, using fallback"
        );
        setIframeUrl(selectedBroadcast.streamUrl ?? "");
        setSelectedBroadcast(null);
      }
    };

    createAndJoinWithToken();

    return () => {
      if (renewalTimer) clearTimeout(renewalTimer);
      currentZegoInstance?.destroy();
      zegoInstanceRef.current = null;
    };
  }, [selectedBroadcast, isRTL, lang]);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleWatchBroadcast = (broadcast: Broadcast) => {
    if (broadcast.uid) {
      setSelectedBroadcast(broadcast);
      setIframeUrl(null);
    } else if (broadcast.streamUrl) {
      setIframeUrl(broadcast.streamUrl);
      setSelectedBroadcast(null);
    } else {
      toast.error(
        lang === "ar"
          ? "لا يمكن تشغيل هذا البث: لا توجد بيانات التشغيل"
          : "Cannot play this broadcast: No stream data available"
      );
    }
  };

  const handleEndBroadcast = async (broadcast: Broadcast) => {
    if (
      !window.confirm(
        lang === "ar"
          ? `هل أنت متأكد من إنهاء البث "${broadcast.title || "Untitled"}"؟`
          : `Are you sure you want to end the broadcast "${
              broadcast.title || "Untitled"
            }"?`
      )
    )
      return;

    try {
      const token = localStorage.getItem("accessToken");
      // TODO: Replace with your API endpoint (e.g., https://api.tik-mall.com/admin/api/live-streams/${broadcast._id}/end)
      // Zego rooms auto-expire if empty; no direct "terminate" API from client.
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/live-streams/${broadcast._id}/end`,
        {
          // Example URL
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "ended" }), // Example payload
        }
      );

      if (!res.ok) throw new Error(`Failed: ${res.status}`);

      toast.success(
        lang === "ar" ? "تم إنهاء البث بنجاح" : "Broadcast ended successfully"
      );
      fetchBroadcasts();
    } catch (error) {
      console.error("Error ending broadcast:", error);
      toast.error(
        lang === "ar"
          ? "فشل في إنهاء البث. حاول مرة أخرى."
          : "Failed to end broadcast. Please try again."
      );
    }
  };

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

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <p className="text-xs">
                  {new Date(broadcast.createdAt).toLocaleString(
                    lang === "ar" ? "ar-EG" : "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <EyeIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {broadcast.viewersCount ?? 0}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => handleWatchBroadcast(broadcast)}
                className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm font-semibold"
              >
                {lang === "ar" ? "مشاهدة" : "Watch"}
              </button>
              <button
                onClick={() => handleEndBroadcast(broadcast)}
                className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm font-semibold"
              >
                {lang === "ar" ? "إنهاء" : "End"}
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
            <div className="p-4 bg-gray-50 dark:bg-gray-900 text-center text-sm text-gray-600">
              {lang === "ar"
                ? "بث احتياطي (Fallback Stream)"
                : "Fallback Stream"}
            </div>
          </div>
        </div>
      )}

      {/* ZEGOCLOUD Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10001] p-4">
          <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
            <div className="relative p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <VideoCameraIcon className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedBroadcast.title ||
                      (lang === "ar" ? "بث مباشر" : "Live Broadcast")}
                  </h3>
                  <p className="text-sm opacity-90">
                    {lang === "ar"
                      ? selectedBroadcast.storeDepartment?.name?.ar || "القسم"
                      : selectedBroadcast.storeDepartment?.name?.en ||
                        "Department"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {selectedBroadcast.viewersCount ?? 0}
                </span>
                <button
                  onClick={() => setSelectedBroadcast(null)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition"
                  title={lang === "ar" ? "إغلاق" : "Close"}
                >
                  ×
                </button>
              </div>
            </div>

            <div
              id="zego-container"
              className="w-full h-[calc(100%-80px)]"
              style={{ direction: isRTL ? "rtl" : "ltr" }}
            >
              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900">
                <div className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
                    <VideoCameraIcon className="absolute inset-0 w-8 h-8 m-auto text-blue-500" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {lang === "ar"
                      ? "جاري تحميل البث المباشر..."
                      : "Loading live stream..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveBroadcasts;
