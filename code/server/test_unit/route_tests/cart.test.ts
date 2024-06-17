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

import CartController from "../../src/controllers/cartController";

import Authenticator from "../../src/routers/auth";
import { Cart, ProductInCart } from "../../src/components/cart";
import { User } from "../../src/components/user";
import { Role } from "../../src/components/user";
import { Category, Product } from "../../src/components/product";
import ErrorHandler from "../../src/helper";
import {
    CartNotFoundError, 
    ProductInCartError, 
    ProductNotInCartError, 
    WrongUserCartError, 
    EmptyCartError 
} from "../../src/errors/cartError";

import { 
    ProductNotFoundError, 
    ProductAlreadyExistsError, 
    ProductSoldError, 
    EmptyProductStockError, 
    LowProductStockError 
} from "../../src/errors/productError";

const baseURL = "/ezelectronics";

jest.mock("../../src/controllers/cartController");
jest.mock("../../src/routers/auth");

const testCustomer = new User(
    "testCustomer",
    "test",
    "test",
    Role.CUSTOMER,
    "",
    ""
  );
  const testProduct = new Product(
    1000,
    "model",
    Category.SMARTPHONE,
    "2021-01-01",
    "details",
    10
);

const testProductsInCart = new ProductInCart(
    testProduct.model,
    1,
    testProduct.category,
    testProduct.sellingPrice
);

const testCart = new Cart(
    testCustomer.username,
    false,
    "",
    1000,
    [testProductsInCart]
);


