"use client";

import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useLanguage } from "../../context/LanguageContext";

interface StatsResponse {
  data: {
    monthLabels: string[];
    customers?: { month: string; count: number }[];
    streams?: { month: string; count: number }[];
  };
}

export default function StatisticsChart() {
  const { lang } = useLanguage();
  const isRTL = lang === "ar";

  const months =
    lang === "ar"
      ? [
          "يناير",
          "فبراير",
          "مارس",
          "أبريل",
          "مايو",
          "يونيو",
          "يوليو",
          "أغسطس",
          "سبتمبر",
          "أكتوبر",
          "نوفمبر",
          "ديسمبر",
        ]
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

  const [userData, setUserData] = useState<number[]>(new Array(12).fill(0));
  const [streamData, setStreamData] = useState<number[]>(new Array(12).fill(0));

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, streamsRes] = await Promise.all([
          fetch(
            "https://api.tik-mall.com/admin/api/stats/charts/monthly-users",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            "https://api.tik-mall.com/admin/api/stats/charts/monthly-streams",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        if (!usersRes.ok || !streamsRes.ok) {
          console.error("API error:", usersRes.status, streamsRes.status);
          return;
        }

        const usersJson: StatsResponse = await usersRes.json();
        const streamsJson: StatsResponse = await streamsRes.json();

        setUserData(
          usersJson.data.customers?.map((c) => c.count) || new Array(12).fill(0)
        );
        setStreamData(
          streamsJson.data.streams?.map((s) => s.count) || new Array(12).fill(0)
        );
      } catch (err) {
        console.error("Failed to fetch statistics", err);
      }
    }

    fetchStats();
  }, []);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: { useSeriesColors: true },
    },
    colors: ["#465FFF", "#9CB9FF"],
    chart: {
      type: "area",
      height: 310,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
      foreColor: "#9ca3af",
    },
    stroke: { curve: "smooth", width: [3, 3] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) =>
          `${val.toLocaleString()} ${lang === "ar" ? "وحدة" : "unit"}`,
      },
    },
    xaxis: { categories: months, labels: { style: { fontSize: "12px" } } },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val) => val.toLocaleString(),
      },
    },
  };

  const series = [
    { name: lang === "ar" ? "المستخدمون الجدد" : "New Users", data: userData },
    {
      name: lang === "ar" ? "البثوث المباشرة" : "Live Streams",
      data: streamData,
    },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
    >
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {lang === "ar"
              ? "مقارنة المستخدمون مقابل البثوث المباشرة"
              : "Users vs Live Streams"}
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            {lang === "ar"
              ? "مقارنة بين عدد المستخدمين والبثوث المباشرة لكل شهر"
              : "Comparison of users and live streams per month"}
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
