"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowPathIcon,
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

interface FAQ {
  updatedAt: number;
  _id: string;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
}

const AskedQuestions = () => {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    question_en: "",
    question_ar: "",
    answer_en: "",
    answer_ar: "",
  });

  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);

  const token = localStorage.getItem("accessToken");

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://api.tik-mall.com/admin/api/all/faqs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFaqs(data?.faqs || []);
      } else {
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل تحميل الأسئلة" : "Failed to load FAQs")
        );
      }
    } catch {
      toast.error(lang === "ar" ? "خطأ في جلب الأسئلة" : "Error fetching FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.question_en ||
      !formData.question_ar ||
      !formData.answer_en ||
      !formData.answer_ar
    ) {
      toast.error(
        lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields"
      );
      return;
    }

    try {
      setCreateLoading(true);
      const url = editingFaqId
        ? `https://api.tik-mall.com/admin/api/faqs/${editingFaqId}`
        : "https://api.tik-mall.com/admin/api/faqs";
      const method = editingFaqId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: { en: formData.question_en, ar: formData.question_ar },
          answer: { en: formData.answer_en, ar: formData.answer_ar },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          editingFaqId
            ? lang === "ar"
              ? "تم تعديل السؤال بنجاح"
              : "FAQ updated successfully"
            : lang === "ar"
            ? "تم إضافة السؤال بنجاح"
            : "FAQ added successfully"
        );
        setModalOpen(false);
        setEditingFaqId(null);
        setFormData({
          question_en: "",
          question_ar: "",
          answer_en: "",
          answer_ar: "",
        });
        fetchFaqs();
      } else {
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل حفظ السؤال" : "Failed to save FAQ")
        );
      }
    } catch {
      toast.error(lang === "ar" ? "خطأ في حفظ السؤال" : "Error saving FAQ");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      const res = await fetch(`https://api.tik-mall.com/admin/api/faqs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          lang === "ar" ? "تم حذف السؤال بنجاح" : "FAQ deleted successfully"
        );
        fetchFaqs();
      } else {
        toast.error(
          data?.message ||
            (lang === "ar" ? "فشل حذف السؤال" : "Failed to delete FAQ")
        );
      }
    } catch {
      toast.error(lang === "ar" ? "خطأ في حذف السؤال" : "Error deleting FAQ");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setFaqToDelete(null);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      question_en: faq.question.en,
      question_ar: faq.question.ar,
      answer_en: faq.answer.en,
      answer_ar: faq.answer.ar,
    });
    setEditingFaqId(faq._id);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh]">
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
              {lang === "ar" ? "الأسئلة الشائعة" : "Asked Questions"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <h2
        className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3"
        style={{ color: "#456FFF" }}
      >
        <QuestionMarkCircleIcon className="w-8 h-8 text-blue-600" />
        {lang === "ar" ? "الأسئلة الشائعة" : "Asked Questions"}
        <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          {faqs.length}{" "}
          {lang === "ar"
            ? faqs.length === 1
              ? "سؤال"
              : "أسئلة"
            : faqs.length === 1
            ? "Question"
            : "Questions"}
        </span>
      </h2>

      {/* Add Button */}
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={() => {
            setEditingFaqId(null);
            setFormData({
              question_en: "",
              question_ar: "",
              answer_en: "",
              answer_ar: "",
            });
            setModalOpen(true);
          }}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
        >
          + {lang === "ar" ? "إضافة سؤال" : "Add Question"}
        </button>
        {/* Refresh Button */}
        <div className="flex gap-2">
          <button
            onClick={() => fetchFaqs()}
            className="px-5 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            {lang === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Comment-Style List */}
      <div className="space-y-6">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 text-lg">
              {lang === "ar"
                ? "لم يتم إضافة أي أسئلة بعد."
                : "No questions have been added yet."}
            </p>
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq._id}
              className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <ChatBubbleLeftIcon className="w-6 h-6" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {lang === "ar" ? "سؤال من الإدارة" : "Asked by Admin"}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {faq.updatedAt
                      ? new Date(faq.updatedAt).toLocaleString(
                          lang === "ar" ? "ar-EG" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : lang === "ar"
                      ? "الآن"
                      : "Just now"}
                  </span>
                </div>

                <p className="text-gray-900 dark:text-gray-200 mt-1 font-medium">
                  {lang === "ar" ? faq.question.ar : faq.question.en}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {lang === "ar" ? faq.answer.ar : faq.answer.en}
                </p>

                {/* Actions */}
                <div className="mt-3 flex gap-3 text-xs">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {lang === "ar" ? "تعديل" : "Edit"}
                  </button>
                  <button
                    onClick={() => {
                      setFaqToDelete(faq._id);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    {lang === "ar" ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {editingFaqId
                  ? lang === "ar"
                    ? "تعديل السؤال"
                    : "Edit FAQ"
                  : lang === "ar"
                  ? "إضافة سؤال جديد"
                  : "Add New FAQ"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Question English */}
                <div className="flex flex-col">
                  <label
                    htmlFor="question_en"
                    className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {lang === "ar" ? "السؤال (إنجليزية)" : "Question (English)"}
                  </label>
                  <input
                    id="question_en"
                    type="text"
                    placeholder={
                      lang === "ar"
                        ? "السؤال (الإنجليزية)"
                        : "Question (English)"
                    }
                    value={formData.question_en}
                    onChange={(e) =>
                      setFormData({ ...formData, question_en: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Question Arabic */}
                <div className="flex flex-col">
                  <label
                    htmlFor="question_ar"
                    className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {lang === "ar" ? "السؤال (عربية)" : "Question (Arabic)"}
                  </label>
                  <input
                    id="question_ar"
                    type="text"
                    placeholder={
                      lang === "ar" ? "السؤال (العربية)" : "Question (Arabic)"
                    }
                    value={formData.question_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, question_ar: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Answer English */}
                <div className="flex flex-col">
                  <label
                    htmlFor="answer_en"
                    className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {lang === "ar" ? "الإجابة (إنجليزية)" : "Answer (English)"}
                  </label>
                  <textarea
                    id="answer_en"
                    placeholder={
                      lang === "ar"
                        ? "الإجابة (الإنجليزية)"
                        : "Answer (English)"
                    }
                    value={formData.answer_en}
                    onChange={(e) =>
                      setFormData({ ...formData, answer_en: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Answer Arabic */}
                <div className="flex flex-col">
                  <label
                    htmlFor="answer_ar"
                    className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {lang === "ar" ? "الإجابة (عربية)" : "Answer (Arabic)"}
                  </label>
                  <textarea
                    id="answer_ar"
                    placeholder={
                      lang === "ar" ? "الإجابة (العربية)" : "Answer (Arabic)"
                    }
                    value={formData.answer_ar}
                    onChange={(e) =>
                      setFormData({ ...formData, answer_ar: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createLoading}
                  className={`rounded-md px-4 py-2 text-sm text-white ${
                    createLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {createLoading
                    ? editingFaqId
                      ? lang === "ar"
                        ? "جاري التعديل..."
                        : "Updating..."
                      : lang === "ar"
                      ? "جاري الإنشاء..."
                      : "Creating..."
                    : editingFaqId
                    ? lang === "ar"
                      ? "تعديل"
                      : "Update"
                    : lang === "ar"
                    ? "إنشاء"
                    : "Create"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  ? "هل أنت متأكد من حذف هذا السؤال نهائيًا؟"
                  : "Are you sure you want to delete this FAQ?"}
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setFaqToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={() => faqToDelete && handleDelete(faqToDelete)}
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

export default AskedQuestions;
