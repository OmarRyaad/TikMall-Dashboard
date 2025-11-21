"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../components/ui/modal";
import { toast, ToastContainer } from "react-toastify";
import { Squares2X2Icon } from "@heroicons/react/24/outline";

interface Department {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  icon: string;
}
interface IconType {
  url: string;
  loading: boolean;
}

const Sections = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    nameAr: "",
    nameEn: "",
    descAr: "",
    descEn: "",
    icons: [] as IconType[], // array of images
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);
  const [saving, setSaving] = useState(false); // for create/save button
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  // Fetch departments
  useEffect(() => {
    if (!token) return;
    fetch("https://api.tik-mall.com/admin/api/all/departments", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch departments");
        return res.json();
      })
      .then((data) => {
        if (data?.departments?.length) setDepartments(data.departments);
        else setError("No departments found.");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  // Open edit modal
  const handleEdit = (dept: Department) => {
    setIsEditMode(true);
    setFormData({
      id: dept._id,
      nameAr: dept.name.ar,
      nameEn: dept.name.en,
      descAr: dept.description.ar,
      descEn: dept.description.en,
      icons: dept.icon ? [{ url: dept.icon, loading: false }] : [],
    });
    setIsOpen(true);
  };

  // Open add modal
  const handleAdd = () => {
    setIsEditMode(false);
    setFormData({
      id: "",
      nameAr: "",
      nameEn: "",
      descAr: "",
      descEn: "",
      icons: [],
    });
    setIsOpen(true);
  };

  // Delete
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(
        `https://api.tikimall.com/admin/api/department/${deleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete department");
        return;
      }
      setDepartments((prev) => prev.filter((d) => d._id !== deleteId));
      setDeleteModalOpen(false);
      setDeleteId(null);
      toast.success("Department deleted successfully");
    } catch {
      toast.error("Something went wrong");
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle icon upload
  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be < 10MB");
      return;
    }

    try {
      // (1) اطلب presigned URL بالصيغة الصحيحة
      const res = await fetch("https://api.tik-mall.com/upload/get-presigned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          files: [
            {
              filename: file.name,
              contentType: file.type,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.items?.length) {
        toast.error(data.error || "Failed to get upload URL");
        return;
      }

      const uploadItem = data.items[0];

      // (2) ارفع الصورة Binary باستخدام PUT
      const uploadRes = await fetch(uploadItem.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        toast.error("Image upload failed");
        return;
      }

      // (3) رابط الصورة النهائي
      const finalImageURL = uploadItem.fileUrl;

      // (4) خزّنه في formData
      setFormData((prev) => ({
        ...prev,
        icons: [
          {
            url: finalImageURL,
            loading: false,
          },
        ],
      }));

      toast.success("Icon uploaded successfully");
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong while uploading image");
    }
  };

  const handleCancel = () => setIsOpen(false);

  const handleSave = async () => {
    if (!formData.nameEn || !formData.nameAr) {
      toast.error("Name in both languages is required");
      return;
    }

    setSaving(true); // start loading
    try {
      if (isEditMode) {
        // EDIT logic
        const res = await fetch(
          `https://api.tik-mall.com/admin/api/department/${formData.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: { en: formData.nameEn, ar: formData.nameAr },
              description: { en: formData.descEn, ar: formData.descAr },
              icons: formData.icons,
            }),
          }
        );
        const updated = await res.json();
        if (!res.ok) {
          toast.error(updated.error || "Failed to update department");
          setSaving(false);
          return;
        }
        setDepartments((prev) =>
          prev.map((d) => (d._id === formData.id ? updated.department : d))
        );
        toast.success("Department updated successfully");
        setIsOpen(!keepOpen ? false : true);
      } else {
        // ADD logic
        const res = await fetch(
          "https://api.tik-mall.com/admin/api/create/department",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: { en: formData.nameEn, ar: formData.nameAr },
              description: { en: formData.descEn, ar: formData.descAr },
              icons: formData.icons,
            }),
          }
        );
        const result = await res.json();
        if (!res.ok) {
          toast.error(result.error || "Failed to create department");
          setSaving(false);
          return;
        }
        setDepartments((prev) => [...prev, result.department]);
        toast.success("Department created successfully");

        if (keepOpen) {
          setFormData({
            id: "",
            nameAr: "",
            nameEn: "",
            descAr: "",
            descEn: "",
            icons: [],
          });
        } else {
          setIsOpen(false);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false); // end loading
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
            Loading <span className="text-blue-500">Sections</span>...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-64 text-gray-500">
        <p>{error}</p>
        <img
          src="/no-data.svg"
          alt="No Data"
          className="w-40 h-40 mt-4 opacity-50"
        />
      </div>
    );

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />
      <h2
        className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4"
        style={{ color: "#456FFF" }}
      >
        <Squares2X2Icon className="w-8 h-8 text-blue-600" />
        Sections
      </h2>

      {/* Add Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleAdd}
          className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
        >
          + Add Section
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/3 sm:px-6">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  #
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Icon
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Name (AR/EN)
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Description
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {departments.length ? (
                departments.map((dept, idx) => (
                  <tr
                    key={dept._id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <img
                        src={dept?.icon || "/placeholder.jpg"}
                        alt={dept?.name?.en}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {dept?.name?.ar} / {dept?.name?.en}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                      {dept?.description?.ar || dept?.description?.en}
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(dept._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                    colSpan={5}
                  >
                    No departments available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit / Add Modal */}
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
                    {isEditMode ? "Edit Section" : "Add New Section"}
                  </h2>

                  <div className="space-y-3">
                    <input
                      type="text"
                      name="nameAr"
                      placeholder="Name (Arabic)"
                      value={formData.nameAr}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded text-gray-800 dark:text-white"
                    />
                    <input
                      type="text"
                      name="nameEn"
                      placeholder="Name (English)"
                      value={formData.nameEn}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded text-gray-800 dark:text-white"
                    />
                    <textarea
                      name="descAr"
                      placeholder="Description (Arabic)"
                      value={formData.descAr}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20 text-gray-800 dark:text-white"
                    />
                    <textarea
                      name="descEn"
                      placeholder="Description (English)"
                      value={formData.descEn}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20 text-gray-800 dark:text-white"
                    />

                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="keepOpen"
                        checked={keepOpen}
                        onChange={() => setKeepOpen((prev) => !prev)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="keepOpen"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Add multiple sections without closing
                      </label>
                    </div>

                    <div className="flex items-center space-x-4 flex-wrap mt-2">
                      <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                        Choose Icons
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.icons.length ? (
                          formData.icons.map((icon, idx) => (
                            <div
                              key={idx}
                              className="relative h-12 w-12 rounded-md border border-gray-300 dark:border-gray-700 overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                            >
                              {icon.loading && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                              )}

                              {!icon.loading && icon.url && (
                                <img
                                  src={icon.url}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    icons: prev.icons.filter(
                                      (_, i) => i !== idx
                                    ),
                                  }))
                                }
                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              >
                                &times;
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="h-12 w-12 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            No Icons
                          </div>
                        )}
                      </div>
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
                      onClick={handleSave}
                      disabled={saving}
                      className={`px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center justify-center gap-2 ${
                        saving ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {saving && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {isEditMode ? "Save" : "Create"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* DELETE MODAL */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          className={`max-w-md p-6 transform transition-all duration-300
        ${deleteModalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
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
    </>
  );
};

export default Sections;
