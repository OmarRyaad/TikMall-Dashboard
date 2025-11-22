import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router-dom";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";
import { useLanguage } from "../../context/LanguageContext";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0"
    >
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}

        {/* الجانب الأيمن (الصورة + اللوجو + النص) */}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            <GridShape />
            <div className="flex flex-col items-center max-w-xs text-center">
              <Link to="/" className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/logo.png"
                  alt="Logo"
                />
              </Link>
              <p className="text-gray-400 dark:text-white/60 leading-relaxed">
                {lang === "ar"
                  ? "انغمس في المحادثات الحية وشارك لحظاتك في الوقت الفعلي. تواصل، دردش، واشعر بطاقة غرفة نابضة بالحياة، كل ذلك يحدث الآن."
                  : "Dive into live conversations and share your moments in real time. Connect, chat, and feel the energy of a room buzzing with people, all happening right now."}
              </p>
            </div>
          </div>
        </div>

        {/* مفتاح الثيم (يظهر في الزاوية حسب اللغة) */}
        <div
          className={`fixed z-50 bottom-6 ${
            isRTL ? "left-6" : "right-6"
          } hidden sm:block`}
        >
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