describe("Cart Routes", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("GET /carts", () => {
        test("should return the cart of the logged in customer", async () => {
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
            
            // mock getCart
            jest.spyOn(CartController.prototype, "getCart").mockResolvedValue(testCart);

            const response = await request(app)
                .get(baseURL + "/carts");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual(testCart);
            expect(CartController.prototype.getCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.getCart).toHaveBeenCalledWith(undefined);
        });
    });

    describe("POST /carts", () => {
        test("should add a product to the cart of the logged in customer", async () => {
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
            
            // mock addProductToCart
            jest.spyOn(CartController.prototype, "addToCart").mockResolvedValue(true);

            const response = await request(app)
                .post(baseURL + "/carts")
                .send({ model: testProduct.model });
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );

        });

        test("should return 404 if the product model is not found", async () => {
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
            
            // mock addProductToCart
            jest.spyOn(CartController.prototype, "addToCart").mockRejectedValue(new ProductNotFoundError());

            const response = await request(app)
                .post(baseURL + "/carts")
                .send({ model: testProduct.model });
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });

        test("should return 409 if available quantity is 0", async () => {
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
            
            // mock addProductToCart
            jest.spyOn(CartController.prototype, "addToCart").mockRejectedValue(new ProductSoldError());

            const response = await request(app)
                .post(baseURL + "/carts")
                .send({ model: testProduct.model });
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "Product already sold",
                status: 409,
            });
            expect(CartController.prototype.addToCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.addToCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });
    });

    describe("PATCH /carts", () => {
        test("simulates a successful checkout", async () => {
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
            
            // mock checkoutCart
            jest.spyOn(CartController.prototype, "checkoutCart").mockResolvedValue(true);

            const response = await request(app)
                .patch(baseURL + "/carts");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined);
        });

        test("Should return 404 if there is no information of an unpaid cart in the database", async () => {
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
            
            // mock checkoutCart
            jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValue(new CartNotFoundError());

            const response = await request(app)
                .patch(baseURL + "/carts");
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Cart not found",
                status: 404,
            });
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined);
        });

        test("Should return 400 if the cart is empty", async () => {
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
            
            // mock checkoutCart
            jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValue(new EmptyCartError());

            const response = await request(app)
                .patch(baseURL + "/carts");
            
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                error: "Cart is empty",
                status: 400,
            });
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined);
        });

        test("Should return 409 if at least one of the products in the cart has 0 in stock", async () => {
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
            
            // mock checkoutCart
            jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValue(new EmptyProductStockError());

            const response = await request(app)
                .patch(baseURL + "/carts");
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "Product stock is empty",
                status: 409,
            });
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined);
        });

        test("Should return 409 if at least one of the products in the cart has a quantity higher than the available stock", async () => {
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
            
            // mock checkoutCart
            jest.spyOn(CartController.prototype, "checkoutCart").mockRejectedValue(new LowProductStockError());

            const response = await request(app)
                .patch(baseURL + "/carts");
            
            expect(response.status).toBe(409);
            expect(response.body).toEqual({
                error: "Product stock cannot satisfy the requested quantity",
                status: 409,
            });
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.checkoutCart).toHaveBeenCalledWith(undefined);
        });
    });

    describe("GET /carts/history", () => {
        test("should return the history of the logged in customer's carts", async () => {
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
            
            // mock getCustomerCarts
            jest.spyOn(CartController.prototype, "getCustomerCarts").mockResolvedValue([testCart]);

            const response = await request(app)
                .get(baseURL + "/carts/history");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([testCart]);
            expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.getCustomerCarts).toHaveBeenCalledWith(undefined);
        });
    });

    describe("DELETE /carts/products/:model", () => {
        test("should remove a product from the cart of the logged in customer", async () => {
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
            
            // mock removeProductFromCart
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockResolvedValue(true);

            const response = await request(app)
                .delete(baseURL + "/carts/products/" + testProduct.model);
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });

        test("should return 404 if the product model is not found in the cart", async () => {
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
            
            // mock removeProductFromCart
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValue(new ProductNotInCartError());

            const response = await request(app)
                .delete(baseURL + "/carts/products/" + testProduct.model);
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not in cart",
                status: 404,
            });
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });

        test("should return 404 if there is no information of an unpaid cart or no products in the cart in the database", async () => {
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
            
            // mock removeProductFromCart
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValue(new CartNotFoundError());

            const response = await request(app)
                .delete(baseURL + "/carts/products/" + testProduct.model);
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Cart not found",
                status: 404,
            });
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });

        test("should return 404 if model does not represent an existing product", async () => {
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
            
            // mock removeProductFromCart
            jest.spyOn(CartController.prototype, "removeProductFromCart").mockRejectedValue(new ProductNotFoundError());

            const response = await request(app)
                .delete(baseURL + "/carts/products/" + testProduct.model);
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Product not found",
                status: 404,
            });
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.removeProductFromCart).toHaveBeenCalledWith(
                undefined, 
                testProduct.model
            );
        });
    });

    describe("DELETE /carts/current", () => {
        test("should clear the cart of the logged in customer", async () => {
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
            
            // mock clearCart
            jest.spyOn(CartController.prototype, "clearCart").mockResolvedValue(true);

            const response = await request(app)
                .delete(baseURL + "/carts/current");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.clearCart).toHaveBeenCalledWith(undefined);
        });

        test("should return 404 if there is no information of an unpaid cart in the database", async () => {
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
            
            // mock clearCart
            jest.spyOn(CartController.prototype, "clearCart").mockRejectedValue(new CartNotFoundError());

            const response = await request(app)
                .delete(baseURL + "/carts/current");
            
            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                error: "Cart not found",
                status: 404,
            });
            expect(CartController.prototype.clearCart).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.clearCart).toHaveBeenCalledWith(undefined);
        });
    });

    describe("DELETE /carts", () => {
        test("should delete all carts of all users", async () => {
            // mock the express-validator functions
            jest.mock("express-validator", () => ({
                param: jest.fn().mockImplementation(() => ({})),    
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
            
            // mock deleteAllCarts
            jest.spyOn(CartController.prototype, "deleteAllCarts").mockResolvedValue(true);

            const response = await request(app)
                .delete(baseURL + "/carts");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({});
            expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.deleteAllCarts).toHaveBeenCalledWith();
        });
    });

    describe("GET /carts/all", () => {
        test("should return all carts of all users", async () => {
            // mock the express-validator functions
            jest.mock("express-validator", () => ({
                param: jest.fn().mockImplementation(() => ({})),    
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
            
            // mock getAllCarts
            jest.spyOn(CartController.prototype, "getAllCarts").mockResolvedValue([testCart]);

            const response = await request(app)
                .get(baseURL + "/carts/all");
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual([testCart]);
            expect(CartController.prototype.getAllCarts).toHaveBeenCalledTimes(1);
            expect(CartController.prototype.getAllCarts).toHaveBeenCalledWith();
        });
    });

});