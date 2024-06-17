import {
  test,
  expect,
  jest,
  describe,
  afterEach,
  beforeEach,
} from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import ProductDao from "../../src/dao/productDAO";
import { DateError } from "../../src/utilities";
import { Category } from "../../src/components/product";
import {
  EmptyProductStockError,
  LowProductStockError,
} from "../../src/errors/productError";

jest.mock("../../src/dao/userDAO");

const product = {
  model: "test",
  category: Category.SMARTPHONE,
  quantity: 10,
  details: "test",
  sellingPrice: 999,
  arrivalDate: "2024-05-12",
};
const errorDate = "2100/12/12";
const products = [product];

describe("Product controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("registerProduct", () => {
    test("It should return", async () => {
      jest.spyOn(ProductDao.prototype, "createProduct").mockResolvedValue();
      const controller = new ProductController();
      await controller.registerProducts(
        product.model,
        product.category,
        product.quantity,
        product.details,
        product.sellingPrice,
        product.arrivalDate
      );

      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(ProductDao.prototype.createProduct).toHaveBeenCalledTimes(1);
      expect(ProductDao.prototype.createProduct).toHaveBeenCalledWith(
        product.model,
        product.category,
        product.quantity,
        product.details,
        product.sellingPrice,
        product.arrivalDate
      );
    });
    test("It should return", async () => {
      jest.spyOn(ProductDao.prototype, "createProduct").mockResolvedValue();
      const controller = new ProductController();
      await controller.registerProducts(
        product.model,
        product.category,
        product.quantity,
        product.details,
        product.sellingPrice,
        null
      );
      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(ProductDao.prototype.createProduct).toHaveBeenCalledTimes(1);
      expect(ProductDao.prototype.createProduct).toHaveBeenCalledWith(
        product.model,
        product.category,
        product.quantity,
        product.details,
        product.sellingPrice,
        new Date().toISOString().slice(0, 10)
      );
    });
    test("It should throw an error if the arrivalDate is after the current date", async () => {
      jest.spyOn(ProductDao.prototype, "createProduct").mockResolvedValue();
      const controller = new ProductController();
      await expect(
        controller.registerProducts(
          product.model,
          product.category,
          product.quantity,
          product.details,
          product.sellingPrice,
          errorDate
        )
      ).rejects.toThrow(DateError);
      //Check if the createUser method of the DAO has been called once with the correct parameters
      expect(ProductDao.prototype.createProduct).not.toHaveBeenCalled();
    });
  });
  describe("changeProductQuantity", () => {
    test("it should return the new quantity available of the product", async () => {
      const newQuantity = 5;
      const changeDate = "2024-05-15";
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      const response = await controller.changeProductQuantity(
        product.model,
        newQuantity,
        changeDate
      );
      expect(ProductDao.prototype.updateProduct).toHaveBeenCalledTimes(1);
      expect(response).toBe(newQuantity);
    });
    test("it should return the new quantity available of the product", async () => {
      const newQuantity = 5;
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      const response = await controller.changeProductQuantity(
        product.model,
        newQuantity,
        null
      );
      expect(ProductDao.prototype.updateProduct).toHaveBeenCalledTimes(1);
      expect(response).toBe(newQuantity);
    });
    test("It should throw an error if the changeDate is after the current date", async () => {
      const newQuantity = 5;
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      await expect(
        controller.changeProductQuantity(product.model, newQuantity, errorDate)
      ).rejects.toThrow(DateError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
    test("It should throw an error if the changeDate is before the arrival date", async () => {
      const changeDate = "2024-05-10";
      const newQuantity = 5;
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue([product]);
      const controller = new ProductController();
      await expect(
        controller.changeProductQuantity(product.model, newQuantity, changeDate)
      ).rejects.toThrow(DateError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
  });
  describe("sellProduct", () => {
    test("it should return the new quantity available of the product", async () => {
      const newQuantity = 5;
      const sellingDate = "2024-05-15";
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      const response = await controller.sellProduct(
        product.model,
        newQuantity + 1,
        sellingDate
      );
      expect(ProductDao.prototype.updateProduct).toHaveBeenCalledTimes(1);
      expect(response).toBe(newQuantity);
    });
    test("it should return the new quantity available of the product", async () => {
      const newQuantity = 5;
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      const response = await controller.sellProduct(
        product.model,
        newQuantity + 1,
        null
      );
      expect(ProductDao.prototype.updateProduct).toHaveBeenCalledTimes(1);
      expect(response).toBe(newQuantity);
    });
    test("it should throw an error if the selling date is after the current date", async () => {
      const newQuantity = 5;
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      await expect(
        controller.sellProduct(product.model, newQuantity + 1, errorDate)
      ).rejects.toThrow(DateError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
    test("it should throw an error if the selling date is before the arrival date", async () => {
      const newQuantity = 5;
      const sellingDate = "2024-05-10";
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([product]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      await expect(
        controller.sellProduct(product.model, newQuantity + 1, sellingDate)
      ).rejects.toThrow(DateError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
    test("it should throw an error if the product is sold out", async () => {
      const newQuantity = 5;
      const sellingDate = "2024-05-15";
      const soldProduct = {
        ...product,
        quantity: 0,
      };
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([soldProduct]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      await expect(
        controller.sellProduct(product.model, newQuantity + 1, sellingDate)
      ).rejects.toThrow(EmptyProductStockError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
    test("it should throw an error if the requested quantity for the product is not available", async () => {
      const newQuantity = 5;
      const sellingDate = "2024-05-15";
      const soldProduct = {
        ...product,
        quantity: 1,
      };
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce([soldProduct]);
      jest
        .spyOn(ProductDao.prototype, "updateProduct")
        .mockResolvedValueOnce(newQuantity);
      const controller = new ProductController();
      await expect(
        controller.sellProduct(product.model, newQuantity + 1, sellingDate)
      ).rejects.toThrow(LowProductStockError);
      expect(ProductDao.prototype.updateProduct).not.toHaveBeenCalled();
    });
  });
  describe("getProducts", () => {
    test("it should return an array of products", async () => {
      const grouping = "category";
      const category = Category.SMARTPHONE;
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getProducts(grouping, category, null);
      expect(ProductDao.prototype.getProducts).toHaveBeenCalledTimes(1);
      expect(response).toBe(products);
    });
    test("it should return an array of products", async () => {
      const grouping = "model";
      const model = "test";
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getProducts(grouping, null, model);
      expect(ProductDao.prototype.getProducts).toHaveBeenCalledTimes(1);
      expect(response).toBe(products);
    });
    test("it should return an array of products", async () => {
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getProducts(null, null, null);
      expect(ProductDao.prototype.getProducts).toHaveBeenCalledTimes(1);
      expect(response).toBe(products);
    });
  });
  describe("getAvailableProducts", () => {
    test("it should return an array of available products", async () => {
      const grouping = "category";
      const category = Category.SMARTPHONE;
      jest
        .spyOn(ProductDao.prototype, "getAvailableProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getAvailableProducts(
        grouping,
        category,
        null
      );
      expect(ProductDao.prototype.getAvailableProducts).toHaveBeenCalledTimes(
        1
      );
      expect(response).toBe(products);
    });
    test("it should return an array of available products", async () => {
      const grouping = "model";
      const model = "test";
      jest
        .spyOn(ProductDao.prototype, "getAvailableProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getAvailableProducts(
        grouping,
        null,
        model
      );
      expect(ProductDao.prototype.getAvailableProducts).toHaveBeenCalledTimes(
        1
      );
      expect(response).toBe(products);
    });
    test("it should return an array of products", async () => {
      jest
        .spyOn(ProductDao.prototype, "getAvailableProducts")
        .mockResolvedValueOnce(products);
      const controller = new ProductController();
      const response = await controller.getAvailableProducts(null, null, null);
      expect(ProductDao.prototype.getAvailableProducts).toHaveBeenCalledTimes(
        1
      );
      expect(response).toBe(products);
    });
  });
  describe("deleteAllProducts", () => {
    test("it should return true", async () => {
      jest.spyOn(ProductDao.prototype, "deleteAll").mockResolvedValueOnce(true);
      const controller = new ProductController();
      const response = await controller.deleteAllProducts();
      expect(ProductDao.prototype.deleteAll).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
  });
  describe("deleteProduct", () => {
    test("it should return true", async () => {
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValueOnce(products);
      jest
        .spyOn(ProductDao.prototype, "deleteProduct")
        .mockResolvedValueOnce(true);
      const controller = new ProductController();
      const response = await controller.deleteProduct(product.model);
      expect(ProductDao.prototype.deleteProduct).toHaveBeenCalledTimes(1);
      expect(response).toBe(true);
    });
  });
});
