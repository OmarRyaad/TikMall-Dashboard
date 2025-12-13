import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLanguage } from "../../../context/LanguageContext";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  CameraIcon,
  ShoppingBagIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

interface StoreOwner {
  isApproved: boolean;
  _id: string;
  name: string;
  phone?: { number: string };
  storeName?: string;
  typeOfStore?: { ar: string; en: string }[];
  commercialRecordImg?: string;
  personaIdentityImg?: string;
  profileImg?: string;
  isActive: boolean;
}

const StoreOwnersProfile = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const navigate = useNavigate();

  const { ownerId } = useParams();
  const [owner, setOwner] = useState<StoreOwner | null>(null);
  const [allOwners, setAllOwners] = useState<StoreOwner[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* DELETE MODAL */
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/users/store_owner/all`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAllOwners(data.users || []);
      setOwner(
        data.users?.find((u: { _id: string }) => u._id === ownerId) || null
      );
    } catch {
      toast.error(lang === "ar" ? "فشل جلب البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [token, lang]);

  useEffect(() => {
    if (allOwners.length && ownerId) {
      const selected = allOwners.find((u) => u._id === ownerId) || null;
      setOwner(selected);
    }
  }, [allOwners, ownerId]);

  const toggleActivation = async (id: string, current: boolean) => {
    try {
      setActionLoading(true);

      const endpoint = current
        ? `https://api.tik-mall.com/admin/api/suspend/${id}` // Suspend if active
        : `https://api.tik-mall.com/admin/api/reactivate/${id}`; // Reactivate if inactive

      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
          : { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed");

      toast.success(
        current
          ? lang === "ar"
            ? "تم إلغاء التفعيل"
            : "Deactivated"
          : lang === "ar"
          ? "تم التفعيل"
          : "Activated"
      );

      fetchOwners();
    } catch (err) {
      console.log(err);
      toast.error(
        lang === "ar" ? "خطأ أثناء تغيير الحالة" : "Error updating status"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `https://api.tik-mall.com/admin/api/approve/${id}`,
        {
          method: "PATCH",
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Approval failed");

      toast.success(
        lang === "ar" ? "تم الموافقة على المتجر" : "Store approved successfully"
      );

      fetchOwners();
    } catch (err) {
      console.log(err);
      toast.error(
        lang === "ar" ? "خطأ أثناء الموافقة" : "Error approving store"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);

    try {
      const res = await fetch(
        `https://api.tik-mall.com/admin/api/delete/${id}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Failed to delete store owner");

      toast.success(
        lang === "ar"
          ? "تم حذف صاحب المتجر بنجاح!"
          : "Store owner deleted successfully!"
      );

      setDeleteModalOpen(false);
      setOwnerToDelete(null);
      fetchOwners();
    } catch {
      toast.error(
        lang === "ar"
          ? "خطأ أثناء حذف صاحب المتجر"
          : "Error deleting store owner"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="relative flex flex-col items-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>

          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            {lang === "ar" ? "جاري تحميل" : "Loading"}{" "}
            <span className="text-blue-500">
              {lang === "ar" ? "الملف الشخصي" : "Profile"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 mb-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.121 17.804z M12 12a3 3 0 100-6 3 3 0 000 6z"
          />
        </svg>
        <p className="text-xl font-semibold">
          {lang === "ar" ? "المستخدم غير موجود" : "User Not Found"}
        </p>
        <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">
          {lang === "ar"
            ? "عذراً، هذا المستخدم غير متوفر حالياً. حاول التحقق لاحقاً."
            : "Sorry, this user is currently unavailable. Please check back later."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mt-4
             bg-white/90 text-gray-800 px-4 py-2 rounded-full shadow-md 
             transition-colors duration-300
             hover:bg-blue-500 hover:text-white z-20"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
      </div>
    );
  }

  const documentItems = [
    {
      title: lang === "ar" ? "السجل التجاري" : "Commercial Record",
      img: owner.commercialRecordImg,
      placeholderIcon: null,
    },
    {
      title: lang === "ar" ? "الهوية الشخصية" : "Personal Identity",
      img: owner.personaIdentityImg,
      placeholderIcon: null,
    },
    {
      title: lang === "ar" ? "صورة الملف الشخصي" : "Profile Image",
      img: owner.profileImg,
      placeholderIcon: <CameraIcon className="w-20 h-20 text-gray-400" />,
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-100 relative"
    >
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 
             bg-white/90 text-gray-800 px-4 py-2 rounded-full shadow-md 
             transition-colors duration-300
             hover:bg-blue-500 hover:text-white z-20"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        {lang === "ar" ? "رجوع" : "Back"}
      </button>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 pt-40 md:pt-20 pb-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Image */}
          <div className="flex justify-center -mt-24 md:mt-5">
            <div className="w-44 h-44 md:w-52 md:h-52 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200">
              {owner.profileImg ? (
                <img
                  src={owner.profileImg}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-300">
                  <CameraIcon className="w-24 h-24 text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* Name & Store */}
          <div className="text-center mt-6 px-6 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {owner.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 flex items-center justify-center gap-2 mt-2">
              <ShoppingBagIcon className="w-6 h-6" />
              {owner.storeName ||
                (lang === "ar" ? "لا يوجد اسم متجر" : "No store name")}
            </p>

            {/* Status Badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100">
              {owner.isActive ? (
                <>
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">
                    {lang === "ar" ? "نشط" : "Active"}
                  </span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">
                    {lang === "ar" ? "غير نشط" : "Inactive"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 py-10 mt-6">
            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <UserIcon className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">
                {lang === "ar" ? "الإسم" : "Name"}
              </p>
              <p className="text-lg font-semibold">{owner.name}</p>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <PhoneIcon className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">
                {lang === "ar" ? "رقم الهاتف" : "Phone"}
              </p>
              <p className="text-lg font-semibold">
                {owner.phone?.number || "—"}
              </p>
            </div>

            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
              <ShoppingBagIcon className="w-8 h-8 text-purple-600 mb-2" />
              <p className="text-sm text-gray-500">
                {lang === "ar" ? "نوع المتجر" : "Store Type"}
              </p>
              <p className="text-lg font-semibold text-center">
                {owner.typeOfStore?.length
                  ? owner.typeOfStore
                      .map((t) => t[isRTL ? "ar" : "en"])
                      .join(" • ")
                  : "—"}
              </p>
            </div>
          </div>

          {/* Documents / Media */}
          <div className="border-t border-gray-200 px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <IdentificationIcon className="w-8 h-8 text-blue-600" />
              {lang === "ar" ? "المستندات والصور" : "Documents & Images"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {documentItems.map((doc, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  {doc.img ? (
                    <img
                      src={doc.img}
                      alt={doc.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {doc.placeholderIcon || (
                        <span className="text-gray-500">—</span>
                      )}
                    </div>
                  )}
                  <div className="p-2 text-center">
                    <p className="font-medium text-gray-700 text-sm">
                      {doc.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-8 flex flex-wrap justify-center gap-4">
            {/* Approve / Activate Account */}
            {!owner?.isApproved && (
              <button
                onClick={() => owner && handleApprove(owner._id)}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-300 transform ${
                  actionLoading
                    ? "bg-blue-300 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
                }`}
              >
                <CheckCircleIcon className="w-5 h-5" />
                {actionLoading
                  ? lang === "ar"
                    ? "جاري التفعيل..."
                    : "Approving..."
                  : lang === "ar"
                  ? "تفعيل الحساب"
                  : "Approve Account"}
              </button>
            )}

            {/* Deactivate / Activate Account */}
            <button
              onClick={() =>
                owner && toggleActivation(owner._id, owner.isActive)
              }
              disabled={actionLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-300 transform ${
                actionLoading
                  ? "bg-yellow-300 cursor-not-allowed text-white"
                  : owner.isActive
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105"
                  : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
              }`}
            >
              <XCircleIcon className="w-5 h-5" />
              {actionLoading
                ? lang === "ar"
                  ? "جاري التغيير..."
                  : "Processing..."
                : lang === "ar"
                ? owner.isActive
                  ? "إيقاف الحساب"
                  : "تفعيل الحساب"
                : owner.isActive
                ? "Deactivate Account"
                : "Activate Account"}
            </button>

            {/* Delete Account */}
            <button
              onClick={() => {
                if (owner) {
                  setOwnerToDelete(owner._id);
                  setDeleteModalOpen(true);
                }
              }}
              disabled={deleteLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-300 transform ${
                deleteLoading
                  ? "bg-red-400 cursor-not-allowed text-white"
                  : "bg-red-600 hover:bg-red-700 text-white hover:scale-105"
              }`}
            >
              <XCircleIcon className="w-5 h-5" />
              {deleteLoading
                ? lang === "ar"
                  ? "جاري الحذف..."
                  : "Deleting..."
                : lang === "ar"
                ? "حذف"
                : "Delete"}
            </button>
          </div>

          {/* DELETE CONFIRMATION MODAL */}
          <AnimatePresence>
            {deleteModalOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setOwnerToDelete(null);
                }}
              >
                <div
                  className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    {lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                    {lang === "ar"
                      ? "هل أنت متأكد من حذف هذا صاحب المتجر؟ هذا الإجراء لا يمكن التراجع عنه."
                      : "Are you sure you want to delete this store owner? This action cannot be undone."}
                  </p>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setDeleteModalOpen(false);
                        setOwnerToDelete(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>

                    <button
                      onClick={() =>
                        ownerToDelete && handleDelete(ownerToDelete)
                      }
                      disabled={deleteLoading}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white transition text-sm font-medium flex items-center gap-2"
                    >
                      {deleteLoading ? (
                        <span>
                          {lang === "ar" ? "جاري الحذف..." : "Deleting..."}
                        </span>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5" />
                          {lang === "ar" ? "حذف نهائي" : "Delete"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StoreOwnersProfile;
