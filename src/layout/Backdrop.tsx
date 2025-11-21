import { useSidebar } from "../context/SidebarContext";
import { useLanguage } from "../context/LanguageContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const { lang } = useLanguage();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
      // Optional: add cursor direction awareness if needed
      style={{ direction: lang === "ar" ? "rtl" : "ltr" }}
    />
  );
};

export default Backdrop;
