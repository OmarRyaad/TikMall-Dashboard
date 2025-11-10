import { useStatisticsData } from "../../hooks/useStatisticsData";
import UsersMetrics from "../../components/ecommerce/UsersMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpIcon, UserIcon } from "../../icons";

export default function Home() {
  const { users, media, streams, loading } = useStatisticsData();

  if (loading)
    return <div className="p-8 text-center">Loading statistics...</div>;

  return (
    <>
      <PageMeta
        title="TikMall Admin Dashboard"
        description="TikMall statistics overview"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          {/* --- USER STATISTICS --- */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            User Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <UserGroupIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total Users"
              UsersMetricsTotallyNum={users?.totalUsers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "success",
                value: `${users?.newUsersLastMonth ?? 0} new this month`,
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<BuildingStorefrontIcon />}
              UsersMetricsName="Store Owners"
              UsersMetricsTotallyNum={users?.storeOwners?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "primary",
                value: `${(
                  ((users?.storeOwners ?? 0) / (users?.totalUsers ?? 1)) *
                  100
                ).toFixed(1)}%`,
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<UserIcon />}
              UsersMetricsName="Customers"
              UsersMetricsTotallyNum={users?.customers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${(
                  ((users?.customers ?? 0) / (users?.totalUsers ?? 1)) *
                  100
                ).toFixed(1)}%`,
                icon: <ArrowUpIcon />,
              }}
            />
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-left">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 border-b">#</th>
                    <th className="px-4 py-2 border-b">Name</th>
                    <th className="px-4 py-2 border-b">Store</th>
                    <th className="px-4 py-2 border-b">Followers</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.mostFollowed?.map((user, idx) => (
                    <tr
                      key={user.userId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 border-b">{idx + 1}</td>
                      <td className="px-4 py-2 border-b">{user.name}</td>
                      <td className="px-4 py-2 border-b">
                        {user.storeName ?? "—"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {user.followersCount}
                      </td>
                    </tr>
                  ))}
                  {!users?.mostFollowed?.length && (
                    <tr>
                      <td
                        className="px-4 py-2 border-b text-center"
                        colSpan={4}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- MEDIA STATISTICS --- */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            Media Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total Media"
              UsersMetricsTotallyNum={media?.totalMedia?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${media?.totalSizeGB ?? 0} GB`,
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<CalculatorIcon />}
              UsersMetricsName="Most Liked Media"
              UsersMetricsTotallyNum={
                media?.mostLiked?.[0]?.likesCount?.toString() ?? "-"
              }
              UsersMetricsBadge={{
                color: "success",
                value: media?.mostLiked?.[0]?.title ?? "N/A",
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<CalculatorIcon />}
              UsersMetricsName="Top Creator"
              UsersMetricsTotallyNum={
                media?.mostLiked?.[0]?.uploadedBy?.name ?? "N/A"
              }
              UsersMetricsBadge={{
                color: "warning",
                value: media?.mostLiked?.[0]?.uploadedBy?.storeName ?? "—",
                icon: <ArrowUpIcon />,
              }}
            />
            {/* --- MOST LIKED MEDIA TABLE --- */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-left">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 border-b">#</th>
                    <th className="px-4 py-2 border-b">Thumbnail</th>
                    <th className="px-4 py-2 border-b">Title</th>
                    <th className="px-4 py-2 border-b">Uploaded By</th>
                    <th className="px-4 py-2 border-b">Store</th>
                    <th className="px-4 py-2 border-b">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {media?.mostLiked?.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 border-b">{idx + 1}</td>
                      <td className="px-4 py-2 border-b">
                        <img
                          src={
                            item.thumbnailUrl ||
                            "https://via.placeholder.com/50"
                          }
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-2 border-b">{item.title}</td>
                      <td className="px-4 py-2 border-b">
                        {item.uploadedBy?.name ?? "—"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {item.uploadedBy?.storeName ?? "—"}
                      </td>
                      <td className="px-4 py-2 border-b">{item.likesCount}</td>
                    </tr>
                  ))}
                  {!media?.mostLiked?.length && (
                    <tr>
                      <td
                        className="px-4 py-2 border-b text-center"
                        colSpan={6}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- STREAM STATISTICS --- */}
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            Broadcast Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={<CalculatorIcon />}
              UsersMetricsName="Total Streams"
              UsersMetricsTotallyNum={streams?.totalStreams?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "info",
                value: `${streams?.activeStreams ?? 0} Active`,
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<CalculatorIcon />}
              UsersMetricsName="Total Viewers"
              UsersMetricsTotallyNum={streams?.totalViewers?.toString() ?? "-"}
              UsersMetricsBadge={{
                color: "success",
                value: `${
                  (streams?.totalViewers ?? 0) / (streams?.totalStreams ?? 1)
                } Avg per Stream`,
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<CalculatorIcon />}
              UsersMetricsName="Top Stream"
              UsersMetricsTotallyNum={
                streams?.mostViewed?.[0]?.viewersCount?.toString() ?? "-"
              }
              UsersMetricsBadge={{
                color: "warning",
                value: streams?.mostViewed?.[0]?.title ?? "N/A",
                icon: <ArrowUpIcon />,
              }}
            />
            {/* --- MOST VIEWED STREAMS TABLE --- */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-gray-700 text-left">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 border-b">#</th>
                    <th className="px-4 py-2 border-b">Title</th>
                    <th className="px-4 py-2 border-b">Streamer</th>
                    <th className="px-4 py-2 border-b">Store</th>
                    <th className="px-4 py-2 border-b">Viewers</th>
                  </tr>
                </thead>
                <tbody>
                  {streams?.mostViewed?.map((stream, idx) => (
                    <tr
                      key={stream.streamId}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 border-b">{idx + 1}</td>
                      <td className="px-4 py-2 border-b">{stream.title}</td>
                      <td className="px-4 py-2 border-b flex items-center gap-2">
                        <img
                          src={
                            stream.streamedBy?.profileImg ||
                            "https://via.placeholder.com/30"
                          }
                          alt={stream.streamedBy?.storeName || "Streamer"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {stream.streamedBy?.role ?? "—"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {stream.streamedBy?.storeName ?? "—"}
                      </td>
                      <td className="px-4 py-2 border-b">
                        {stream.viewersCount}
                      </td>
                    </tr>
                  ))}
                  {!streams?.mostViewed?.length && (
                    <tr>
                      <td
                        className="px-4 py-2 border-b text-center"
                        colSpan={5}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <MonthlySalesChart />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12">
          <DemographicCard />
        </div>
      </div>
    </>
  );
}
