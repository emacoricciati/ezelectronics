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

import ReviewController from "../../src/controllers/reviewController";

import Authenticator from "../../src/routers/auth";
import { User } from "../../src/components/user";
import { Role } from "../../src/components/user";
import ErrorHandler from "../../src/helper";
import {
    ExistingReviewError,
    NoReviewProductError,
  } from "../../src/errors/reviewError";
import { ProductReview } from "../../src/components/review";
import { ProductNotFoundError } from "../../src/errors/productError";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/reviewController");
jest.mock("../../src/routers/auth");

const testReview = new ProductReview(
    "test model",
    "test user",
    5,
    "2021-06-01",
    "test comment"
);

const testCustomer = new User(
    "testCustomer",
    "test",
    "test",
    Role.CUSTOMER,
    "",
    ""
  );
  const testAdmin = new User(
    "testAdmin", 
    "test", 
    "test", 
    Role.ADMIN, 
    "", 
    "");
  const testManager = new User(
    "testManager",
    "test",
    "test",
    Role.MANAGER,
    "",
    ""
  );

const newReview = {
    model: "test model",
    user: testCustomer,
    score: 5,
    date: "2021-06-01",
    comment: "test comment",
};
const reviews = [testReview];


describe("Review routes", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("POST /reviews/:model", () => {
        test("It should return a 200 success code", async () => {
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

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock addReview method
            jest
                .spyOn(ReviewController.prototype, "addReview")
                .mockResolvedValueOnce();

            const response = await request(app)
                .post(baseURL + "/reviews/" + newReview.model)
                .send(newReview); //Send a POST request to the route

            expect(response.status).toBe(200); //Check if the response status is 200
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1); //Check if the addReview method has been called once

            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
                newReview.model,
                undefined,
                newReview.score,
                newReview.comment
            );
            expect(response.body).toEqual({}); //Check if the response body is an empty object
        });

        test("It should return a 404 error code", async () => {
            // mock user is logged in
            jest
            .spyOn(Authenticator.prototype, "isLoggedIn")
            .mockImplementation((req, res, next) => next());

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock addReview method
            jest
            .spyOn(ReviewController.prototype, "addReview")
            .mockRejectedValue(new ProductNotFoundError());

            const response = await request(app)
                .post(baseURL + "/reviews/wrongModel")
                .send(newReview); //Send a POST request to the route
            expect(response.status).toBe(404); //Check if the response status is 404
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1); //Check if the addReview method has been called once
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
                "wrongModel",
                undefined,
                newReview.score,
                newReview.comment
            );
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            }); //Check if the response body is an empty object

        });
        // 409 error existing review tested in Review DAO
        test("It should return a 409 error code", async () => {
            // mock user is logged in
            jest
            .spyOn(Authenticator.prototype, "isLoggedIn")
            .mockImplementation((req, res, next) => next());

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock addReview method
            jest
            .spyOn(ReviewController.prototype, "addReview")
            .mockRejectedValue(new ExistingReviewError());

            const response = await request(app)
                .post(baseURL + "/reviews/" + newReview.model)
                .send(newReview); //Send a POST request to the route
            expect(response.status).toBe(409); //Check if the response status is 404
            expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1); //Check if the addReview method has been called once
            expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
                newReview.model,
                undefined,
                newReview.score,
                newReview.comment
            );
            expect(response.body).toEqual({
                error: "You have already reviewed this product",
                status: 409,
            }); //Check if the response body is an empty object

        });
    });
    describe("GET /reviews/:model", () => {
        test("It should return a 200 success code", async () => {
            // mock user is logged in
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock getProductReviews method
            jest
                .spyOn(ReviewController.prototype, "getProductReviews")
                .mockResolvedValueOnce(reviews);

            const response = await request(app)
                .get(baseURL + "/reviews/" + newReview.model);

            expect(response.status).toBe(200); //Check if the response status is 200
            expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1); //Check if the getProductReviews method has been called once
            expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(
                newReview.model
            );
            expect(response.body).toEqual(reviews); //Check if the response body is equal to the reviews array
        });
    });
    describe("DELETE /reviews/:model", () => {
        test("It should return a 200 success code", async () => {
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

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock deleteReview method
            jest
                .spyOn(ReviewController.prototype, "deleteReview")
                .mockResolvedValueOnce();

            const response = await request(app)
                .delete(baseURL + "/reviews/" + newReview.model)
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(200); //Check if the response status is 200
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1); //Check if the deleteReview method has been called once
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(
                newReview.model,
                undefined
            );
            expect(response.body).toEqual({}); //Check if the response body is an empty object
        });
        // 404 error model not in database
        test("It should return a 404 error code", async () => {
            // mock user is logged in
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock deleteReview method
            jest
                .spyOn(ReviewController.prototype, "deleteReview")
                .mockRejectedValue(new ProductNotFoundError());

            const response = await request(app)
                .delete(baseURL + "/reviews/wrongModel")
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(404); //Check if the response status is 200
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1); //Check if the deleteReview method has been called once
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(
                "wrongModel",
                undefined
            );
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            }); 
        });
        // 404 error user doesn't have a review
        test("It should return a 404 error code", async () => {
            // mock user is logged in
            jest
                .spyOn(Authenticator.prototype, "isLoggedIn")
                .mockImplementation((req, res, next) => next());

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isCustomer")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());

            // mock deleteReview method
            jest
                .spyOn(ReviewController.prototype, "deleteReview")
                .mockRejectedValue(new NoReviewProductError());

            const response = await request(app)
                .delete(baseURL + "/reviews/" + newReview.model)
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(404); //Check if the response status is 200
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1); //Check if the deleteReview method has been called once
            expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(
                newReview.model,
                undefined
            );
            expect(response.body).toEqual({
                error: "You have not reviewed this product",
                status: 404,
            });
        });
    });
    describe("DELETE /reviews/:model/all", () => {
        test("It should return a 200 success code", async () => {
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

            // mock user is admin or manager
            jest
                .spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock deleteReviewsOfProduct method
            jest
                .spyOn(ReviewController.prototype, "deleteReviewsOfProduct")
                .mockResolvedValueOnce();
            
            const response = await request(app)
                .delete(baseURL + "/reviews/" + newReview.model + "/all")
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(200); //Check if the response status is 200
            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1); //Check if the deleteReviewsOfProduct method has been called once
            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(
                newReview.model
            );
            expect(response.body).toEqual({}); //Check if the response body is an empty object
        });
        // 404 error model not in database
        test("It should return a 404 error code", async () => {
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

            // mock user is customer
            jest
                .spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock deleteReviewsOfProduct method
            jest
                .spyOn(ReviewController.prototype, "deleteReviewsOfProduct")
                .mockRejectedValue(new ProductNotFoundError());
            
            const response = await request(app)
                .delete(baseURL + "/reviews/" + "wrongModel" + "/all")
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(404); //Check if the response status is 200
            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1); //Check if the deleteReviewsOfProduct method has been called once
            expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(
                "wrongModel"
            );
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
        });
    });
    describe("DELETE /reviews", () => {
        test("It should return a 200 success code", async () => {
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

            // mock user is admin or manager
            jest
                .spyOn(Authenticator.prototype, "isAdminOrManager")
                .mockImplementation((req, res, next) => next());

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock deleteReviewsOfProduct method
            jest
                .spyOn(ReviewController.prototype, "deleteAllReviews")
                .mockResolvedValueOnce();
            
            const response = await request(app)
                .delete(baseURL + "/reviews")
                .send(); //Send a DELETE request to the route
            expect(response.status).toBe(200); //Check if the response status is 200
            expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1); //Check if the deleteReviewsOfProduct method has been called once
            
            expect(response.body).toEqual({}); //Check if the response body is an empty object
        });
    });
});
