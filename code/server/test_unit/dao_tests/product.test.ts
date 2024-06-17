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
import ProductDAO from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";
import { ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";

jest.mock("crypto");
jest.mock("../../src/db/db.ts");

const product = {
  model: "test",
  category: Category.SMARTPHONE,
  quantity: 10,
  details: "test",
  sellingPrice: 999,
  arrivalDate: "2024-05-12",
};
const products = [product];

describe("productDAO", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createProduct", () => {
    test("It should resolve", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      await productDAO.createProduct(
        product.model,
        product.category,
        product.quantity,
        product.details,
        product.sellingPrice,
        product.arrivalDate
      );
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error("UNIQUE constraint failed: products.model"));
          return {} as Database;
        });
      await expect(
        productDAO.createProduct(
          product.model,
          product.category,
          product.quantity,
          product.details,
          product.sellingPrice,
          product.arrivalDate
        )
      ).rejects.toThrow(ProductAlreadyExistsError);
      mockDBRun.mockRestore();
    });
  });
  describe("updateProduct", () => {
    test("It should resolve", async () => {
      const productDAO = new ProductDAO();

      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, { quantity: product.quantity + 1 });
          return {} as Database;
        });

      const result = await productDAO.updateProduct(
        product.model,
        product.quantity + 1,
        "add"
      );
      expect(result).toBe(product.quantity + 1);
      mockDBRun.mockRestore();
      mockDBGet.mockRestore();
    });
    test("It should throw an error, product not found", async () => {
      const productDAO = new ProductDAO();

      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      await expect(
        productDAO.updateProduct(product.model, product.quantity + 1, "add")
      ).rejects.toThrow(ProductNotFoundError);
      mockDBRun.mockRestore();
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();

      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      await expect(
        productDAO.updateProduct(product.model, product.quantity + 1, "add")
      ).rejects.toThrow();
      mockDBRun.mockRestore();
      mockDBGet.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();

      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error());
          return {} as Database;
        });
      const mockDBGet = jest
        .spyOn(db, "get")
        .mockImplementation((sql, params, callback) => {
          callback(null, null);
          return {} as Database;
        });
      await expect(
        productDAO.updateProduct(product.model, product.quantity + 1, "add")
      ).rejects.toThrow();
      mockDBRun.mockRestore();
      mockDBGet.mockRestore();
    });
  });
  describe("getProducts", () => {
    test("It should resolve an array of products", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, products);
          return {} as Database;
        });
      const result = await productDAO.getProducts("all");
      expect(result).toEqual(products);
      mockDBRun.mockRestore();
    });
    test("It should throw an error, product not found", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, []);
          return {} as Database;
        });
      await expect(productDAO.getProducts("model")).rejects.toThrow(
        ProductNotFoundError
      );
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), null);
          return {} as Database;
        });
      await expect(productDAO.getProducts("all")).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
  describe("getAvailableProducts", () => {
    test("It should resolve an array of available products", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, products);
          return {} as Database;
        });
      const result = await productDAO.getAvailableProducts("all");
      expect(result).toEqual(products);
      mockDBRun.mockRestore();
    });
    test("It should throw an error, product not found", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(null, []);
          return {} as Database;
        });
      await expect(productDAO.getAvailableProducts("model")).rejects.toThrow(
        ProductNotFoundError
      );
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "all")
        .mockImplementation((sql, params, callback) => {
          callback(new Error(), products);
          return {} as Database;
        });
      await expect(productDAO.getAvailableProducts("all")).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
  describe("deleteProduct", () => {
    test("It should return true", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(null);
          return {} as Database;
        });
      const result = await productDAO.deleteProduct(product.model);
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, params, callback) => {
          callback(new Error());
          return {} as Database;
        });
      await expect(productDAO.deleteProduct(product.model)).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
  describe("deleteAll", () => {
    test("It should return true", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(null);
          return {} as Database;
        });
      const result = await productDAO.deleteAll();
      expect(result).toEqual(true);
      mockDBRun.mockRestore();
    });
    test("It should throw an error", async () => {
      const productDAO = new ProductDAO();
      const mockDBRun = jest
        .spyOn(db, "run")
        .mockImplementation((sql, callback) => {
          callback(new Error());
          return {} as Database;
        });
      await expect(productDAO.deleteAll()).rejects.toThrow();
      mockDBRun.mockRestore();
    });
  });
});
