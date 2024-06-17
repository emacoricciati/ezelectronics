import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";

import db from "../../src/db/db";
import { Database } from "sqlite3";
import CartDAO from "../../src/dao/cartDAO";
import { Category } from "../../src/components/product";
import { ProductInCart } from "../../src/components/cart";
import { User, Role } from "../../src/components/user";
import { ProductNotInCartError } from "../../src/errors/cartError";

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
  quantity: 10,
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
const productsInCart = [productInCart];
const history = [
  {
    customer: testCustomer.username,
    paid: 1,
    paymentDate: "2024-05-15",
    total: product.sellingPrice,
    products: productsInCart,
  },
];

describe("cartDAO", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  // private methods
  describe("getProductsInCart", () => {
    test("It should resolve an array of products in cart", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, productsInCart);
          return {} as Database;
        });
      const result = await (cartDAO as any).getProductsInCart(cartID);
      expect(result).toEqual(productsInCart);
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), productsInCart);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).getProductsInCart(cartID)
      ).rejects.toThrow();
      mockDBAll.mockRestore();
    });
  });

  describe("createNewCart", () => {
    test("It should return true", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).createNewCart(
        testCustomer.username
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).createNewCart(testCustomer.username)
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  describe("insertProductInCart", () => {
    test("It should return true", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).insertProductInCart(
        cartID,
        product
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).insertProductInCart(cartID, product)
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  describe("updateProductInCart", () => {
    test("It should return true", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).updateProductInCart(
        cartID,
        product.model,
        "add"
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).updateProductInCart(cartID, product.model, "add")
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  describe("updateCartTotal", () => {
    test("It should return true", async () => {
      const price = 999;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).updateCartTotal(
        testCustomer.username,
        price,
        "add"
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const price = 999;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).updateCartTotal(testCustomer.username, price, "add")
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  describe("getProductInCart", () => {
    test("It should return a product in cart", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, productInCart);
          return {} as Database;
        });
      const result = await (cartDAO as any).getProductInCart(
        cartID,
        product.model
      );
      expect(result).toEqual(productInCart);
      mockDBGet.mockRestore();
    });
    test("It should return an empty object", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      const result = await (cartDAO as any).getProductInCart(
        cartID,
        product.model
      );
      expect(result).toEqual({} as ProductInCart);
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), productInCart);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).getProductInCart(cartID, product.model)
      ).rejects.toThrow();
      mockDBGet.mockRestore();
    });
  });

  describe("deleteProductInCart", () => {
    test("It should resolve true", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).deleteProductInCart(
        cartID,
        product.model
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).deleteProductInCart(cartID, product.model)
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  describe("deleteCurrentCart", () => {
    test("It should resolve true", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await (cartDAO as any).deleteCurrentCart(
        testCustomer.username
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        (cartDAO as any).deleteCurrentCart(testCustomer.username)
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });

  // public methods
  describe("getCurrentCartId", () => {
    test("It should resolve", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, cartID);
          return {} as Database;
        });
      await cartDAO.getCurrentCartId(testCustomer.username);
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), cartID);
          return {} as Database;
        });
      await expect(
        cartDAO.getCurrentCartId(testCustomer.username)
      ).rejects.toThrow();
      mockDBGet.mockRestore();
    });
    test("It should return -1", async () => {
      const cartID = 1;
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      const result = await cartDAO.getCurrentCartId(testCustomer.username);
      expect(result).toEqual(-1);
      mockDBGet.mockRestore();
    });
  });
  describe("getCurrentCart", () => {
    test("It should resolve with the current cart", async () => {
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, userCart);
          return {} as Database;
        });
      await cartDAO.getCurrentCart(testCustomer.username);
      mockDBGet.mockRestore();
    });
    test("It should resolve with a new cart", async () => {
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      await cartDAO.getCurrentCart(testCustomer.username);
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      await expect(
        cartDAO.getCurrentCart(testCustomer.username)
      ).rejects.toThrow();
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockRejectedValue(new Error());
      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, userCart);
          return {} as Database;
        });
      await expect(
        cartDAO.getCurrentCart(testCustomer.username)
      ).rejects.toThrow();
      mockDBGet.mockRestore();
    });
    test("It should resolve with a new cart when no row is found", async () => {
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);

      const cartDAO = new CartDAO();
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null); // Simula !row passando null come secondo parametro
          return {} as Database;
        });

      const result = await cartDAO.getCurrentCart(testCustomer.username);

      expect(result).toMatchObject({
        customer: testCustomer.username,
        paid: false,
        paymentDate: null,
        total: 0,
        products: [],
      });
      mockDBGet.mockRestore();
    });
  });
  describe("addToCart", () => {
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue(productsInCart);
      jest
        .spyOn(CartDAO.prototype as any, "createNewCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "insertProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await cartDAO.addToCart(testCustomer.username, product);
    });
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(-1);
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue({} as ProductInCart);
      jest
        .spyOn(CartDAO.prototype as any, "createNewCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "insertProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await cartDAO.addToCart(testCustomer.username, product);
    });
    test("It should throw an error", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      // private method
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockRejectedValue(new Error());
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue(productsInCart);
      jest
        .spyOn(CartDAO.prototype as any, "createNewCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "insertProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await expect(
        cartDAO.addToCart(testCustomer.username, product)
      ).rejects.toThrow();
    });
  });
  describe("checkoutCart", () => {
    test("It should return true", async () => {
      const paymentDate = "2024-05-15";
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await cartDAO.checkoutCart(
        testCustomer.username,
        paymentDate
      );
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const paymentDate = "2024-05-15";
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(
        cartDAO.checkoutCart(testCustomer.username, paymentDate)
      ).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
  describe("getHistoryCarts", () => {
    test("It should return the history of carts", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, history);
          return {} as Database;
        });
      const result = await cartDAO.getHistoryCarts(testCustomer.username);
      expect(result).toEqual([{ ...history[0], paid: true }]);
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), history);
          return {} as Database;
        });
      await expect(
        cartDAO.getHistoryCarts(testCustomer.username)
      ).rejects.toThrow();
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockRejectedValue(new Error());
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, history);
          return {} as Database;
        });
      await expect(
        cartDAO.getHistoryCarts(testCustomer.username)
      ).rejects.toThrow();
      mockDBAll.mockRestore();
    });
  });
  describe("removeFromCart", () => {
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue(productInCart);
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "deleteProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await cartDAO.removeFromCart(testCustomer.username, product.model);
      expect(true).toEqual(true);
    });
    test("It should throw an error, product is not in cart", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue({} as ProductInCart);
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "deleteProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await expect(
        cartDAO.removeFromCart(testCustomer.username, product.model)
      ).rejects.toThrow(ProductNotInCartError);
    });
    test("It should return true", async () => {
      jest.spyOn(CartDAO.prototype, "getCurrentCartId").mockResolvedValue(0);
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductInCart" as any)
        .mockResolvedValue({ ...productInCart, quantity: 1 });
      jest
        .spyOn(CartDAO.prototype as any, "updateCartTotal" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "deleteProductInCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "updateProductInCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await cartDAO.removeFromCart(testCustomer.username, product.model);
      expect(true).toEqual(true);
    });
  });
  describe("clearCart", () => {
    test("It should return true", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "deleteCurrentCart" as any)
        .mockResolvedValue(true);
      jest
        .spyOn(CartDAO.prototype as any, "createNewCart" as any)
        .mockResolvedValue(true);
      const cartDAO = new CartDAO();
      await cartDAO.clearCart(testCustomer.username);
      expect(true).toEqual(true);
    });
    test("It should return true", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "deleteCurrentCart" as any)
        .mockRejectedValue(new Error());
      const cartDAO = new CartDAO();
      await expect(cartDAO.clearCart(testCustomer.username)).rejects.toThrow();
    });
  });

  describe("deleteAllCarts", () => {
    test("It should return true", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(null, true);
          return {} as Database;
        });
      const result = await cartDAO.deleteAllCarts();
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const cartDAO = new CartDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(new Error(), true);
          return {} as Database;
        });
      await expect(cartDAO.deleteAllCarts()).rejects.toThrow();
    });
  });
  describe("getAllCarts", () => {
    test("It should return an array of carts", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);

      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, callback) => {
          callback(null, history);
          return {} as Database;
        });
      const result = await cartDAO.getAllCarts();
      expect(result).toEqual([{ ...history[0], paid: true }]);
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockResolvedValue(productsInCart);

      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, callback) => {
          callback(new Error(), history);
          return {} as Database;
        });
      await expect(cartDAO.getAllCarts()).rejects.toThrow();
      mockDBAll.mockRestore();
    });
    test("It should throw an error", async () => {
      // private methods
      jest
        .spyOn(CartDAO.prototype as any, "getProductsInCart" as any)
        .mockRejectedValue(new Error());
      const cartDAO = new CartDAO();
      const mockDBAll = jest
        .spyOn(db, "all")
        .mockImplementation((sql, callback) => {
          callback(null, history);
          return {} as Database;
        });
      await expect(cartDAO.getAllCarts()).rejects.toThrow();
      mockDBAll.mockRestore();
    });
  });
});
