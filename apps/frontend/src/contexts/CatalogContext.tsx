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

  const fetchCatalog = async () => {
    try {
      setIsLoading(true);
      const [catalogData, watchedData, ratingsData, featuredData] = await Promise.all([
        catalogApi.getCatalog(),
        watchedApi.getWatched(),
        ratingApi.getRatings(),
        catalogApi.getFeatured()
      ]);
      setItems(catalogData);
      setWatchedIds(new Set(watchedData.map(w => w.refId)));
      setFeaturedItem(featuredData);
      
      const ratingsMap: Record<string, RatingType> = {};
      ratingsData.forEach(r => ratingsMap[r.catalogItemId] = r.type);
      setRatings(ratingsMap);
    } catch (error) {
      console.error('Failed to fetch catalog or watched status', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  useEffect(() => {
    fetchCatalog();
  }, []);

  const films = items.filter(i =>
    i.kind === 'film' &&
    (searchQuery === '' || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const series = items.filter(i =>
    i.kind === 'series' &&
    (searchQuery === '' || i.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = items.filter(item => {
    const matchesFilter = activeFilter === 'all' ? true : item.kind === activeFilter;
    const matchesSearch = searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
