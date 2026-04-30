import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { catalogApi } from '../api/catalog';
import type { CatalogItem } from '../api/catalog';
import { watchedApi } from '../api/watched';
import { adminApi } from '../api/admin';
import { ratingApi } from '../api/rating';
import type { RatingType } from '../api/rating';

type FilterType = 'all' | 'film' | 'series';

type CatalogContextType = {
  items: CatalogItem[];
  isLoading: boolean;
  isSyncing: boolean;
  activeFilter: FilterType;
  setActiveFilter: (filter: FilterType) => void;
  watchedIds: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  ratings: Record<string, RatingType>;
  handleRate: (catalogItemId: string, type: RatingType | null) => Promise<void>;
  fetchCatalog: () => Promise<void>;
  toggleWatched: (refId: string, kind: 'FILM' | 'EPISODE') => Promise<void>;
  handleSync: () => Promise<void>;
  films: CatalogItem[];
  series: CatalogItem[];
  filteredItems: CatalogItem[];
  featuredItem: CatalogItem | undefined;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [featuredItem, setFeaturedItem] = useState<CatalogItem | undefined>();
  const [ratings, setRatings] = useState<Record<string, RatingType>>({});

  const fetchUserData = async () => {
    try {
      const [watchedData, ratingsData] = await Promise.all([
        watchedApi.getWatched(),
        ratingApi.getRatings()
      ]);
      setWatchedIds(new Set(watchedData.map(w => w.refId)));
      const ratingsMap: Record<string, RatingType> = {};
      ratingsData.forEach(r => ratingsMap[r.catalogItemId] = r.type);
      setRatings(ratingsMap);
    } catch (error) {
      console.error('Failed to fetch user data', error);
    }
  };

  const fetchCatalog = async (params?: { search?: string; kind?: string }) => {
    try {
      setIsLoading(true);
      // We only fetch featured item on initial load or sync
      const promises: [Promise<CatalogItem[]>, Promise<CatalogItem | undefined>?] = [
        catalogApi.getCatalog(params)
      ];
      
      if (!featuredItem) {
        promises.push(catalogApi.getFeatured());
      }

      const [catalogData, featuredData] = await Promise.all(promises);
      setItems(catalogData);
      if (featuredData) setFeaturedItem(featuredData);
    } catch (error) {
      console.error('Failed to fetch catalog', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleWatched = async (refId: string, kind: 'FILM' | 'EPISODE') => {
    try {
      const isWatched = await watchedApi.toggleWatched(refId, kind);
      setWatchedIds(prev => {
        const next = new Set(prev);
        if (isWatched) next.add(refId);
        else next.delete(refId);
        return next;
      });
    } catch (error) {
      console.error('Failed to toggle watched status', error);
    }
  };

  const handleRate = async (catalogItemId: string, type: RatingType | null) => {
    try {
      const newType = await ratingApi.setRating(catalogItemId, type);
      setRatings(prev => {
        const next = { ...prev };
        if (newType) {
          next[catalogItemId] = newType;
        } else {
          delete next[catalogItemId];
        }
        return next;
      });
    } catch (error) {
      console.error('Failed to set rating', error);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      await adminApi.syncCatalog();
      await fetchCatalog();
    } catch (error) {
      console.error('Sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog({ search: searchQuery, kind: activeFilter });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const films = items.filter(i => i.kind === 'film');
  const series = items.filter(i => i.kind === 'series');
  const filteredItems = items;

  const displayFeaturedItem = (featuredItem && filteredItems.some(i => i.existingId === featuredItem.existingId))
    ? featuredItem
    : filteredItems[0];

  return (
    <CatalogContext.Provider
      value={{
        items,
        isLoading,
        isSyncing,
        activeFilter,
        setActiveFilter,
        watchedIds,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        ratings,
        handleRate,
        fetchCatalog,
        toggleWatched,
        handleSync,
        films,
        series,
        filteredItems,
        featuredItem: displayFeaturedItem,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
