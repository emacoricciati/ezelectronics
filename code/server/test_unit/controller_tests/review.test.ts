import {
  test,
  expect,
  jest,
  describe,
  afterEach,
  beforeEach,
} from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import ProductDao from "../../src/dao/productDAO";
import { Category } from "../../src/components/product";
import { Role, User } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductInCart } from "../../src/components/cart";
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
const review = {
    model: product.model,
    user: "testCustomer",
    score: 5,
    date: "2024-05-12",
    comment: "test",
};
const reviews = [review];
const products = [product];

describe("Review controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addReview", () => {
    test("It should return", async () => {
      jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue(products);
        jest
        .spyOn(ReviewDAO.prototype, "createReview")
        .mockResolvedValue();
      const controller = new ReviewController();
      await controller.addReview(product.model, testCustomer, 5,"");
      expect(ReviewDAO.prototype.createReview).toHaveBeenCalledTimes(1);
    });
  });
  describe("getProductReviews", () => {
    test("It should return an array of reviews", async () => {
        jest
        .spyOn(ReviewDAO.prototype, "getReviewsForAProduct")
        .mockResolvedValue(reviews);
      const controller = new ReviewController();
      const response = await controller.getProductReviews(product.model);
      expect(ReviewDAO.prototype.getReviewsForAProduct).toHaveBeenCalledTimes(1);
      expect(response).toEqual(reviews);
    });
  });
  describe("deleteReview", () => {
    test("It should return", async () => {
        jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue(products);
        jest
        .spyOn(ReviewDAO.prototype, "deleteUserReview")
        .mockResolvedValue();
      const controller = new ReviewController();
      await controller.deleteReview(product.model, testCustomer);
      expect(ReviewDAO.prototype.deleteUserReview).toHaveBeenCalledTimes(1);
    });
  });
  describe("deleteReviewsOfProduct", () => {
    test("It should return", async () => {
        jest
        .spyOn(ProductDao.prototype, "getProducts")
        .mockResolvedValue(products);
        jest
        .spyOn(ReviewDAO.prototype, "deleteReviews")
        .mockResolvedValue();
      const controller = new ReviewController();
      await controller.deleteReviewsOfProduct(product.model);
      expect(ReviewDAO.prototype.deleteReviews).toHaveBeenCalledTimes(1);
    });
  });
  describe("deleteAllReviews", () => {
    test("It should return", async () => {
        jest
        .spyOn(ReviewDAO.prototype, "deleteAllReviews")
        .mockResolvedValue();
      const controller = new ReviewController();
      await controller.deleteAllReviews();
      expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    });
  });
});
