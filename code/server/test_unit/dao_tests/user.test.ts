import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

import UserDAO from "../../src/dao/userDAO";
import crypto from "crypto";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import { Role, User } from "../../src/components/user";
import {
  UserAlreadyExistsError,
  UserNotFoundError,
} from "../../src/errors/userError";

jest.mock("crypto");
jest.mock("../../src/db/db.ts");

const testCustomer = new User(
  "testCustomer",
  "test",
  "test",
  Role.CUSTOMER,
  "",
  ""
);
const testAdmin = new User("testAdmin", "test", "test", Role.ADMIN, "", "");
const testManager = new User(
  "testManager",
  "test",
  "test",
  Role.MANAGER,
  "",
  ""
);
const updatedUser: User = {
  ...testCustomer,
  birthdate: "01/01/2000",
  address: "test address",
};
const users = [testCustomer, testAdmin, testManager];

describe("userDAO", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createUser", () => {
    test("It should resolve true", async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const mockRandomBytes = jest
        .spyOn(crypto, "randomBytes")
        .mockImplementation((size) => {
          return Buffer.from("salt");
        });
      const mockScrypt = jest
        .spyOn(crypto, "scrypt")
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from("hashedPassword");
        });
      const result = await userDAO.createUser(
        "username",
        "name",
        "surname",
        "password",
        "role"
      );
      expect(result).toBe(true);
      mockRandomBytes.mockRestore();
      mockDBRun.mockRestore();
      mockScrypt.mockRestore();
    });
    test("It should throw an error, user already exists", async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error("UNIQUE constraint failed: users.username"));
          return {} as Database;
        });
      const mockRandomBytes = jest
        .spyOn(crypto, "randomBytes")
        .mockImplementation((size) => {
          return Buffer.from("salt");
        });
      const mockScrypt = jest
        .spyOn(crypto, "scrypt")
        .mockImplementation(async (password, salt, keylen) => {
          return Buffer.from("hashedPassword");
        });
      expect(
        userDAO.createUser("username", "name", "surname", "password", "role")
      ).rejects.toThrow(UserAlreadyExistsError);
      mockRandomBytes.mockRestore();
      mockDBRun.mockRestore();
      mockScrypt.mockRestore();
    });
  });
  describe("getUserByUsername", () => {
    test("It should return the user with the specified username", async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, testCustomer);
          return {} as Database;
        });
      const result = await userDAO.getUserByUsername("testCustomer");
      expect(result).toEqual(testCustomer);
      mockDBGet.mockRestore();
    });
    test("It should throw an error, user not found", async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      expect(userDAO.getUserByUsername("testCustomer")).rejects.toThrow(
        UserNotFoundError
      );
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      const userDAO = new UserDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      expect(userDAO.getUserByUsername("testCustomer")).rejects.toThrow();
      mockDBGet.mockRestore();
    });
  });
  describe("getUsers", () => {
    test("It should return a promise that resolves the information of all users", async () => {
      const userDAO = new UserDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, callback) => {
          callback(null, users);
          return {} as Database;
        });
      const result = await userDAO.getUsers();
      expect(result).toEqual(users);
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      const userDAO = new UserDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      expect(userDAO.getUsers()).rejects.toThrow();
      mockDBAll.mockRestore();
    });
  });
  describe("getUsersByRole", () => {
    test("It should return a list of users with the specified role", async () => {
      const userDAO = new UserDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, [testCustomer]);
          return {} as Database;
        });
      const result = await userDAO.getUsersByRole(Role.CUSTOMER);
      expect(result).toEqual([testCustomer]);
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      const userDAO = new UserDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      expect(userDAO.getUsersByRole(Role.CUSTOMER)).rejects.toThrow();
      mockDBAll.mockRestore();
    });
  });
  describe("deleteUser", () => {
    test("It should delete the user with the specified username, it returns true", async () => {
      const mockDBDelete = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, "testCustomer");
          return {} as Database;
        });
      const userDAO = new UserDAO();
      const result = await userDAO.deleteUser("testCustomer");
      expect(result).toBe(true);
      mockDBDelete.mockRestore();
    });
    test("It should throw an error", async () => {
      const mockDBDelete = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      const userDAO = new UserDAO();
      expect(userDAO.deleteUser("testCustomer")).rejects.toThrow();
      mockDBDelete.mockRestore();
    });
  });
  describe("deleteAll", () => {
    test("it should delete all non-Admin users", async () => {
      const mockDBDelete = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(null);
          return {} as Database;
        });
      const userDAO = new UserDAO();
      const result = await userDAO.deleteAll();
      expect(result).toBe(true);
      mockDBDelete.mockRestore();
    });
    test("it should throw an error", async () => {
      const mockDBDelete = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(new Error());
          return {} as Database;
        });
      const userDAO = new UserDAO();
      expect(userDAO.deleteAll()).rejects.toThrow();
      mockDBDelete.mockRestore();
    });
  });
  describe("updateUserInfo", () => {
    test("It should update personal information of a single user", async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation(function (sql, params, callback) {
          callback.call(null);
          return {} as Database;
        });

      const result = await userDAO.updateUser(
        updatedUser.name,
        updatedUser.surname,
        updatedUser.address,
        updatedUser.birthdate,
        testCustomer.username,
        testCustomer.role
      );
      expect(result).toEqual(updatedUser);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const userDAO = new UserDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation(function (sql, params, callback) {
          callback(new Error());
          return {} as Database;
        });
      await expect(
        userDAO.updateUser(
          updatedUser.name,
          updatedUser.surname,
          updatedUser.address,
          updatedUser.birthdate,
          testCustomer.username,
          testCustomer.role
        )
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
});
