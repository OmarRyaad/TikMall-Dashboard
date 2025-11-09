import { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecentOrders from "../../components/ecommerce/RecentOrders";

interface FormData {
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: File | null;
}

const Sections: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    nameAr: "",
    nameEn: "",
    descAr: "",
    descEn: "",
    icon: null,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (files && files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    console.log("Saved data:", formData);
    setIsOpen(false);
  };

  const handleCancel = () => setIsOpen(false);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#456FFF" }}>
        Sections
      </h1>

      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all duration-300"
      >
        + Add Section
      </button>

      <RecentOrders />

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />

            {/* Popup Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Add Section
                </h2>

                <div className="space-y-3">
                  <input
                    type="text"
                    name="nameAr"
                    placeholder="الاسم (عربي)"
                    value={formData.nameAr}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
                  <input
                    type="text"
                    name="nameEn"
                    placeholder="Name (English)"
                    value={formData.nameEn}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
                  <textarea
                    name="descAr"
                    placeholder="الوصف (عربي)"
                    value={formData.descAr}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20"
                  />
                  <textarea
                    name="descEn"
                    placeholder="Description (English)"
                    value={formData.descEn}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded h-20"
                  />
                  <input
                    type="file"
                    name="icon"
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-700 dark:bg-gray-800 p-2 rounded"
                  />
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
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sections;
