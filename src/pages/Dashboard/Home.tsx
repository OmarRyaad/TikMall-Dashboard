import { useStatisticsData } from "../../hooks/useStatisticsData";
import UsersMetrics from "../../components/ecommerce/UsersMetrics";
import PageMeta from "../../components/common/PageMeta";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  HashtagIcon,
  HeartIcon,
  PencilSquareIcon,
  PhotoIcon,
  EyeIcon,
  PlayCircleIcon,
  ChartBarIcon,
  SignalIcon,
  UserIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpIcon } from "../../icons";
import { ToastContainer } from "react-toastify";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import { useLanguage } from "../../context/LanguageContext";

export default function Home() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";
  const { users, media, streams, loading } = useStatisticsData();

  if (loading)
    return (
      <div className="flex items-center justify-center h-[80vh] bg-transparent">
        <div className="relative flex flex-col items-center">
          {/* Spinning gradient ring */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-cyan-400 animate-[spin_1.5s_linear_infinite]" />
          </div>

          {/* Glowing dots */}
          <div className="flex gap-2 mt-6">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.15s]" />
            <span className="w-3 h-3 rounded-full bg-blue-300 animate-bounce [animation-delay:0.3s]" />
          </div>

          {/* Text with shimmer */}
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">
            {lang === "ar" ? "جاري تحميل" : "Loading"}{" "}
            <span className="text-blue-500 dark:text-cyan-400">
              {lang === "ar" ? "الإحصائيات" : "Statistics"}
            </span>
            ...
          </p>
        </div>
      </div>
    );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={isRTL ? "text-right" : "text-left"}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        toastClassName="!z-[9999]"
      />

      <PageMeta
        title={
          lang === "ar" ? "لوحة تحكم مدير تيك مول" : "TikMall Admin Dashboard"
        }
        description={
          lang === "ar"
            ? "نظرة عامة على إحصائيات تيك مول"
            : "TikMall statistics overview"
        }
      />

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          {/* --- USER STATISTICS --- */}
          <h2
            className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {lang === "ar" ? "إحصائيات المستخدمين" : "User Statistics"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <UserGroupIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "إجمالي المستخدمين" : "Total Users"
              }
              UsersMetricsTotallyNum={users?.totalUsers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "success",
                value: `${users?.newUsersLastMonth ?? 0} ${
                  lang === "ar" ? "جديد هذا الشهر" : "new this month"
                }`,
                icon: (
                  <ArrowUpIcon className="text-green-500 dark:text-green-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <BuildingStorefrontIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "أصحاب المتاجر" : "Store Owners"
              }
              UsersMetricsTotallyNum={users?.storeOwners?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "primary",
                value: `${(
                  ((users?.storeOwners ?? 0) / (users?.totalUsers ?? 1)) *
                  100
                ).toFixed(1)}%`,
                icon: (
                  <ArrowUpIcon className="text-blue-500 dark:text-blue-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <UserIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={lang === "ar" ? "العملاء" : "Customers"}
              UsersMetricsTotallyNum={users?.customers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${(
                  ((users?.customers ?? 0) / (users?.totalUsers ?? 1)) *
                  100
                ).toFixed(1)}%`,
                icon: (
                  <ArrowUpIcon className="text-cyan-500 dark:text-cyan-300 w-4 h-4" />
                ),
              }}
            />
          </div>

          {/* --- USERS TABLE --- */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <div className="flex items-center gap-1">
                        <HashtagIcon className="h-4 w-4" /> #
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "الاسم" : "Name"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <div className="flex items-center gap-1">
                        <BuildingStorefrontIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "المتجر" : "Store"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "المتابعون" : "Followers"}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {users?.mostFollowed?.length ? (
                    users.mostFollowed.map((user, idx) => (
                      <tr
                        key={user.userId}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                          {user.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {user.storeName ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {user.followersCount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        colSpan={4}
                      >
                        {lang === "ar"
                          ? "لا توجد بيانات متاحة"
                          : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- MEDIA STATISTICS --- */}
          <h2
            className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {lang === "ar" ? "إحصائيات الوسائط" : "Media Statistics"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "إجمالي الوسائط" : "Total Media"
              }
              UsersMetricsTotallyNum={media?.totalMedia?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${media?.totalSizeGB ?? 0} ${
                  lang === "ar" ? "جيجابايت" : "GB"
                }`,
                icon: (
                  <ArrowUpIcon className="text-cyan-500 dark:text-cyan-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "الوسائط الأكثر إعجاباً" : "Most Liked Media"
              }
              UsersMetricsTotallyNum={
                media?.mostLiked?.[0]?.likesCount?.toString() ?? "-"
              }
              UsersMetricsBadge={{
                color: "success",
                value:
                  media?.mostLiked?.[0]?.title ??
                  (lang === "ar" ? "غير متوفر" : "N/A"),
                icon: (
                  <ArrowUpIcon className="text-green-500 dark:text-green-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "أفضل منشئ محتوى" : "Top Creator"
              }
              UsersMetricsTotallyNum={
                media?.mostLiked?.[0]?.uploadedBy?.name ??
                (lang === "ar" ? "غير متوفر" : "N/A")
              }
              UsersMetricsBadge={{
                color: "warning",
                value: media?.mostLiked?.[0]?.uploadedBy?.storeName ?? "—",
                icon: (
                  <ArrowUpIcon className="text-yellow-500 dark:text-yellow-300 w-4 h-4" />
                ),
              }}
            />
          </div>

          {/* --- MEDIA TABLE --- */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <HashtagIcon className="h-4 w-4" /> #
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <PhotoIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "الصورة" : "Thumbnail"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <PencilSquareIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "العنوان" : "Title"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <UserCircleIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "تم الرفع بواسطة" : "Uploaded By"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <BuildingStorefrontIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "المتجر" : "Store"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-4 w-4 text-pink-500 dark:text-pink-400" />{" "}
                        {lang === "ar" ? "الإعجابات" : "Likes"}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {media?.mostLiked?.length ? (
                    media.mostLiked.map((item, idx) => (
                      <tr
                        key={idx}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="h-12 w-12 overflow-hidden rounded-md ring-1 ring-gray-200 dark:ring-gray-700">
                            <img
                              src={
                                item.thumbnailUrl ||
                                "https://via.placeholder.com/50"
                              }
                              alt={item.title}
                              className="h-12 w-12 object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.uploadedBy?.name ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {item.uploadedBy?.storeName ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          ❤️ {item.likesCount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        colSpan={6}
                      >
                        {lang === "ar"
                          ? "لا توجد بيانات متاحة"
                          : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- BROADCAST STATISTICS --- */}
          <h2
            className="flex items-center gap-2 text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            <SignalIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            {lang === "ar" ? "إحصائيات البث المباشر" : "Broadcast Statistics"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "إجمالي البثوث" : "Total Streams"
              }
              UsersMetricsTotallyNum={streams?.totalStreams?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${streams?.activeStreams ?? 0} ${
                  lang === "ar" ? "نشط الآن" : "Active"
                }`,
                icon: (
                  <ArrowUpIcon className="text-cyan-500 dark:text-cyan-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={
                lang === "ar" ? "إجمالي المشاهدين" : "Total Viewers"
              }
              UsersMetricsTotallyNum={streams?.totalViewers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "success",
                value: `${(
                  (streams?.totalViewers ?? 0) / (streams?.totalStreams ?? 1)
                ).toFixed(2)} ${
                  lang === "ar" ? "متوسط لكل بث" : "Avg per Stream"
                }`,
                icon: (
                  <ArrowUpIcon className="text-green-500 dark:text-green-300 w-4 h-4" />
                ),
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 dark:text-white/90 w-6 h-6" />
              }
              UsersMetricsName={lang === "ar" ? "أعلى بث مشاهدة" : "Top Stream"}
              UsersMetricsTotallyNum={
                streams?.mostViewed?.[0]?.viewersCount?.toString() ?? "-"
              }
              UsersMetricsBadge={{
                color: "warning",
                value:
                  streams?.mostViewed?.[0]?.title ??
                  (lang === "ar" ? "غير متوفر" : "N/A"),
                icon: (
                  <ArrowUpIcon className="text-yellow-500 dark:text-yellow-300 w-4 h-4" />
                ),
              }}
            />
          </div>

          {/* --- STREAM TABLE --- */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="border-y border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <HashtagIcon className="h-4 w-4" /> #
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <PlayCircleIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "عنوان البث" : "Title"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "المذيع" : "Streamer"}
                      </div>
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />{" "}
                        {lang === "ar" ? "المشاهدون" : "Viewers"}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {streams?.mostViewed?.length ? (
                    streams.mostViewed.map((stream, idx) => (
                      <tr
                        key={idx}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      >
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-800 dark:text-white/90">
                          {stream.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                          {stream.streamedBy?.storeName ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {stream.viewersCount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="py-4 px-4 text-center text-sm text-gray-500 dark:text-gray-400"
                        colSpan={4}
                      >
                        {lang === "ar"
                          ? "لا توجد بيانات متاحة"
                          : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <StatisticsChart />
          </div>
        </div>
      </div>
    </div>
  );
}
