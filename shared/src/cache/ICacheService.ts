export interface ICacheService {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  connect?(): Promise<void>;
  disconnect?(): Promise<void>;
}
