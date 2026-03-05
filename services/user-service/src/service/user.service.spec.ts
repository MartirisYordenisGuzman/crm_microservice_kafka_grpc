import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import bcrypt from "bcryptjs";
import { UserService } from "./user.service";
import { User } from "../entities/user.entity";
import { UpdateUserDto } from "../dtos/user.dto";
import { UserRepository } from "../repository/user.repository.impl";
import { ICacheService } from "shared";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../repository/user.repository.impl", () => ({
  UserRepository: class UserRepository {},
}));

type RepoLike = {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(id: string, userData: UpdateUserDto): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findAll(page: number, limit: number): Promise<{ items: User[]; total: number }>;
};

const makeUser = (): User =>
  ({
    id: "u-1",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    password: "hashed-password",
    isActive: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  }) as User;

describe("UserService", () => {
  let repository: jest.Mocked<RepoLike>;
  let cacheService: jest.Mocked<ICacheService>;
  let service: UserService;

  beforeEach(() => {
    repository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    cacheService = {
      set: jest.fn(async () => undefined),
      get: jest.fn(async () => null),
      delete: jest.fn(async () => undefined),
      exists: jest.fn(async () => false),
    };

    service = new UserService(
      repository as unknown as UserRepository,
      cacheService as unknown as ICacheService,
    );
    jest.clearAllMocks();
  });

  it("throws when creating an existing user", async () => {
    repository.findByEmail.mockResolvedValue(makeUser());

    await expect(
      service.CreateUser({
        email: "john@example.com",
        firstName: "John",
        lastName: "Doe",
        password: "password123",
      }),
    ).rejects.toThrow("User with this email already exists");
  });

  it("creates user with hashed password and caches it", async () => {
    const createdUser = makeUser();
    repository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as unknown as ReturnType<typeof jest.fn>).mockResolvedValue("hashed-password");
    repository.create.mockResolvedValue(createdUser);

    const result = await service.CreateUser({
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "password123",
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 12);
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed-password" }),
    );
    expect(cacheService.set).toHaveBeenCalledWith(
      `user_${createdUser.id}`,
      JSON.stringify(createdUser),
      3600,
    );
    expect(result).toEqual(createdUser);
  });

  it("returns cached user when present", async () => {
    const user = makeUser();
    cacheService.get.mockResolvedValue(user);

    const result = await service.getUserById("u-1");

    expect(cacheService.get).toHaveBeenCalledWith("user:u-1");
    expect(repository.findById).not.toHaveBeenCalled();
    expect(result).toEqual(user);
  });

  it("falls back to repository for user by id and backfills cache", async () => {
    const user = makeUser();
    cacheService.get.mockResolvedValue(null);
    repository.findById.mockResolvedValue(user);

    const result = await service.getUserById("u-1");

    expect(repository.findById).toHaveBeenCalledWith("u-1");
    expect(cacheService.set).toHaveBeenCalledWith("user:u-1", user, 3600);
    expect(result).toEqual(user);
  });

  it("validates active user with matching password", async () => {
    const user = makeUser();
    repository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as unknown as ReturnType<typeof jest.fn>).mockResolvedValue(true);

    const result = await service.validateUser("john@example.com", "password123");

    expect(bcrypt.compare).toHaveBeenCalledWith("password123", user.password);
    expect(result).toEqual(user);
  });

  it("returns null for invalid user credentials", async () => {
    const user = makeUser();
    repository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as unknown as ReturnType<typeof jest.fn>).mockResolvedValue(false);

    const result = await service.validateUser("john@example.com", "bad-password");

    expect(result).toBeNull();
  });

  it("updates and caches user when found", async () => {
    const user = makeUser();
    repository.update.mockResolvedValue(user);

    const result = await service.updateUser("u-1", { firstName: "Jane" });

    expect(repository.update).toHaveBeenCalledWith("u-1", { firstName: "Jane" });
    expect(cacheService.set).toHaveBeenCalledWith("user:u-1", user, 3600);
    expect(result).toEqual(user);
  });

  it("deletes user and evicts cache entry", async () => {
    repository.delete.mockResolvedValue(true);

    const result = await service.deleteUser("u-1");

    expect(result).toBe(true);
    expect(cacheService.delete).toHaveBeenCalledWith("user:u-1");
  });

  it("returns paginated users from cache when available", async () => {
    const users = [makeUser()];
    cacheService.get.mockResolvedValue(users);

    const result = await service.getUsers(1, 10);

    expect(cacheService.get).toHaveBeenCalledWith("users:1:10");
    expect(repository.findAll).not.toHaveBeenCalled();
    expect(result).toEqual({ items: users, total: 1 });
  });

  it("returns paginated users from repository on cache miss", async () => {
    const payload = { items: [makeUser()], total: 99 };
    cacheService.get.mockResolvedValue(null);
    repository.findAll.mockResolvedValue(payload);

    const result = await service.getUsers(2, 20);

    expect(repository.findAll).toHaveBeenCalledWith(2, 20);
    expect(result).toEqual(payload);
  });
});
