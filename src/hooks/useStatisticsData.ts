import { Key, useEffect, useState } from "react";
import { BASE_API_URL } from "../config/apiConfig";

// ==================== TYPES ==================== //
export interface UserStatistics {
  totalUsers: number;
  storeOwners: number;
  customers: number;
  newUsersLastMonth: number;
  mostFollowed?: {
    name: string;
    storeName?: string;
    followersCount: number;
    userId: string;
  }[];
}

export interface MediaItem {
  thumbnailUrl: string;
  title: string;
  likesCount: number;
  uploadedBy: {
    name?: string;
    storeName?: string;
    profileImg?: string;
  };
}

export interface MediaStatistics {
  totalMedia: number;
  totalSizeGB: number;
  mostLiked: MediaItem[];
}

export interface StreamerInfo {
  _id?: string;
  role?: string;
  storeName?: string;
  profileImg?: string;
}

export interface StreamItem {
  streamId: Key | null | undefined;
  streamedBy: StreamerInfo;
  title: string;
  viewersCount: number;
}

export interface StreamStatistics {
  totalStreams: number;
  activeStreams: number;
  totalViewers: number;
  mostViewed: StreamItem[];
}

export interface StatisticsData {
  users: UserStatistics;
  media: MediaStatistics;
  streams: StreamStatistics;
  loading: boolean;
}

// ==================== API RESPONSE TYPES ==================== //
interface MediaApiResponseItem {
  thumbnailUrl: string;
  title: string;
  likesCount: number;
  uploadedBy?: {
    name?: string;
    storeName?: string;
    profileImg?: string;
  };
}

interface StreamsApiResponseItem {
  streamId: string;
  title: string;
  viewersCount: number;
  streamedBy?: StreamerInfo;
}

interface MediaApiResponse {
  totalMedia: number;
  totalSizeGB: number;
  mostLiked: MediaApiResponseItem[];
}

interface StreamsApiResponse {
  totalStreams: number;
  activeStreams: number;
  totalViewers: number;
  mostViewed: StreamsApiResponseItem[];
}

// ==================== HOOK ==================== //
export function useStatisticsData(): StatisticsData {
  const BASE_URL = BASE_API_URL;

  const [users, setUsers] = useState<UserStatistics>({
    totalUsers: 0,
    storeOwners: 0,
    customers: 0,
    newUsersLastMonth: 0,
  });

  const [media, setMedia] = useState<MediaStatistics>({
    totalMedia: 0,
    totalSizeGB: 0,
    mostLiked: [],
  });

  const [streams, setStreams] = useState<StreamStatistics>({
    totalStreams: 0,
    activeStreams: 0,
    totalViewers: 0,
    mostViewed: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No access token found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, mediaRes, streamsRes] = await Promise.all([
          fetch(`${BASE_URL}/admin/api/stats/users`, { headers }),
          fetch(`${BASE_URL}/admin/api/stats/media`, { headers }),
          fetch(`${BASE_URL}/admin/api/stats/streams`, { headers }),
        ]);

        if (!usersRes.ok || !mediaRes.ok || !streamsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const usersData = await usersRes.json();
        const mediaData: MediaApiResponse = await mediaRes.json();
        const streamsData: StreamsApiResponse = await streamsRes.json();

        setUsers({
          totalUsers: usersData.totalUsers ?? 0,
          storeOwners: usersData.storeOwners ?? 0,
          customers: usersData.customers ?? 0,
          newUsersLastMonth: usersData.newUsersLastMonth ?? 0,
          mostFollowed: usersData.mostFollowed ?? [],
        });

        setMedia({
          totalMedia: mediaData.totalMedia ?? 0,
          totalSizeGB: mediaData.totalSizeGB ?? 0,
          mostLiked:
            mediaData.mostLiked?.map((item) => ({
              thumbnailUrl: item.thumbnailUrl,
              title: item.title,
              likesCount: item.likesCount,
              uploadedBy: item.uploadedBy ?? {},
            })) ?? [],
        });

        setStreams({
          totalStreams: streamsData.totalStreams ?? 0,
          activeStreams: streamsData.activeStreams ?? 0,
          totalViewers: streamsData.totalViewers ?? 0,
          mostViewed:
            streamsData.mostViewed?.map((item) => ({
              streamId: item.streamId,
              title: item.title,
              viewersCount: item.viewersCount,
              streamedBy: item.streamedBy ?? {},
            })) ?? [],
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [BASE_URL]);

  return { users, media, streams, loading };
}
