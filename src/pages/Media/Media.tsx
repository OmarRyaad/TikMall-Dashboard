"use client";
import { useEffect, useState } from "react";
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  PhotoIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../context/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";

interface UploadedBy {
  _id: string;
  name: string;
  storeName: string;
}

interface StoreDepartment {
  icon: string;
  _id: string;
  name: { en: string; ar: string };
}

interface MediaItem {
  url: string;
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  likesCount: number;
  uploadedBy: UploadedBy;
  storeDepartment: StoreDepartment;
}

interface Department {
  _id: string;
  name: { en: string; ar: string };
}

interface Comment {
  repliesCount: number;
  _id: string;
  user: { _id: string; name: string };
  comment: string;
  replies: Comment[];
  createdAt: string;
}

const Media = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters //
  const [filterType, setFilterType] = useState("image");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);

  const [selectedComment, setSelectedComment] = useState<{
    mediaId: string;
    description: string;
  } | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const openCommentPopup = async (mediaId: string, description: string) => {
    setSelectedComment({ mediaId, description });
    setLoadingComments(true);
    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/media/${mediaId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء جلب التعليقات"
          : "Failed to load comments"
      );
    } finally {
      setLoadingComments(false);
    }
  };

  const closeCommentPopup = () => {
    setSelectedComment(null);
    setComments([]);
  };

  const handleDeleteComment = async (mediaId: string, commentId: string) => {
    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/media/${mediaId}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete comment");
      toast.success(lang === "ar" ? "تم حذف التعليق" : "Comment deleted");
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "حدث خطأ أثناء الحذف" : "Error deleting comment"
      );
    }
  };

  const handleDeleteReply = async (
    mediaId: string,
    commentId: string,
    replyId: string
  ) => {
    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/media/${mediaId}/comment/${commentId}/reply/${replyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete reply");
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        )
      );
      toast.success(lang === "ar" ? "تم حذف الرد" : "Reply deleted");
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "حدث خطأ أثناء الحذف" : "Error deleting reply"
      );
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!token) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`https://api.tik-mall.com/media/${mediaId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete media");

      toast.success(lang === "ar" ? "تم حذف الوسائط" : "Media deleted");

      setMedia((prev) => prev.filter((m) => m._id !== mediaId));
    } catch {
      toast.error(
        lang === "ar" ? "حدث خطأ أثناء الحذف" : "Failed to delete media"
      );
    }

    setDeleteLoading(false);
    setDeleteModalOpen(false);
    setMediaToDelete(null);
  };

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = `https://api.tik-mall.com/admin/api/list/media?type=${filterType}&skip=0&limit=10`;
      if (filterDepartment) url += `&storeDepartment=${filterDepartment}`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const items = data.items || [];
      setMedia(items);

      // Update departments dynamically
      const uniqueDepartmentsMap: Record<string, string> = {};
      items.forEach((item: MediaItem) => {
        if (
          item.storeDepartment?._id &&
          !uniqueDepartmentsMap[item.storeDepartment._id]
        ) {
          uniqueDepartmentsMap[item.storeDepartment._id] =
            lang === "ar"
              ? item.storeDepartment.name.ar
              : item.storeDepartment.name.en;
        }
      });
      const uniqueDepartments = Object.entries(uniqueDepartmentsMap).map(
        ([id, name]) => ({ _id: id, name })
      );
      setDepartments(uniqueDepartments);
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filterType, filterDepartment, token, lang]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          "https://api.tik-mall.com/admin/api/list/media",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        const formatted = data.items.map((d: Department) => ({
          _id: d._id,
          name: lang === "ar" ? d.name.ar : d.name.en,
        }));
        setDepartments(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, [token, lang]);

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
              {lang === "ar" ? "الوسائط" : "Media"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6"
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <h2
        className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4"
        style={{ color: "#456FFF" }}
      >
        <PhotoIcon className="w-8 h-8 text-blue-600" />
        {lang === "ar" ? "الوسائط" : "Media"}
      </h2>

      {/* FILTERS */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-4 rounded-xl px-5 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
            {/* Type Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <PhotoIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {lang === "ar" ? "الفلتر حسب النوع:" : "Filter by type:"}
                </span>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="image">{lang === "ar" ? "صور" : "Image"}</option>
                <option value="video">
                  {lang === "ar" ? "فيديو" : "Video"}
                </option>
              </select>
            </div>

            {/* Department Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <BuildingOffice2Icon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {lang === "ar"
                    ? "الفلتر حسب القسم:"
                    : "Filter by department:"}
                </span>
              </div>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="">
                  {lang === "ar" ? "جميع الأقسام" : "All Departments"}
                </option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Refresh Button */}
          <div className="flex gap-2">
            <button
              onClick={() => fetchMedia()}
              className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              {lang === "ar" ? "تحديث" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {/* Facebook Style Feed - Compact Admin View */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {media.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {item.storeDepartment?.icon && (
                  <img
                    src={item.storeDepartment.icon}
                    alt="department icon"
                    className="w-6 h-6 object-cover rounded"
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {item.uploadedBy?.name}
                </p>
                <p className="font-semibold text-[#3ab4ff] dark:text-[#66d2ff] text-sm">
                  {item.uploadedBy?.storeName}
                </p>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {item.storeDepartment?.name?.[lang]}
                </p>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <p className="px-3 pb-2 text-gray-800 dark:text-gray-200 text-xs leading-relaxed">
                {item.description}
              </p>
            )}

            {/* Media */}
            <div className="relative w-full h-[500px] dark:bg-gray-800 overflow-hidden rounded-lg">
              {filterType === "image" && (
                <button
                  onClick={() => window.open(item.thumbnailUrl, "_blank")}
                  className="absolute top-3 right-3 z-20 bg-black/60 text-white px-3 py-1 rounded-md text-xs hover:bg-black transition"
                >
                  {lang === "ar" ? "عرض كامل" : "View Full"}
                </button>
              )}

              <div
                className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-500 pointer-events-none"
                data-loading={
                  filterType === "video" ? item.url?.[0] : item.thumbnailUrl
                }
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {lang === "ar" ? "جاري التحميل..." : "Loading..."}
                  </p>
                </div>
              </div>

              {/* Actual Media */}
              {filterType === "video" && item.url?.length ? (
                <video
                  controls
                  poster={item.thumbnailUrl}
                  className="w-full h-full object-cover"
                  onCanPlayThrough={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelector("[data-loading]")
                      ?.classList.add("opacity-0");
                  }}
                  onError={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelector("[data-loading]")
                      ?.classList.add("opacity-0");
                  }}
                >
                  <source src={item.url[0]} type="video/mp4" />
                  {lang === "ar"
                    ? "المتصفح لا يدعم الفيديو"
                    : "Your browser does not support the video tag."}
                </video>
              ) : (
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onLoad={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelector("[data-loading]")
                      ?.classList.add("opacity-0");
                  }}
                  onError={(e) => {
                    e.currentTarget.parentElement
                      ?.querySelector("[data-loading]")
                      ?.classList.add("opacity-0");
                  }}
                />
              )}
            </div>

            {/* Actions */}
            <div className="px-3 py-2">
              {/* Likes Count */}
              <div className="flex items-center gap-1 mb-2">
                <HeartIcon className="w-4 h-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-300 text-xs">
                  {item.likesCount} {lang === "ar" ? "إعجاب" : "Likes"}
                </span>
              </div>

              {/* Buttons Row */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex items-center justify-around">
                {/* Comment Button */}
                <button
                  onClick={() => openCommentPopup(item._id, item.description)}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded w-full justify-center text-xs transition"
                >
                  <ChatBubbleOvalLeftIcon className="w-5 h-5" />
                  {lang === "ar" ? "التعليقات" : "Comments"}
                </button>
                <button
                  onClick={() => {
                    setMediaToDelete(item._id);
                    setDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-red-600 hover:bg-red-100 px-2 py-1 rounded w-full justify-center text-xs transition"
                >
                  <TrashIcon className="w-4 h-4" />
                  {lang === "ar" ? "حذف" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {media.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v18h18V3H3zm4 4h10v10H7V7z"
                />
              </svg>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium">
              {lang === "ar" ? "لا توجد وسائط" : "No media found."}
            </p>

            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {lang === "ar"
                ? "حاول رفع وسائط جديدة"
                : "Try uploading new media."}
            </p>
          </div>
        )}
      </div>

      {/* Comment Popup */}
      {selectedComment && (
        <div className="fixed inset-0 mt-15 z-50 flex items-center justify-center bg-black/40 p-2">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto relative shadow-lg">
            {/* Close Button */}
            <button
              onClick={closeCommentPopup}
              className={`absolute top-4 ${
                isRTL ? "left-4" : "right-4"
              } z-10 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all`}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Media Description */}
            <p className="mb-4 text-gray-700 dark:text-gray-200">
              {selectedComment.description}
            </p>

            {/* Comments List */}
            <div className="space-y-3">
              {loadingComments ? (
                <div className="flex items-center justify-center h-40 bg-transparent">
                  <div className="relative flex flex-col items-center">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
                      <div className="absolute inset-1 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" />
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-300 animate-bounce [animation-delay:0.3s]" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300 animate-pulse text-center">
                      {lang === "ar" ? "جاري تحميل " : "Loading "}
                      <span className="text-blue-500">
                        {lang === "ar" ? "التعليقات" : "Comments"}
                      </span>
                      ...
                    </p>
                  </div>
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c._id}
                    className="flex flex-col bg-gray-50 dark:bg-gray-700 rounded-xl p-3 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                          {c.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">
                            {c.user.name}
                          </p>
                          <p className="text-gray-700 dark:text-gray-200 text-sm">
                            {c.comment}
                          </p>
                          <small className="text-gray-400">
                            {new Date(c.createdAt).toLocaleString()}
                          </small>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteComment(selectedComment.mediaId, c._id)
                        }
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        {lang === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>

                    {/* Replies */}
                    <div className="pl-10 mt-2 space-y-2">
                      {c.replies.map((r) => (
                        <div
                          key={r._id}
                          className="flex items-start justify-between"
                        >
                          <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                              {r.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-gray-100">
                                {r.user.name}
                              </p>
                              <p className="text-gray-700 dark:text-gray-200 text-sm">
                                {r.comment}
                              </p>
                              <small className="text-gray-400">
                                {new Date(r.createdAt).toLocaleString()}
                              </small>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteReply(
                                selectedComment.mediaId,
                                c._id,
                                r._id
                              )
                            }
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            {lang === "ar" ? "حذف" : "Delete"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {lang === "ar"
                  ? "هل أنت متأكد من حذف هذه الوسائط نهائيًا؟"
                  : "Are you sure you want to delete this media permanently?"}
              </p>

              <div className="mt-5 flex justify-end gap-3">
                {/* Cancel */}
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setMediaToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>

                {/* Confirm Delete */}
                <button
                  onClick={() =>
                    mediaToDelete && handleDeleteMedia(mediaToDelete)
                  }
                  disabled={deleteLoading}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
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

export default Media;
