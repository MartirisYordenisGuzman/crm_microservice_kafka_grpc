import { inject, injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./IUserRepository";
import { AppDataSource } from "../config/database";
import { DatabaseError, GenericRepository, NotFoundError } from "shared";
import { FindOptionsWhere } from "typeorm";

@injectable()
export class UserRepository extends GenericRepository<User> implements IUserRepository {
  private readonly userRepository = AppDataSource.getRepository(User);

  constructor(
    @inject("AppDataSource")
    dataSource: ConstructorParameters<typeof GenericRepository<User>>[0],
  ) {
    super(dataSource, User);
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user) throw new NotFoundError("User") as unknown as FindOptionsWhere<User>;
      return user;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      throw new DatabaseError(`Error finding user by email ${errorMessage}`);
    }
  }
}
