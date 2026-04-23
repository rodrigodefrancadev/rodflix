import type { Catalog } from '../entities/Catalog';

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
}
