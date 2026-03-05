import { DataSource, FindOptionsWhere, ObjectLiteral, Repository } from "typeorm";
import { IRepository } from "../types/IRepository";
import { DuplicateRecordError } from "../errors/duplicate-record-error";
import { ForeignKeyViolationError } from "../errors/foreign-key-violation-error";
import { DatabaseError } from "../errors/database-error";
import { NotFoundError } from "../errors/not-found-error";

type DatabaseDriverError = {
  code?: string;
};

function isDatabaseDriverError(error: unknown): error is DatabaseDriverError {
  return typeof error === "object" && error !== null && "code" in error;
}

export class GenericRepository<T extends ObjectLiteral> implements IRepository<T> {
  protected repo: Repository<T>;

  constructor(datasource: DataSource, entityClass: new () => T) {
    this.repo = datasource.getRepository(entityClass);
  }

  async create(data: T): Promise<T> {
    try {
      const entity = this.repo.create(data);
      return this.repo.save(entity);
    } catch (error: unknown) {
      if (isDatabaseDriverError(error) && error.code === "23505") {
        throw new DuplicateRecordError("Duplicated record");
      }
      if (isDatabaseDriverError(error) && error.code === "23503") {
        throw new ForeignKeyViolationError("Foreign key violation");
      }
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error creating entity: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<T> {
    try {
      const entity = await this.repo.findOneBy({ id } as unknown as FindOptionsWhere<T>);
      if (!entity) throw new NotFoundError("Entity");
      return entity;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error finding entity by ID: ${errorMessage}`);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const updatedResult = await this.repo.update(id, data);

      if (updatedResult.affected === 0) throw new NotFoundError("Entity");
      return await this.findById(id);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error updating entity: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.repo.delete(id);

      if (result.affected === 0) throw new NotFoundError("Entity");
      return result.affected! > 0;
    } catch (error: unknown) {
      if (error instanceof NotFoundError) throw error;

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error deleting entity: ${errorMessage}`);
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: T[]; total: number }> {
    try {
      const [items, total] = await this.repo.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });
      return { items, total };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error finding all entities: ${errorMessage}`);
    }
  }
}
