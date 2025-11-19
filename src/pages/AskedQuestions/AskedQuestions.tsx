"use client";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChatBubbleLeftIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

interface FAQ {
  _id: string;
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
}

const AskedQuestions = () => {
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
        toast.error(data?.message || "Failed to load FAQs");
      }
    } catch {
      toast.error("Error fetching FAQs");
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
      toast.error("Please fill in all fields");
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
          editingFaqId ? "FAQ updated successfully" : "FAQ added successfully"
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
        toast.error(data?.message || "Failed to save FAQ");
      }
    } catch {
      toast.error("Error saving FAQ");
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
        toast.success("FAQ deleted successfully");
        fetchFaqs();
      } else {
        toast.error(data?.message || "Failed to delete FAQ");
      }
    } catch {
      toast.error("Error deleting FAQ");
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
            Loading <span className="text-blue-500">Asked Questions</span>...
          </p>
        </div>
      </div>
    );

  return (
    <div className="p-6">
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
        Asked Questions
        <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
          {faqs.length} {faqs.length === 1 ? "Comment" : "Comments"}
        </span>
      </h2>

      {/* Add Button */}
      <div className="mb-4 flex justify-end">
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
          className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
        >
          + Add Question
        </button>
      </div>

      {/* Comment-Style List */}
      <div className="space-y-6">
        {faqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 text-lg">
              No questions have been added yet.
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

              {/* Comment Content */}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Asked by Admin
                  </h4>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>

                <p className="text-gray-900 dark:text-gray-200 mt-1">
                  {faq.question.en}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {faq.answer.en}
                </p>

                {/* Actions */}
                <div className="mt-3 flex gap-3 text-xs">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setFaqToDelete(faq._id);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                  <button className="text-gray-400 cursor-not-allowed">
                    Reply
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
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {editingFaqId ? "Edit FAQ" : "Add New FAQ"}
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Question (English)"
                  value={formData.question_en}
                  onChange={(e) =>
                    setFormData({ ...formData, question_en: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Question (Arabic)"
                  value={formData.question_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, question_ar: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  placeholder="Answer (English)"
                  value={formData.answer_en}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_en: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <textarea
                  placeholder="Answer (Arabic)"
                  value={formData.answer_ar}
                  onChange={(e) =>
                    setFormData({ ...formData, answer_ar: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
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
                      ? "Updating..."
                      : "Creating..."
                    : editingFaqId
                    ? "Update"
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
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete this FAQ? This action cannot be
                undone.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setFaqToDelete(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
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
                  {deleteLoading ? "Deleting..." : "Delete"}
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
