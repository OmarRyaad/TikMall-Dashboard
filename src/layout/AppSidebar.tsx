import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
// Heroicons
import {
  ChartBarIcon,
  UserIcon,
  PhotoIcon,
  VideoCameraIcon,
  Squares2X2Icon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  BellIcon,
  ChevronDownIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline";
import { HorizontaLDots } from "../icons";
import { useLanguage } from "../context/LanguageContext";
import { usePermissions } from "../context/PermissionsContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permissionKey?: string;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    icon?: React.ReactNode;
    permissionKey?: string;
  }[];
};

const AppSidebar: React.FC = () => {
  const { t, lang } = useLanguage();
  const [announces, setAnnounces] = useState<{ [key: string]: boolean }>({});
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const permissions = usePermissions();

  const hasPermission = (key?: string) => {
    if (!key) return true;
    return permissions[key] === true;
  };

  useEffect(() => {
    const fetchAnnounces = () => {
      fetch("https://api.tik-mall.com/admin/api/announces", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const newAnnounces: { [key: string]: boolean } = {};
          data.flags.forEach((f: { key: string; value: boolean }) => {
            newAnnounces[f.key] = f.value;
          });
          setAnnounces(newAnnounces);
        })
        .catch(console.error);
    };

    fetchAnnounces();

    const intervalId = setInterval(fetchAnnounces, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [token]);

  const handleAnnounceSeen = (path: string | undefined) => {
    if (!path) return;

    const cleanPath = path.replace("/", "");

    const pathToFlagKey: { [key: string]: "complaints" | "media" | "streams" } =
      {
        complaints: "complaints",
        media: "media",
        "live-broad-casts": "streams",
      };

    const flag = pathToFlagKey[cleanPath];
    if (!flag) return;
    if (!announces[flag]) return;

    fetch("https://api.tik-mall.com/admin/api/seen/announce", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flag }),
    })
      .then(() => setAnnounces((prev) => ({ ...prev, [flag]: false })))
      .catch(console.error);
  };

  const navItems: NavItem[] = [
    {
      name: t.statistics,
      icon: <ChartBarIcon className="w-6 h-6" />,
      path: "/",
      permissionKey: "manageStatistics",
    },
    {
      name: t.users,
      icon: <UserIcon className="w-6 h-6" />,
      path: "/users",
      permissionKey: "manageAdmins",
      subItems: [
        {
          name: t.moderators,
          path: "/users/moderators",
          icon: <UserGroupIcon className="w-5 h-5" />,
          permissionKey: "manageAdmins",
        },
        {
          name: t.storeOwners,
          path: "/users/store-owners",
          icon: <BuildingStorefrontIcon className="w-5 h-5" />,
          permissionKey: "manageStoreOwners",
        },
        {
          name: t.customers,
          path: "/users/customers",
          icon: <UserIcon className="w-5 h-5" />,
          permissionKey: "manageCustomers",
        },
      ],
    },
    {
      name: t.media,
      icon: <PhotoIcon className="w-6 h-6" />,
      path: "/media",
      permissionKey: "manageMediaAndStreams",
    },
    {
      name: t.liveBroadcasts,
      icon: <VideoCameraIcon className="w-6 h-6" />,
      path: "/live-broad-casts",
      permissionKey: "manageMediaAndStreams",
    },
    {
      name: t.sections,
      icon: <Squares2X2Icon className="w-6 h-6" />,
      path: "/sections",
      permissionKey: "manageDepartmentsAndFaqs",
    },
    {
      name: t.askedQuestions,
      icon: <QuestionMarkCircleIcon className="w-6 h-6" />,
      path: "/asked-questions",
      permissionKey: "manageDepartmentsAndFaqs",
    },
    {
      name: t.policyAndPrivacy,
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      path: "/policy-and-Privacy",
      permissionKey: "manageDepartmentsAndFaqs",
    },
    {
      name: t.contactUs,
      icon: <ChatBubbleOvalLeftIcon className="w-6 h-6" />,
      path: "/contact-us",
      permissionKey: "",
    },
    {
      name: t.complaints,
      icon: <ExclamationCircleIcon className="w-6 h-6" />,
      path: "/complaints",
      permissionKey: "manageComplaints",
    },
    {
      name: t.notifications,
      icon: <BellIcon className="w-6 h-6" />,
      path: "/notifications",
      permissionKey: "manageSendNotifications",
    },
  ];

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      const currentPath = location.pathname;
      const hasPolicyQuery = new URLSearchParams(location.search).has("name");

      if (path === "/policy-and-Privacy") {
        return (
          currentPath === "/policy-and-Privacy" ||
          currentPath.startsWith("/policy-and-Privacy") ||
          hasPolicyQuery
        );
      }
      return currentPath === path;
    },
    [location.pathname, location.search]
  );

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items
        .filter((nav) => hasPermission(nav.permissionKey))
        .map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="relative">
                    {nav.name}
                    {(() => {
                      const cleanPath = nav.path?.replace("/", "") || "";

                      // map nav.path to API announce key
                      const pathToFlagKey: { [key: string]: string } = {
                        complaints: "complaints",
                        media: "media",
                        "live-broad-casts": "streams",
                      };

                      const flagKey = pathToFlagKey[cleanPath];

                      return (
                        flagKey &&
                        announces[flagKey] && (
                          <span
                            className={`absolute top-0.3 h-2 w-2 rounded-full bg-orange-400 ${
                              document.documentElement.dir === "rtl"
                                ? "left-2"
                                : "right-2"
                            }`}
                          >
                            <span className="absolute inline-flex w-full h-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                          </span>
                        )
                      );
                    })()}
                  </span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu?.type === menuType &&
                      openSubmenu?.index === index
                        ? "rotate-180 text-brand-500"
                        : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  to={nav.path!}
                  onClick={() => handleAnnounceSeen(nav.path)}
                  className={`menu-item group ${
                    isActive(nav.path)
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-size ${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(() => {
                    const cleanPath = nav.path?.replace("/", "") || "";

                    // map nav.path to API announce key
                    const pathToFlagKey: { [key: string]: string } = {
                      complaints: "complaints",
                      media: "media",
                      "live-broad-casts": "streams",
                    };

                    const flagKey = pathToFlagKey[cleanPath];

                    return (
                      flagKey &&
                      announces[flagKey] && (
                        <span
                          className={`absolute top-0.3 h-2 w-2 rounded-full bg-orange-400 ${
                            document.documentElement.dir === "rtl"
                              ? "left-2"
                              : "right-2"
                          }`}
                        >
                          <span className="absolute inline-flex w-full h-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
                        </span>
                      )
                    );
                  })()}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems
                    ?.filter((sub) => hasPermission(sub.permissionKey))
                    .map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          to={subItem.path}
                          className={`menu-dropdown-item ${
                            isActive(subItem.path)
                              ? "menu-dropdown-item-active"
                              : "menu-dropdown-item-inactive"
                          } flex items-center gap-2`}
                        >
                          {subItem.icon && (
                            <span className="w-5 h-5 flex-shrink-0">
                              {subItem.icon}
                            </span>
                          )}
                          <span>{subItem.name}</span>
                          <span className="flex items-center gap-1 ml-auto">
                            {subItem.new && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                new
                              </span>
                            )}
                            {subItem.pro && (
                              <span
                                className={`ml-auto ${
                                  isActive(subItem.path)
                                    ? "menu-dropdown-badge-active"
                                    : "menu-dropdown-badge-inactive"
                                } menu-dropdown-badge`}
                              >
                                pro
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </li>
        ))}
    </ul>
  );

  return (
    <aside
      className={`
    fixed mt-16 flex flex-col lg:mt-0 top-0
    ${lang === "ar" ? "right-0" : "left-0"}  // <-- dynamic
    px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900
    h-screen transition-all duration-300 ease-in-out border-r border-gray-200 z-9999
    ${
      isExpanded || isMobileOpen
        ? "w-[290px]"
        : isHovered
        ? "w-[290px]"
        : "w-[90px]"
    }
    ${
      isMobileOpen
        ? "translate-x-0"
        : lang === "ar"
        ? "translate-x-full"
        : "-translate-x-full"
    }
    lg:translate-x-0
  `}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo.png"
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t.menu
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? "" : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
