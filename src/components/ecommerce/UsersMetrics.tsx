import Badge from "../ui/badge/Badge";

// لو الآيقونات من Heroicons أو أي أيقونات تانية
// ممكن تعمل Dynamic import هنا لو محتاج lazy load
// مثال: const UserGroupIcon = dynamic(() => import('@heroicons/react/24/outline').then(mod => mod.UserGroupIcon));

interface UsersMetricsProps {
  UsersMetricsIcon: React.ReactNode;
  UsersMetricsName: string;
  UsersMetricsTotallyNum: string | number;
  UsersMetricsBadge: {
    color: "success" | "error" | "warning" | "info";
    value: string;
    icon: React.ReactNode;
  };
}

export default function UsersMetrics({
  UsersMetricsIcon,
  UsersMetricsName,
  UsersMetricsTotallyNum,
  UsersMetricsBadge,
}: UsersMetricsProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
        {UsersMetricsIcon}
      </div>

      <div className="flex items-end justify-between mt-5">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {UsersMetricsName}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {UsersMetricsTotallyNum}
          </h4>
        </div>

        <Badge color={UsersMetricsBadge.color}>
          {UsersMetricsBadge.icon}
          {UsersMetricsBadge.value}
        </Badge>
      </div>
    </div>
  );
}
