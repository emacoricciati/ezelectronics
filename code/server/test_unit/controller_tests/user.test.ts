import {
  test,
  expect,
  jest,
  describe,
  afterEach,
  beforeEach,
} from "@jest/globals";
import UserController from "../../src/controllers/userController";
import UserDAO from "../../src/dao/userDAO";
import { Role, User } from "../../src/components/user";
import {
  UnauthorizedUserError,
  UserIsAdminError,
} from "../../src/errors/userError";
import { DateError, Utility } from "../../src/utilities";

jest.mock("../../src/dao/userDAO");
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
const otherAdmin = {
  ...testAdmin,
  username: "testAdmin2",
};
const errorDate = "2100/12/12"
const users = [testCustomer, testAdmin, testManager];
const customers = [testCustomer];

describe("Users controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createUser", () => {
    test("It should return true", async () => {
      const testUser = {
        //Define a test user object
        username: "test",
        name: "test",
        surname: "test",
        password: "test",
        role: "Manager",
      };
      jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
      const controller = new UserController(); //Create a new instance of the controller
      //Call the createUser method of the controller with the test user object
      const response = await controller.createUser(
        testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role
      );

      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
      expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(
        testUser.username,
        testUser.name,
        testUser.surname,
        testUser.password,
        testUser.role
      );
      expect(response).toBe(true); //Check if the response is true
    });
  });
  describe("getUsers", () => {
    test("it should return an array of users", async () => {
      jest.spyOn(UserDAO.prototype, "getUsers").mockResolvedValueOnce(users);
      const controller = new UserController();
      const response = await controller.getUsers();

      expect(UserDAO.prototype.getUsers).toHaveBeenCalledTimes(1);
      expect(response).toBe(users);
    });
  });

  describe("getUsersByRole", () => {
    test("it should return all users with a specific role", async () => {
      jest
        .spyOn(UserDAO.prototype, "getUsersByRole")
        .mockResolvedValueOnce(customers);
      const controller = new UserController();
      const response = await controller.getUsersByRole("Customer");
      expect(UserDAO.prototype.getUsersByRole).toHaveBeenCalledTimes(1);
      expect(response).toBe(customers);
    });
  });

  describe("getUserByUsername", () => {
    test("it should return a specific user", async () => {

      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(true)
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(testCustomer);
      const controller = new UserController();
      const response = await controller.getUserByUsername(
        testAdmin,
        "testCustomer"
      );
      expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
      expect(response).toBe(testCustomer);
    });
    test("it should throw UnauthorizedUserError", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(false)
      const controller = new UserController();
      await expect(
        controller.getUserByUsername(testCustomer, "testAdmin")
      ).rejects.toThrow(UnauthorizedUserError);
      expect(UserDAO.prototype.getUserByUsername).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    test("it should return true", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(true)
      jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(testCustomer);
      const controller = new UserController();
      const response = await controller.deleteUser(
        testAdmin,
        "testCustomer"
      );
      expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
    test("it should throw UnauthorizedUserError", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(false)
      const controller = new UserController();
      await expect(
        controller.deleteUser(testCustomer, "testAdmin")
      ).rejects.toThrow(UnauthorizedUserError);
      expect(UserDAO.prototype.deleteUser).not.toHaveBeenCalled();
    });
    test("it should throw UserIsAdminError", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(true)
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(otherAdmin);
      const controller = new UserController();
      await expect(
        controller.deleteUser(testAdmin, "testAdmin2")
      ).rejects.toThrow(UserIsAdminError);
      expect(UserDAO.prototype.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe("deleteAll", () => {
    test("it should return true", async () => {
      jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);
      const controller = new UserController();
      const response = await controller.deleteAll();
      expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
  });

  describe("updateUserInfo", () => {
    test("it should return true", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(false)
      jest
        .spyOn(UserDAO.prototype, "updateUser")
        .mockResolvedValueOnce(updatedUser);
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(testCustomer);
      const controller = new UserController();
      const response = await controller.updateUserInfo(
        testCustomer,
        testCustomer.name,
        testCustomer.surname,
        testCustomer.address,
        testCustomer.birthdate,
        testCustomer.username
      );
      expect(UserDAO.prototype.updateUser).toHaveBeenCalledTimes(1);
      expect(response).toBe(updatedUser);
    });
    test("it should throw UnauthorizedUserError when an user tries to update another user", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(false)
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(testCustomer);
      const controller = new UserController();
      await expect(
        controller.updateUserInfo(
          testCustomer,
          testAdmin.name,
          testAdmin.surname,
          testAdmin.address,
          testAdmin.birthdate,
          testAdmin.username
        )
      ).rejects.toThrow(UnauthorizedUserError);
      expect(UserDAO.prototype.updateUser).not.toHaveBeenCalled();
    });
    test("it should throw UnauthorizedUserError when admin tries to update another admin", async () => {
      jest.spyOn(Utility, "isAdmin").mockReturnValueOnce(true)
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(otherAdmin);
      const controller = new UserController();
      await expect(
        controller.updateUserInfo(
          testAdmin,
          otherAdmin.name,
          otherAdmin.surname,
          otherAdmin.address,
          otherAdmin.birthdate,
          otherAdmin.username
        )
      ).rejects.toThrow(UnauthorizedUserError);
      expect(UserDAO.prototype.updateUser).not.toHaveBeenCalled();
    });
    test("it should throw DateError", async () => {
      jest
        .spyOn(UserDAO.prototype, "getUserByUsername")
        .mockResolvedValueOnce(testCustomer);
      const controller = new UserController();
      await expect(
        controller.updateUserInfo(
          testCustomer,
          testCustomer.name,
          testCustomer.surname,
          testCustomer.address,
          errorDate,
          testCustomer.username
        )
      ).rejects.toThrow(DateError);
      expect(UserDAO.prototype.updateUser).not.toHaveBeenCalled();
    });
  });
});
