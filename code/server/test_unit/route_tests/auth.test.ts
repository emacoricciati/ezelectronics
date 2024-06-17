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

import Authenticator from "../../src/routers/auth";
import { User } from "../../src/components/user";
import { Role } from "../../src/components/user";
import ErrorHandler from "../../src/helper";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/userController");
jest.mock("../../src/routers/auth");

const loginUser = {
  username: "testCustomer",
  password: "test",
};
const testCustomer = new User(
  "testCustomer",
  "test",
  "test",
  Role.CUSTOMER,
  "",
  ""
);

describe("Auth routes", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /sessions", () => {
    test("It should return a 200 success code", async () => {
      // mock the express-validator functions
      jest.mock("express-validator", () => ({
        body: jest.fn().mockImplementation(() => ({
          isString: () => ({ isLength: () => ({}) }),
        })),
      }));

      // mock validateRequest
      jest
        .spyOn(ErrorHandler.prototype, "validateRequest")
        .mockImplementation((req, res, next) => next());
      // mock login method
      jest
        .spyOn(Authenticator.prototype, "login")
        .mockResolvedValueOnce(testCustomer);

      const response = await request(app)
        .post(baseURL + "/sessions")
        .send(loginUser); //Send a POST request to the route

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(Authenticator.prototype.login).toHaveBeenCalledTimes(1); //Check if the login method has been called once
    });
  });
  describe("GET /sessions/current", () => {
    test("It should return a 200 success code", async () => {

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

      const response = await request(app)
        .get(baseURL + "/sessions/current")

      expect(response.status).toBe(200); //Check if the response status is 200
    });
  });
  describe("DELETE /sessions/current", () => {
    test("It should return a 200 success code", async () => {
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

      // mock logout method
      jest
        .spyOn(Authenticator.prototype, "logout")
        .mockResolvedValueOnce(null);

      const response = await request(app)
        .delete(baseURL + "/sessions/current")

      expect(response.status).toBe(200); //Check if the response status is 200
      expect(Authenticator.prototype.logout).toHaveBeenCalledTimes(1); //Check if the logout method has been called once
    });
  });
});
