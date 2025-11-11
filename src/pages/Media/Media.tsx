import { useEffect, useState } from "react";
import { HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Modal } from "../../components/ui/modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);

  const [filterType, setFilterType] = useState("image");
  const [filterDepartment, setFilterDepartment] = useState("");

  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);

  const token = localStorage.getItem("accessToken");

  // Fetch media
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        let url = `https://api.tik-mall.com/admin/api/list/media?type=${filterType}&skip=0&limit=10`;
        if (filterDepartment) url += `&storeDepartment=${filterDepartment}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
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

  // Extract unique departments from media for filter
  // Fetch all departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(
          "https://api.tik-mall.com/admin/api/list/media",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        const formatted = data.items.map((d: Department) => ({
          _id: d._id,
          name: d.name.ar,
        }));
        setDepartments(formatted);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDepartments();
  }, [token]);

  const handleDelete = (id: string) => {
    setMediaToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/media/${mediaToDelete}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setMedia((prev) => prev.filter((item) => item._id !== mediaToDelete));
        toast.success("Media deleted successfully ✅");
      } else {
        toast.error(data.error || "Failed to delete media ❌");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting.");
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
            Loading <span className="text-blue-500">Media</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-[#0a0a0a]">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2
        className="text-2xl md:text-3xl font-bold mb-4"
        style={{ color: "#456FFF" }}
      >
        Media
      </h2>

      {/* FILTERS */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-white"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="rounded-md border px-3 py-2 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <div
            key={item._id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all hover:shadow-lg dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
              <h3 className="truncate text-lg font-semibold">{item.title}</h3>
              <p className="truncate text-sm text-gray-200">
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
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No media found.
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
          Delete Media
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this media?
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="rounded-md px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Media;
