import {
  test,
  expect,
  jest,
  describe,
  beforeEach,
  afterEach,
} from "@jest/globals";
import request from "supertest";

import { app } from "../../index";

import UserController from "../../src/controllers/userController";

import Authenticator from "../../src/routers/auth";
import { User } from "../../src/components/user";
import { Role } from "../../src/components/user";
import ErrorHandler from "../../src/helper";
import {
  UnauthorizedUserError,
  UserAlreadyExistsError,
  UserIsAdminError,
  UserNotFoundError,
} from "../../src/errors/userError";
import { DateError } from "../../src/utilities";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/userController");
jest.mock("../../src/routers/auth");

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
const newUser = {
  username: "test",
  name: "test",
  surname: "test",
  password: "test",
  role: "Manager",
};
const updatedUser = {
  ...testCustomer,
  address: "updatedAddress",
  birthdate: "2000-11-13",
};
const users = [testCustomer, testManager, testAdmin];

describe("User routes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /users", () => {
    test("It should return a 200 success code", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
          notEmpty: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock the createUser method of the controller
      jest
        .spyOn(UserController.prototype, "createUser")
        .mockResolvedValueOnce(true);

      const response = await request(app)
        .post(baseURL + "/users")
        .send(newUser); //Send a POST request to the route

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1); //Check if the createUser method has been called once
      //Check if the createUser method has been called with the correct parameters
      expect(UserController.prototype.createUser).toHaveBeenCalledWith(
        newUser.username,
        newUser.name,
        newUser.surname,
        newUser.password,
        newUser.role
      );
    });
    test("It should return a 409 error code, user already exists", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
          notEmpty: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock the createUser method of the controller
      jest
        .spyOn(UserController.prototype, "createUser").mockRejectedValue(new UserAlreadyExistsError())

      const response = await request(app)
        .post(baseURL + "/users")
        .send(newUser); //Send a POST request to the route

      expect(response.status).toBe(409); //Check if the response status is 200
    });
  }),
    describe("GET /users", () => {
      test("it should return a 200 status code and the list of users", async () => {
        // mock user is logged in
        jest
          .spyOn(Authenticator.prototype, "isLoggedIn")
          .mockImplementation((req, res, next) => next());
        // mock user is admin
        jest
          .spyOn(Authenticator.prototype, "isAdmin")
          .mockImplementation((req, res, next) => next());

        // mock the getUsers method of the controller
        jest
          .spyOn(UserController.prototype, "getUsers")
          .mockResolvedValue(users);

        const response = await request(app)
          .get(baseURL + "/users")
          .send();

        expect(response.status).toBe(200);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
        expect(response.body).toEqual(users);
      });

      test("it should return a 401 error code, if user is not an admin", async () => {
        // mock user is logged in
        jest
          .spyOn(Authenticator.prototype, "isLoggedIn")
          .mockImplementation((req, res, next) => next());

        //mock user is not admin
        jest
          .spyOn(Authenticator.prototype, "isAdmin")
          .mockImplementation((req, res, next) => {
            return res
              .status(401)
              .json({ error: "User is not an admin", status: 401 });
          });

        const response = await request(app)
          .get(baseURL + "/users")
          .send();
        expect(response.status).toBe(401);
      });
    });

  describe("GET /users/roles/:role", () => {
    test("it should return 200 and a list of users of a specified role", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
          isIn: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => next());

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // Mock the getUsersByRole method of the controller
      jest
        .spyOn(UserController.prototype, "getUsersByRole")
        .mockResolvedValue(users);

      const response = await request(app)
        .get(baseURL + "/users/roles/Manager")
        .send();
      expect(response.status).toBe(200);
      expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith(
        "Manager"
      );
      expect(response.body).toEqual(users);
    });

    test("it should return 401 if the user is not an admin", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());

      // mock user is not an admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => {
          return res
            .status(401)
            .json({ error: "User is not an admin", status: 401 });
        });

      const response = await request(app)
        .get(baseURL + "/users/roles/Manager")
        .send();

      expect(response.status).toBe(401);
    });

    test("it should return 422 error code if the role parameter is invalid", async () => {
      // mock espress-validator functions
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => {
          throw new Error("Invalid value");
        }),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => next());

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => {
          return res
            .status(422)
            .json({ error: "The parameters are not formatted properly\n\n" });
        });

      const response = await request(app)
        .get(baseURL + "/users/roles/invalid")
        .send();

      expect(response.status).toBe(422);
    });
  });

  describe("GET /users/:username", () => {
    test("it should return 200 response code and a user object", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => next());

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock the getUserByUsername method of the controller
      jest
        .spyOn(UserController.prototype, "getUserByUsername")
        .mockResolvedValue(testCustomer);

      const response = await request(app)
        .get(baseURL + "/users/testCustomer")
        .send();
      expect(response.status).toBe(200);
      expect(UserController.prototype.getUserByUsername).toHaveBeenCalledTimes(
        1
      );
      expect(response.body).toEqual({
        username: testCustomer.username,
        name: testCustomer.name,
        surname: testCustomer.surname,
        role: testCustomer.role,
        address: testCustomer.address,
        birthdate: testCustomer.birthdate,
      });
    });

    test("it should return 401 error code, the user is not an admin or trying to access other user info", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock the getUserByUsername method of the controller
      jest
        .spyOn(UserController.prototype, "getUserByUsername").mockRejectedValue(new UnauthorizedUserError())

      const response = await request(app)
        .get(baseURL + "/users/testAdmin")
        .send();
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: "You cannot access the information of other users",
        status: 401,
      });
    });
    test("it should return 404 error code, user does not exist", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock the getUserByUsername method of the controller
      jest
        .spyOn(UserController.prototype, "getUserByUsername")
        .mockRejectedValue(new UserNotFoundError())

      const response = await request(app)
        .get(baseURL + "/users/wrongUser")
        .send();
      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /users/:username", () => {
    test("it should return 200 status code", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());

      // mock the validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());
      // mock the deleteUser method of the controller
      jest
        .spyOn(UserController.prototype, "deleteUser")
        .mockResolvedValue(true);
      const response = await request(app)
        .delete(baseURL + "/users/testCustomer")
        .send();
      expect(response.status).toBe(200);
      expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
    });

    test("it should return 401 status code, no admin user tried to delete a user", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock the deleteUser method of the controller
      jest
      .spyOn(UserController.prototype, "deleteUser").mockRejectedValue(new UnauthorizedUserError())
      const response = await request(app)
        .delete(baseURL + "/users/testAdmin")
        .send();
      expect(response.status).toBe(401);
    });
    test("it should return 401 status code,user is admin and username represents a different admin user", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => {
          return next();
        });
      // mock the deleteAll method of the controller
      jest
        .spyOn(UserController.prototype, "deleteUser")
        .mockRejectedValue(new UserIsAdminError())
      const response = await request(app)
        .delete(baseURL + "/users/testAdmin2")
        .send();
      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /users", () => {
    test("it should return 200 status code", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => {
          return next();
        });
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());
      // mock the deleteAll method of the controller
      jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValue(true);
      const response = await request(app)
        .delete(baseURL + "/users")
        .send();
      expect(response.status).toBe(200);
      expect(UserController.prototype.deleteAll).toHaveBeenCalledTimes(1);
    });

    test("it should return 401 status code, no admin user tried to delete all users", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is not admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => {
          return res
            .status(401)
            .json({ error: "User is not an admin", status: 401 });
        });
      const response = await request(app)
        .delete(baseURL + "/users")
        .send();
      expect(response.status).toBe(401);
    });
    test("it should return 401 status code,user is admin and username represents a different admin user", async () => {
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => next());
      // mock user is admin
      jest
        .spyOn(Authenticator.prototype, "isAdmin")
        .mockImplementation((req, res, next) => {
          return next();
        });
      // mock the deleteAll method of the controller
      jest
        .spyOn(UserController.prototype, "deleteAll")
        .mockRejectedValue(new UserIsAdminError());
      const response = await request(app)
        .delete(baseURL + "/users")
        .send();
      expect(response.status).toBe(401);
    });
  });

  describe("PATCH /users/:username", () => {
    test("it should return 200 status code and and the updated user", async () => {
      // mock the express-validator functions body
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({ matches: () => {} }) }),
        })),
      }));
      // mock the express-validator functions param
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));
      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => {
          next();
        });

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());
      // mock the updateUserInfo method of the controller
      jest
        .spyOn(UserController.prototype, "updateUserInfo")
        .mockResolvedValue(updatedUser);

      const response = await request(app)
        .patch(baseURL + "/users/testCustomer")
        .send(updatedUser);

      expect(response.status).toBe(200);
      expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
      expect(UserController.prototype.getUserByUsername).toHaveBeenCalled;
      expect(response.body).toEqual(updatedUser);
    });

    test("it should return 401 error code, user is not logged in", async () => {
      // mock the express-validator functions body
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({ matches: () => {} }) }),
        })),
      }));
      // mock the express-validator functions param
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));
      // mock user is not logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => {
          return res
            .status(401)
            .json({ error: "Unauthenticated user", status: 401 });
        });

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      const response = await request(app)
        .patch(baseURL + "/users/testCustomer")
        .send(updatedUser);

      expect(response.status).toBe(401);
      expect(UserController.prototype.updateUserInfo).not.toHaveBeenCalled();
    });

    test("it should return 401 error code, user is logged in but tried to update another user", async () => {
      // mock the express-validator functions body
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({ matches: () => {} }) }),
        })),
      }));
      // mock the express-validator functions param
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock the updateUserInfo method of the controller
      jest
        .spyOn(UserController.prototype, "updateUserInfo")
        .mockRejectedValue(new UnauthorizedUserError())

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      // mock

      const response = await request(app)
        .patch(baseURL + "/users/testAdmin")
        .send(updatedUser);

      expect(response.status).toBe(401);
    });

    test("it should return 404 error code, user to update doesn't exists", async () => {
      // mock the express-validator functions body
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({ matches: () => {} }) }),
        })),
      }));
      // mock the express-validator functions param
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock the updateUserInfo method of the controller
      jest
        .spyOn(UserController.prototype, "updateUserInfo").mockRejectedValue( new UserNotFoundError())
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      const response = await request(app)
        .patch(baseURL + "/users/wrongUser")
        .send(updatedUser);
      expect(response.status).toBe(404);
    });

    test("it should return 400 error code, birthdate is after the current date", async () => {
      // mock the express-validator functions body
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({ matches: () => {} }) }),
        })),
      }));
      // mock the express-validator functions param
      jest.mock("express-validator", () => ({
        param: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock user is logged in
      jest
        .spyOn(Authenticator.prototype, "isLoggedIn")
        .mockImplementation((req, res, next) => {
          next();
        });
      // mock the updateUserInfo method of the controller
      jest
        .spyOn(UserController.prototype, "updateUserInfo")
        .mockRejectedValue(new DateError())
      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());

      const response = await request(app)
        .patch(baseURL + "/users/testCustomer")
        .send(updatedUser);
      expect(response.status).toBe(400);
    });
  });
});
