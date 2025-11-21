import { useEffect, useState } from "react";
import {
  BuildingOffice2Icon,
  HeartIcon,
  PhotoIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../context/LanguageContext";

interface UploadedBy {
  _id: string;
  name: string;
  storeName: string;
}

interface StoreDepartment {
  _id: string;
  name: { en: string; ar: string };
}

interface MediaItem {
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

const Media = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  const [filterType, setFilterType] = useState("image");
  const [filterDepartment, setFilterDepartment] = useState("");

  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Fetch media
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        let url = `https://api.tik-mall.com/admin/api/list/media?type=${filterType}&skip=0&limit=10`;
        if (filterDepartment) url += `&storeDepartment=${filterDepartment}`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setMedia(data.items || []);
      } catch (error) {
        console.error("Error fetching media:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [filterType, filterDepartment, token]);

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

  const handleDelete = (id: string) => {
    setMediaToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/media/${mediaToDelete}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMedia((prev) => prev.filter((item) => item._id !== mediaToDelete));
        toast.success(
          lang === "ar" ? "تم حذف الوسائط بنجاح" : "Media deleted successfully"
        );
      } else {
        toast.error(
          data.error ||
            (lang === "ar" ? "فشل حذف الوسائط" : "Failed to delete media")
        );
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء الحذف"
          : "An error occurred while deleting."
      );
    } finally {
      setDeleteModalOpen(false);
      setMediaToDelete(null);
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
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <div
            key={item._id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-white/[0.03]"
          >
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
              <h3 className="truncate text-lg font-semibold">{item.title}</h3>
              <p className="truncate group-hover:whitespace-normal text-sm text-gray-200 dark:text-gray-300">
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span>{item.uploadedBy.storeName}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="h-4 w-4 text-red-400" />
                    <span>{item.likesCount}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-1 text-xs font-medium transition hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {lang === "ar" ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            {lang === "ar" ? "لا توجد وسائط" : "No media found."}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className="max-w-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {lang === "ar" ? "حذف الوسائط" : "Delete Media"}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {lang === "ar"
            ? "هل أنت متأكد من حذف هذه الوسائط؟"
            : "Are you sure you want to delete this media?"}
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="rounded-md px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </button>
          <button
            onClick={handleConfirmDelete}
            className="rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            {lang === "ar" ? "حذف" : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Media;
