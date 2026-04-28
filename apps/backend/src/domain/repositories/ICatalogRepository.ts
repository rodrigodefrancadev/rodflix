import type { Catalog, CatalogItem } from '../entities/Catalog';

export interface ICatalogRepository {
  /**
   * Persist (or replace) the full catalog snapshot.
   * Implementation stores it in the database as JSON.
   */
  save(catalog: Catalog): Promise<void>;

  /**
   * Retrieve the last persisted catalog snapshot.
   * Returns null if no sync has been performed yet.
   */
  findLatest(): Promise<Catalog | null>;

  /**
   * Find a specific catalog item by its ID.
   */
  findById(id: string): Promise<CatalogItem | null>;
}
