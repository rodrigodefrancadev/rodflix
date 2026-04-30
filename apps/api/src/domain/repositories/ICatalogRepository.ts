import type { Catalog, CatalogItem } from '../entities/Catalog';
export interface CatalogFilter {
  search?: string;
  kind?: 'film' | 'series';
}

export interface ICatalogRepository {
  /**
   * Persist (or replace) the full catalog snapshot.
   */
  save(catalog: Catalog): Promise<void>;

  /**
   * Retrieve the last persisted catalog snapshot.
   * Returns null if no sync has been performed yet.
   */
  findLatest(): Promise<Catalog | null>;

  /**
   * Retrieve all catalog items with optional filtering.
   */
  findAll(filter?: CatalogFilter): Promise<CatalogItem[]>;

  /**
   * Find a specific catalog item by its ID.
   */
  findById(id: string): Promise<CatalogItem | null>;
}
