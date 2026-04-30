export interface MemberSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  avatarUrl: string | null;
  watchedCount: number;
}

export interface UserProfile extends MemberSummary {
  bio: string | null;
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  title: string;
  kind: 'film' | 'series';
  catalogItemId: string;
  watchedAt: Date;
  posterUrl?: string | null;
  // For series aggregation
  episodesWatched?: number;
  totalEpisodes?: number;
  rating?: 'LIKE' | 'LOVE' | 'DISLIKE' | null;
}

export interface ISocialRepository {
  findAllMembers(): Promise<MemberSummary[]>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
}
