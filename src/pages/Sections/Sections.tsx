"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "../../components/ui/modal";
import { toast, ToastContainer } from "react-toastify";
import {
  Squares2X2Icon,
  Bars3Icon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

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
    icons: [] as IconType[],
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [keepOpen, setKeepOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch departments
  const fetchDepartments = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/all/departments",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error("Failed to fetch departments");

      const data = await res.json();

      if (data?.departments?.length) {
        setDepartments(data.departments);
      } else {
        setError(lang === "ar" ? "لا توجد أقسام" : "No departments found.");
        setDepartments([]);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Then update useEffect to just call this:
  useEffect(() => {
    fetchDepartments();
  }, [token, lang]);

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
        `https://api.tik-mall.com/admin/api/department/${deleteId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const backendError = data.error;
        const translated =
          lang === "ar" &&
          backendError ===
            "Cannot delete department assigned to store owners. Reassign or remove the department from all store owners first."
            ? "لا يمكن حذف القسم لأنه مُسند إلى أصحاب المتاجر. يرجى إعادة تعيينه أو إزالته من جميع أصحاب المتاجر أولاً."
            : backendError;

        toast.error(
          translated ||
            (lang === "ar" ? "فشل حذف القسم" : "Failed to delete department")
        );
        return;
      }

      setDepartments((prev) => prev.filter((d) => d._id !== deleteId));
      setDeleteModalOpen(false);
      setDeleteId(null);
      toast.success(
        lang === "ar" ? "تم حذف القسم بنجاح" : "Department deleted successfully"
      );
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Something went wrong");
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
      toast.error(
        lang === "ar"
          ? "حجم الصورة يجب أن يكون أقل من 10 ميجا"
          : "Image must be < 10MB"
      );
      return;
    }

    try {
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
        toast.error(
          data.error ||
            (lang === "ar" ? "فشل جلب رابط الرفع" : "Failed to get upload URL")
        );
        return;
      }

      const uploadItem = data.items[0];

      const uploadRes = await fetch(uploadItem.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        toast.error(lang === "ar" ? "فشل رفع الصورة" : "Image upload failed");
        return;
      }

      const finalImageURL = uploadItem.fileUrl;

      setFormData((prev) => ({
        ...prev,
        icons: [
          {
            url: finalImageURL,
            loading: false,
          },
        ],
      }));

      toast.success(
        lang === "ar" ? "تم رفع الأيقونة بنجاح" : "Icon uploaded successfully"
      );
    } catch (err) {
      console.log(err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء رفع الصورة"
          : "Something went wrong while uploading image"
      );
    }
  };

  const handleCancel = () => setIsOpen(false);

  const handleSave = async () => {
    if (!formData.nameEn || !formData.nameAr) {
      toast.error(
        lang === "ar"
          ? "الاسم مطلوب باللغتين"
          : "Name in both languages is required"
      );
      return;
    }

    setSaving(true);
    try {
      if (isEditMode) {
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
          toast.error(
            updated.error ||
              (lang === "ar"
                ? "فشل تحديث القسم"
                : "Failed to update department")
          );
          setSaving(false);
          return;
        }
        setDepartments((prev) =>
          prev.map((d) => (d._id === formData.id ? updated.department : d))
        );
        toast.success(
          lang === "ar"
            ? "تم تحديث القسم بنجاح"
            : "Department updated successfully"
        );
        setIsOpen(!keepOpen ? false : true);
      } else {
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
          toast.error(
            result.error ||
              (lang === "ar"
                ? "فشل إنشاء القسم"
                : "Failed to create department")
          );
          setSaving(false);
          return;
        }
        setDepartments((prev) => [...prev, result.department]);
        toast.success(
          lang === "ar"
            ? "تم إنشاء القسم بنجاح"
            : "Department created successfully"
        );

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
      toast.error(lang === "ar" ? "حدث خطأ ما" : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setActiveDragId(null);
      return;
    }

    const oldIndex = departments.findIndex((d) => d._id === active.id);
    const newIndex = departments.findIndex((d) => d._id === over.id);

    const newOrder = arrayMove(departments, oldIndex, newIndex);
    setDepartments(newOrder);

    try {
      const res = await fetch(
        "https://api.tik-mall.com/admin/api/departments/reorder",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstDepartmentId: active.id,
            secondDepartmentId: over.id,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save order");
      }

      toast.success(
        lang === "ar" ? "تم تحديث الترتيب بنجاح" : "Order updated successfully"
      );
    } catch {
      toast.error(lang === "ar" ? "فشل حفظ الترتيب" : "Failed to save order");
      setDepartments(departments); // revert
    } finally {
      setActiveDragId(null);
    }
  };

  // Sortable Row Component
  const SortableRow = ({
    dept,
    index,
  }: {
    dept: Department;
    index: number;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: dept._id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <tr
        ref={setNodeRef}
        style={style}
        className={`bg-white dark:bg-gray-900 ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
          <div className="flex items-center gap-3">
            <button
              {...listeners}
              {...attributes}
              className="cursor-grab active:cursor-grabbing touch-none"
            >
              <Bars3Icon className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
            <span>{index + 1}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <img
            src={dept.icon || "/placeholder.jpg"}
            alt={dept.name.en}
            className="h-12 w-12 rounded-md object-cover"
          />
        </td>
        <td
          className={`py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {lang === "ar" ? dept.name.ar : dept.name.en}
        </td>
        <td
          className={`py-3 px-4 text-sm text-gray-600 dark:text-gray-300 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {lang === "ar" ? dept.description.ar : dept.description.en}
        </td>
        <td className="py-3 px-4 flex gap-2">
          <button
            onClick={() => handleEdit(dept)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            {lang === "ar" ? "تعديل" : "Edit"}
          </button>
          <button
            onClick={() => handleDeleteClick(dept._id)}
            className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            {lang === "ar" ? "حذف" : "Delete"}
          </button>
        </td>
      </tr>
    );
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
              {lang === "ar" ? "الأقسام" : "Sections"}
            </span>
            ...
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

  const activeDept = activeDragId
    ? departments.find((d) => d._id === activeDragId)
    : null;

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
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
        {lang === "ar" ? "الأقسام" : "Sections"}
      </h2>

      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={handleAdd}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
        >
          + {lang === "ar" ? "إضافة قسم" : "Add Section"}
        </button>
        {/* Refresh Button */}
        <div className="flex gap-2">
          <button
            onClick={() => fetchDepartments()}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <div className="max-w-full overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full border-collapse">
              <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    #
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {lang === "ar" ? "الأيقونة" : "Icon"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {lang === "ar" ? "الاسم" : "Name"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {lang === "ar" ? "الوصف" : "Description"}
                  </th>
                  <th
                    className={`py-3 px-4 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {lang === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>

              <SortableContext
                items={departments.map((d) => d._id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {departments.length > 0 ? (
                    departments.map((dept, idx) => (
                      <SortableRow key={dept._id} dept={dept} index={idx} />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-gray-500"
                      >
                        {lang === "ar"
                          ? "لا توجد أقسام متاحة"
                          : "No departments available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </SortableContext>
            </table>

            <DragOverlay>
              {activeDept ? (
                <table className="w-full">
                  <tbody>
                    <tr className="bg-white dark:bg-gray-900 shadow-2xl border-2 border-blue-500 rounded-lg">
                      <td className="py-3 px-4">
                        <Bars3Icon className="w-6 h-6 text-gray-500" />
                      </td>
                      <td className="py-3 px-4">
                        <img
                          src={activeDept.icon || "/placeholder.jpg"}
                          alt=""
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {lang === "ar"
                          ? activeDept.name.ar
                          : activeDept.name.en}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm text-gray-600 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {lang === "ar"
                          ? activeDept.description.ar
                          : activeDept.description.en}
                      </td>
                      <td className="py-3 px-4"></td>
                    </tr>
                  </tbody>
                </table>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Your full modal code remains unchanged */}
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
                  {isEditMode
                    ? lang === "ar"
                      ? "تعديل القسم"
                      : "Edit Section"
                    : lang === "ar"
                    ? "إضافة قسم جديد"
                    : "Add New Section"}
                </h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="nameAr"
                        className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {lang === "ar" ? "الاسم (العربية)" : "Name (Arabic)"}
                      </label>
                      <input
                        id="nameAr"
                        type="text"
                        name="nameAr"
                        placeholder={
                          lang === "ar" ? "الاسم (العربية)" : "Name (Arabic)"
                        }
                        value={formData.nameAr}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded text-gray-800 dark:text-white"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="nameEn"
                        className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {lang === "ar"
                          ? "الاسم (الإنجليزية)"
                          : "Name (English)"}
                      </label>
                      <input
                        id="nameEn"
                        type="text"
                        name="nameEn"
                        placeholder={
                          lang === "ar"
                            ? "الاسم (الإنجليزية)"
                            : "Name (English)"
                        }
                        value={formData.nameEn}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded text-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="descAr"
                        className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {lang === "ar"
                          ? "الوصف (العربية)"
                          : "Description (Arabic)"}
                      </label>
                      <textarea
                        id="descAr"
                        name="descAr"
                        placeholder={
                          lang === "ar"
                            ? "الوصف (العربية)"
                            : "Description (Arabic)"
                        }
                        value={formData.descAr}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20 text-gray-800 dark:text-white resize-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label
                        htmlFor="descEn"
                        className="text-sm text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {lang === "ar"
                          ? "الوصف (الإنجليزية)"
                          : "Description (English)"}
                      </label>
                      <textarea
                        id="descEn"
                        name="descEn"
                        placeholder={
                          lang === "ar"
                            ? "الوصف (الإنجليزية)"
                            : "Description (English)"
                        }
                        value={formData.descEn}
                        onChange={handleChange}
                        className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20 text-gray-800 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
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
                      {lang === "ar"
                        ? "إضافة عدة أقسام دون إغلاق النافذة"
                        : "Add multiple sections without closing"}
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 flex-wrap mt-2">
                    <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                      {lang === "ar" ? "اختر الأيقونات" : "Choose Icons"}
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
                                alt="icon"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  icons: prev.icons.filter((_, i) => i !== idx),
                                }))
                              }
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="h-12 w-12 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                          {lang === "ar" ? "لا توجد أيقونات" : "No Icons"}
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
                    {lang === "ar" ? "إلغاء" : "Cancel"}
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
                    {isEditMode
                      ? lang === "ar"
                        ? "حفظ"
                        : "Save"
                      : lang === "ar"
                      ? "إنشاء"
                      : "Create"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        className={`max-w-md p-6 transform transition-all duration-300 ${
          deleteModalOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {lang === "ar" ? "حذف القسم" : "Delete Section"}
        </h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {lang === "ar"
            ? "هل أنت متأكد من حذف هذا القسم نهائيًا؟"
            : "Are you sure you want to delete this section?"}
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

export default Sections;
