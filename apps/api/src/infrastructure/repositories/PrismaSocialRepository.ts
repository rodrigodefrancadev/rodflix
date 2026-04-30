import { prisma } from '../prisma';
import type { ISocialRepository, MemberSummary, UserProfile, ActivityItem } from '../../domain/repositories/ISocialRepository';

export class PrismaSocialRepository implements ISocialRepository {
  async findAllMembers(): Promise<MemberSummary[]> {
    const users = await prisma.user.findMany({
      where: { approved: true },
      include: {
        _count: {
          select: { watched: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      watchedCount: user._count.watched
    }));
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        watched: {
          orderBy: { watchedAt: 'desc' }
        },
        ratings: true
      }
    });

    if (!user) return null;

    // Fetch all catalog items to map activity
    const activityMap = new Map<string, ActivityItem>();

    for (const watched of user.watched) {
      if (watched.kind === 'FILM') {
        const item = await prisma.catalogItem.findUnique({
          where: { id: watched.refId }
        });

        if (item) {
          activityMap.set(item.id, {
            id: watched.id,
            title: item.title,
            kind: 'film',
            catalogItemId: item.id,
            watchedAt: watched.watchedAt,
            posterUrl: item.posterUrl,
            rating: user.ratings.find(r => r.catalogItemId === item.id)?.type as any
          });
        }
      } else {
        // Episode aggregation
        const episode = await prisma.episode.findFirst({
          where: { fileUrl: watched.refId },
          include: {
            season: {
              include: {
                catalogItem: {
                  include: {
                    seasons: {
                      include: {
                        _count: { select: { episodes: true } }
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (episode) {
          const series = episode.season.catalogItem;
          const existing = activityMap.get(series.id);

          if (existing) {
            // Update watchedAt if this one is more recent
            if (watched.watchedAt > existing.watchedAt) {
              existing.watchedAt = watched.watchedAt;
            }
            existing.episodesWatched = (existing.episodesWatched || 0) + 1;
          } else {
            const totalEpisodes = series.seasons.reduce((acc, s) => acc + s._count.episodes, 0);
            activityMap.set(series.id, {
              id: watched.id,
              title: series.title,
              kind: 'series',
              catalogItemId: series.id,
              watchedAt: watched.watchedAt,
              posterUrl: series.posterUrl,
              episodesWatched: 1,
              totalEpisodes,
              rating: user.ratings.find(r => r.catalogItemId === series.id)?.type as any
            });
          }
        }
      }
    }

    const activity = Array.from(activityMap.values()).sort((a, b) =>
      b.watchedAt.getTime() - a.watchedAt.getTime()
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      watchedCount: user.watched.length,
      activity
    };
  }
}
