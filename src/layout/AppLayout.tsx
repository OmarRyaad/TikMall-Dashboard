import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { LanguageProvider, useLanguage } from "../context/LanguageContext";
import { PermissionsProvider } from "../context/PermissionsContext";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { lang } = useLanguage();

  const isRTL = lang === "ar";

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={`min-h-screen xl:flex ${isRTL ? "rtl" : "ltr"}`}
    >
      <div>
        <PermissionsProvider>
          <AppSidebar />
          <Backdrop />
        </PermissionsProvider>
      </div>

      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ms-[290px]" : "lg:ms-[90px]"
        } ${isMobileOpen ? "ms-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <PermissionsProvider>
        <SidebarProvider>
          <LayoutContent />
        </SidebarProvider>
      </PermissionsProvider>
    </LanguageProvider>
  );
};

export default AppLayout;
