import UsersMetrics from "../../components/ecommerce/UsersMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
} from "@heroicons/react/24/outline";
import { ArrowUpIcon, ArrowDownIcon, UserIcon } from "../../icons";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            User statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <UserGroupIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Moderators"
              UsersMetricsTotallyNum="3,782"
              UsersMetricsBadge={{
                color: "success",
                value: "11.01%",
                icon: <ArrowUpIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<BuildingStorefrontIcon />}
              UsersMetricsName="Store Owners"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={<UserIcon />}
              UsersMetricsName="Customers"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
          </div>
          <RecentOrders />

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
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
          </div>
          <RecentOrders />

          <h2
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: "#456FFF" }}
          >
            Broadcast Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
            <UsersMetrics
              UsersMetricsIcon={
                <CalculatorIcon className="text-gray-800 size-6 dark:text-white/90" />
              }
              UsersMetricsName="Total"
              UsersMetricsTotallyNum="5,359"
              UsersMetricsBadge={{
                color: "error",
                value: "9.05%",
                icon: <ArrowDownIcon />,
              }}
            />
          </div>
          <RecentOrders />
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
