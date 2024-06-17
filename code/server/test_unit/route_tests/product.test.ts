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

import ProductController from "../../src/controllers/productController";
import { Category, Product } from "../../src/components/product";

import Authenticator from "../../src/routers/auth";
import ErrorHandler from "../../src/helper";

import { 
    ProductNotFoundError,
    ProductAlreadyExistsError,
    ProductSoldError, 
    EmptyProductStockError, 
    LowProductStockError
} from "../../src/errors/productError";

import {DateError} from "../../src/utilities";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/productController");
jest.mock("../../src/routers/auth");

const testProduct = new Product(
    1000,
    "model",
    Category.SMARTPHONE,
    "2021-01-01",
    "details",
    10
);

const newProduct = {
    model: "model",
    category: "Smartphone",
    quantity: 10,
    details: "details",
    sellingPrice: 1000,
    arrivalDate: "2021-01-01",
};

const newSell = {
    sellingDate: "2021-01-01",
    quantity: 5,
};

describe("Product routes", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("POST /products", () => {
        test("Should return 200 when the product is successfully registered", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "registerProducts")
                .mockResolvedValue(undefined);

            const response = await request(app)
                .post(baseURL + "/products")
                .send(newProduct);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
                newProduct.model,
                newProduct.category,
                newProduct.quantity,
                newProduct.details,
                newProduct.sellingPrice,
                newProduct.arrivalDate
            );
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        });

        test("Should return 409 when the product already exists", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "registerProducts")
                .mockRejectedValue(new ProductAlreadyExistsError);

            const response = await request(app)
                .post(baseURL + "/products")
                .send(newProduct);
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "The product already exists",
                status: 409,
            });
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
                newProduct.model,
                newProduct.category,
                newProduct.quantity,
                newProduct.details,
                newProduct.sellingPrice,
                newProduct.arrivalDate
            );
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        });

        test("Should return 400 when arrivalDate is greater than today", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "registerProducts")
                .mockRejectedValue(new DateError);

            const response = await request(app)
                .post(baseURL + "/products")
                .send({
                    ...newProduct,
                    arrivalDate: "2022-01-01",
                });
            
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: "Input date is not compatible with the current date",
                status: 400,
            });
            expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        });
    });

    describe("PATCH /products/:model", () => {
        test("Should return 200 when the product quantity is successfully updated", async () => {
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
            
            jest
                .spyOn(ProductController.prototype, "changeProductQuantity")
                .mockResolvedValue(20);
            
            const response = await request(app)
                .patch(baseURL + "/products/model")
                .send({ quantity: 10 });
            
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ quantity: 20 });
                expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
                    "model",
                    10,
                    undefined
                );
        });

        test("Should return 404 when the product is not found", async () => {
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
            
            jest
                .spyOn(ProductController.prototype, "changeProductQuantity")
                .mockRejectedValue(new ProductNotFoundError);
            
            const response = await request(app)
                .patch(baseURL + "/products/model")
                .send({ quantity: 10 });
            
                expect(response.status).toBe(404);
                expect(response.body).toEqual({ 
                    error: "Product not found",
                    status: 404,
                 });
                expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
                    "model",
                    10,
                    undefined
                );
        });

        test("Should return 400 when the changeDate is greater than today", async () => {
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
            
            jest
                .spyOn(ProductController.prototype, "changeProductQuantity")
                .mockRejectedValue(new DateError);
            
            const response = await request(app)
                .patch(baseURL + "/products/model")
                .send({ 
                    quantity: 10,
                    changeDate: "2022-01-01", 
                });
            
                expect(response.status).toBe(400);
                expect(response.body).toEqual({ 
                    error: "Input date is not compatible with the current date",
                    status: 400,
                });
                expect(ProductController.prototype.changeProductQuantity).toHaveBeenCalledWith(
                    "model",
                    10,
                    "2022-01-01"
                );
        });
    });

    describe("PATCH /products/:model/sell", () => {
        test("Should return 200 when the product is successfully sold", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "sellProduct")
                .mockResolvedValue(10);

            const response = await request(app)
                .patch(baseURL + "/products" + "/model/sell")
                .send({
                    sellingDate: newSell.sellingDate,
                    quantity: newSell.quantity});
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                "quantity": 10,
            });
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "model",
                newSell.quantity,
                newSell.sellingDate
            );
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
            
        });

        test("Should return 404 when the product is not found", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "sellProduct")
                .mockRejectedValue(new ProductNotFoundError);

            const response = await request(app)
                .patch(baseURL + "/products" + "/model/sell")
                .send({quantity: newSell.quantity});
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "model",
                newSell.quantity,
                undefined
            );
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        });

        test("Should return 400 when the sellingDate is greater than today", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "sellProduct")
                .mockRejectedValue(new DateError);

            const response = await request(app)
                .patch(baseURL + "/products" + "/model/sell")
                .send({quantity: newSell.quantity});
            
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: "Input date is not compatible with the current date",
                status: 400,
            });
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "model",
                newSell.quantity,
                undefined
            );
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        });

        test("Should return 409 when the product is out of stock", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "sellProduct")
                .mockRejectedValue(new EmptyProductStockError);

            const response = await request(app)
                .patch(baseURL + "/products" + "/model/sell")
                .send({quantity: newSell.quantity});
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "Product stock is empty",
                status: 409,
            });
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "model",
                newSell.quantity,
                undefined
            );
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        });

        test("Should return 409 when the product stock is less than the requested quantity", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "sellProduct")
                .mockRejectedValue(new LowProductStockError);

            const response = await request(app)
                .patch(baseURL + "/products" + "/model/sell")
                .send({quantity: newSell.quantity});
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "Product stock cannot satisfy the requested quantity",
                status: 409,
            });
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
                "model",
                newSell.quantity,
                undefined
            );
            expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /products", () => {
        test("Should return 200 when all products are successfully retrieved", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined
            );
        });

        test("Should return 200 when all products of a specific model are successfully retrieved", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "model",
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(
                "model",
                undefined,
                testProduct.model
            );
        });

        test("Should return 200 when all products of a specific category are successfully retrieved", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "category",
                    category: testProduct.category  
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(
                "category",
                testProduct.category,
                undefined
            );
        });

        test("Should return 422 when grouping is null but category isn't", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    category: testProduct.category  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **category** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is null but model isn't", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **model** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is category but category is null", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "category"  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is category but model is not null", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "category",
                    category: testProduct.category,
                    model: testProduct.model
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **model** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is model but model is null", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "model"  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is model but category is not null", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "model",
                    category: testProduct.category,
                    model: testProduct.model
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **category** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getProducts).not.toHaveBeenCalled();
        });

        test("Should return 404 when no products are found", async () => {
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
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getProducts")
                .mockRejectedValue(new ProductNotFoundError);

            const response = await request(app)
                .get(baseURL + "/products")
                .query({ 
                    grouping: "model",
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(ProductController.prototype.getProducts).toHaveBeenCalledWith(
                "model",
                undefined,
                testProduct.model
            );
        });
    });

    describe("GET /products/available", () => {
        test("Should return 200 when all products are successfully retrieved", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined
            );
        });

        test("Should return 200 when all products of a specific model are successfully retrieved", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "model",
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(
                "model",
                undefined,
                testProduct.model
            );
        });

        test("Should return 200 when all products of a specific category are successfully retrieved", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "category",
                    category: testProduct.category  
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([{
                "arrivalDate": testProduct.arrivalDate, 
                "category": testProduct.category, 
                "details": testProduct.details, 
                "model": testProduct.model, 
                "quantity": testProduct.quantity, 
                "sellingPrice": testProduct.sellingPrice
            }]);
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(
                "category",
                testProduct.category,
                undefined
            );
        });

        test("Should return 422 when grouping is null but category isn't", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    category: testProduct.category  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **category** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is null but model isn't", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **model** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is category but category is null", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "category"  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is category but model is not null", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "category",
                    category: testProduct.category,
                    model: testProduct.model
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **model** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is model but model is null", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "model"  
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 422 when grouping is model but category is not null", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockResolvedValue([testProduct]);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "model",
                    category: testProduct.category,
                    model: testProduct.model
                });
            
            expect(response.status).toBe(422);
            expect(response.body).toEqual({
                error: "The parameters are not formatted properly\n\n- Parameter: **category** - Reason: *Invalid value* - Location: *query*\n\n"
            });
            expect(ProductController.prototype.getAvailableProducts).not.toHaveBeenCalled();
        });

        test("Should return 404 when no products are found", async () => {
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

            // mock validateRequest
            jest
                .spyOn(ErrorHandler.prototype, "validateRequest")
                .mockImplementation((req, res, next) => next());
            
            // mock the sellProduct
            jest
                .spyOn(ProductController.prototype, "getAvailableProducts")
                .mockRejectedValue(new ProductNotFoundError);

            const response = await request(app)
                .get(baseURL + "/products/available")
                .query({ 
                    grouping: "model",
                    model: testProduct.model  
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledWith(
                "model",
                undefined,
                testProduct.model
            );
        });
    });

    describe("DELETE /:model", () => {
        test("Should return 200 when the product is successfully deleted", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "deleteProduct")
                .mockResolvedValue(true);

            const response = await request(app)
                .delete(baseURL + "/products/" + testProduct.model);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("model");
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
        });

        test("Should return 404 when the product is not found", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "deleteProduct")
                .mockRejectedValue(new ProductNotFoundError);

            const response = await request(app)
                .delete(baseURL + "/products/" + testProduct.model);
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("model");
            expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
        });
    });

    describe("DELETE /products", () => {
        test("Should return 200 when all products are successfully deleted", async () => {
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
            
            // mock the registerProducts
            jest
                .spyOn(ProductController.prototype, "deleteAllProducts")
                .mockResolvedValue(true);

            const response = await request(app)
                .delete(baseURL + "/products/");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
        });
    });
});