import {
  test,
  expect,
  jest,
  describe,
  afterEach,
  beforeEach,
} from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import CartController from "../../src/controllers/cartController";
import ProductDao from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";
import { ProductSoldError } from "../../src/errors/productError";
import { Role, User } from "../../src/components/user";
import CartDAO from "../../src/dao/cartDAO";
import { CartNotFoundError, EmptyCartError } from "../../src/errors/cartError";
import { Cart, ProductInCart } from "../../src/components/cart";
jest.mock("../../src/dao/userDAO");

const testCustomer = new User(
  "testCustomer",
  "test",
  "test",
  Role.CUSTOMER,
  "",
  ""
);
const product = {
  model: "test",
  category: Category.SMARTPHONE,
  quantity: 10,
  details: "test",
  sellingPrice: 999,
  arrivalDate: "2024-05-12",
};
const productInCart = {
  model: product.model,
  quantity: 1,
  category: product.category,
  price: product.sellingPrice,
};
const userCart = {
  customer: testCustomer.username,
  paid: false,
  paymentDate: "",
  total: product.sellingPrice,
  products: [productInCart],
};
const emptyCart = {
  customer: testCustomer.username,
  paid: false,
  paymentDate: "",
  total: 0,
  products: [] as ProductInCart[],
};
const history = [
  {
    customer: testCustomer.username,
    paid: true,
    paymentDate: "2024-05-15",
    total: product.sellingPrice,
    products: [productInCart],
  },
];
const products = [product];

describe("Cart controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addToCart", () => {
    test("It should return true", async () => {
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue(products);
      jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValue(true);
      const controller = new CartController();
      const response = await controller.addToCart(testCustomer, product.model);

      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(CartDAO.prototype.addToCart).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
    test("It should throw an error if the product is sold", async () => {
      const soldProduct = {
        ...product,
        quantity: 0,
      };
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue([soldProduct]);
      jest.spyOn(CartDAO.prototype, "addToCart").mockResolvedValue(true);
      const controller = new CartController();
      await expect(
        controller.addToCart(testCustomer, product.model)
      ).rejects.toThrow(ProductSoldError);
      expect(CartDAO.prototype.addToCart).not.toHaveBeenCalled();
    });
  });
  describe("getCart", () => {
    test("It should return true", async () => {
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(userCart);
      const controller = new CartController();
      const response = await controller.getCart(testCustomer);
      expect(CartDAO.prototype.getCurrentCart).toHaveBeenCalledTimes(1);
      expect(response).toBe(userCart);
    });
  });
  describe("checkoutCart", () => {
    test("It should return true", async () => {
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(userCart);
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValue(true);
      jest
        .spyOn(ProductController.prototype, "sellProduct")
        .mockResolvedValue(9);
      const controller = new CartController();
      const response = await controller.checkoutCart(testCustomer);
      expect(CartDAO.prototype.checkoutCart).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
    test("It should throw an error if the cart is not found", async () => {
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(userCart);
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(-1);
      jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValue(true);
      jest
        .spyOn(ProductController.prototype, "sellProduct")
        .mockResolvedValue(9);
      const controller = new CartController();
      await expect(controller.checkoutCart(testCustomer)).rejects.toThrow(
        CartNotFoundError
      );
      expect(CartDAO.prototype.checkoutCart).not.toHaveBeenCalled();
    });
  });
  test("It should throw an error if the cart is empty", async () => {
    jest
      .spyOn(CartDAO.prototype, "getCurrentCart")
      .mockResolvedValue(emptyCart);
    jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
    jest.spyOn(CartDAO.prototype, "checkoutCart").mockResolvedValue(true);
    jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValue(9);
    const controller = new CartController();
    await expect(controller.checkoutCart(testCustomer)).rejects.toThrow(
      EmptyCartError
    );
    expect(CartDAO.prototype.checkoutCart).not.toHaveBeenCalled();
  });
  describe("getCustomerCarts", () => {
    test("It should return the history of carts", async () => {
      jest
        .spyOn(CartDAO.prototype, "getHistoryCarts")
        .mockResolvedValue(history);
      const controller = new CartController();
      const response = await controller.getCustomerCarts(testCustomer);
      expect(CartDAO.prototype.getHistoryCarts).toHaveBeenCalledTimes(1);
      expect(response).toBe(history);
    });
  });
  describe("removeProductFromCart", () => {
    test("It should return true", async () => {
      jest
        .spyOn(ProductController.prototype, "getProducts")
        .mockResolvedValue(products);
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(userCart);
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      jest.spyOn(CartDAO.prototype, "removeFromCart").mockResolvedValue(true);
      const controller = new CartController();
      const response = await controller.removeProductFromCart(
        testCustomer,
        product.model
      );
      expect(CartDAO.prototype.removeFromCart).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
    test("It should throw an error if the cart does not exist", async () => {
      jest
        .spyOn(ProductController.prototype, "getProducts")
        .mockResolvedValue(products);
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(userCart);
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(-1);
      jest.spyOn(CartDAO.prototype, "removeFromCart").mockResolvedValue(true);
      const controller = new CartController();
      await expect(
        controller.removeProductFromCart(testCustomer, product.model)
      ).rejects.toThrow(CartNotFoundError);
      expect(CartDAO.prototype.removeFromCart).not.toHaveBeenCalled();
    });
    test("It should throw an error if the cart is empty", async () => {
      jest
        .spyOn(ProductController.prototype, "getProducts")
        .mockResolvedValue(products);
      jest
        .spyOn(CartDAO.prototype, "getCurrentCart")
        .mockResolvedValue(emptyCart);
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      jest.spyOn(CartDAO.prototype, "removeFromCart").mockResolvedValue(true);
      const controller = new CartController();
      await expect(
        controller.removeProductFromCart(testCustomer, product.model)
      ).rejects.toThrow(CartNotFoundError);
      expect(CartDAO.prototype.removeFromCart).not.toHaveBeenCalled();
    });
  });
  describe("clearCart", () => {
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValue(true);
      const controller = new CartController();
      const response = await controller.clearCart(testCustomer);
      expect(CartDAO.prototype.clearCart).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
    test("It should throw an error if the cart does not exist", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(-1);
      jest.spyOn(CartDAO.prototype, "clearCart").mockResolvedValue(true);
      const controller = new CartController();
      await expect(controller.clearCart(testCustomer)).rejects.toThrow(
        CartNotFoundError
      );
      expect(CartDAO.prototype.clearCart).not.toHaveBeenCalled();
    });
  });
  describe("deleteAllCarts", () => {
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "deleteAllCarts").mockResolvedValue(true);
      const controller = new CartController();
      const response = await controller.deleteAllCarts();
      expect(CartDAO.prototype.deleteAllCarts).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
  });
  describe("getAllCarts", () => {
    test("It should return an array of carts", async () => {
      jest.spyOn(CartDAO.prototype, "getAllCarts").mockResolvedValue(history);
      const controller = new CartController();
      const response = await controller.getAllCarts();
      expect(CartDAO.prototype.getAllCarts).toHaveBeenCalledTimes(1);
      expect(response).toBe(history);
    });
  });
});
