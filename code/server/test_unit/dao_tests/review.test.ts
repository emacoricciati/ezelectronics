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
  import ReviewDAO from "../../src/dao/reviewDAO";
  import { Category } from "../../src/components/product";
  import { User, Role } from "../../src/components/user";
import { ProductReview } from "../../src/components/review";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";
  
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
  const review = {
    model: product.model,
    user: "testCustomer",
    score: 5,
    date: "2024-05-12",
    comment: "test",
};
const reviews = [review];

  
  describe("reviewDAO", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });
  
    afterEach(() => {
      jest.restoreAllMocks();
    });
    //private method
    describe("getReviewForAProduct", () => {
        test("It should resolve with a product review", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBGet = jest
            .spyOn(db, "get")
            .mockImplementation((sql, params, callback) => {
              callback(null, review);
              return {} as Database;
            });
          await (reviewDAO as any).getUserReviewForAProduct(product.model, testCustomer.username);
          mockDBGet.mockRestore();
        });
        test("It should throw an error if the review does not exist", async () => {
            const reviewDAO = new ReviewDAO();
            const mockDBGet = jest
              .spyOn(db, "get")
              .mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
              });
              await expect(
                (reviewDAO as any).getUserReviewForAProduct(product.model, testCustomer.username)
              ).rejects.toThrow(NoReviewProductError);
            mockDBGet.mockRestore();
          });
          test("It should throw an error", async () => {
            const reviewDAO = new ReviewDAO();
            const mockDBGet = jest
              .spyOn(db, "get")
              .mockImplementation((sql, params, callback) => {
                callback(new Error);
                return {} as Database;
              });
              await expect(
                (reviewDAO as any).getUserReviewForAProduct(product.model, testCustomer.username)
              ).rejects.toThrow();
            mockDBGet.mockRestore();
          });
      });
  
    describe("createReview", () => {
      test("It should resolve", async () => {
        const date = "2024-05-15"
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest
          .spyOn(db, "run")
          .mockImplementation((sql, params, callback) => {
            callback(null);
            return {} as Database;
          });
        await reviewDAO.createReview(product.model, testCustomer.username, 5,"",date );
        mockDBRun.mockRestore();
      });
      test("It should throw an error, review already exists", async () => {
        const date = "2024-05-15"
        const reviewDAO = new ReviewDAO();
        const mockDBRun = jest
          .spyOn(db, "run")
          .mockImplementation((sql, params, callback) => {
            callback(new Error("UNIQUE constraint failed: reviews.user, reviews.model"));
            return {} as Database;
          });
          expect(reviewDAO.createReview(product.model, testCustomer.username, 5,"",date)).rejects.toThrow(ExistingReviewError);
        mockDBRun.mockRestore();
      });
    });
    describe("getReviewsForAProduct", () => {
        test("It should resolve an array of product reviews", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBAll = jest
            .spyOn(db, "all")
            .mockImplementation((sql, params, callback) => {
              callback(null, reviews);
              return {} as Database;
            });
          const result = await reviewDAO.getReviewsForAProduct(product.model);
          expect(result).toEqual(reviews);
          mockDBAll.mockRestore();
        });
        test("It should throw an error", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBAll = jest
            .spyOn(db, "all")
            .mockImplementation((sql, params, callback) => {
              callback(new Error, null);
              return {} as Database;
            });
            expect(reviewDAO.getReviewsForAProduct(product.model)).rejects.toThrow();
          mockDBAll.mockRestore();
        });
      });
      describe("deleteReviews", () => {
        test("It should resolve", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBRun = jest
            .spyOn(db, "run")
            .mockImplementation((sql, params, callback) => {
              callback(null, reviews);
              return {} as Database;
            });
          await reviewDAO.deleteReviews(product.model, testCustomer.username);
          mockDBRun.mockRestore();
        });
        test("It should throw an error", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBRun = jest
            .spyOn(db, "run")
            .mockImplementation((sql, params, callback) => {
              callback(new Error, null);
              return {} as Database;
            });
            expect(reviewDAO.deleteReviews(product.model, testCustomer.username)).rejects.toThrow();
          mockDBRun.mockRestore();
        });
      });
      describe("deleteUserReview", () => {
        test("It should resolve", async () => {
            jest.spyOn(ReviewDAO.prototype, "deleteReviews").mockResolvedValue();
            // private methods
            jest
              .spyOn(ReviewDAO.prototype as any, "getUserReviewForAProduct" as any)
              .mockResolvedValue(review);
          const reviewDAO = new ReviewDAO();
          await reviewDAO.deleteUserReview(product.model, testCustomer.username);
        });
        test("It should throw an error", async () => {
          jest.spyOn(ReviewDAO.prototype, "deleteReviews").mockResolvedValue();
          // private methods
          jest
            .spyOn(ReviewDAO.prototype as any, "getUserReviewForAProduct" as any)
            .mockRejectedValue(new Error);
        const reviewDAO = new ReviewDAO();
        expect(reviewDAO.deleteUserReview(product.model, testCustomer.username)).rejects.toThrow();
      });
      });
      describe("deleteAllReviews", () => {
        test("It should resolve", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBRun = jest
            .spyOn(db, "run")
            .mockImplementation((sql, callback) => {
              callback(null);
              return {} as Database;
            });
          await reviewDAO.deleteAllReviews();
          mockDBRun.mockRestore();
        });
        test("It should throw an error", async () => {
          const reviewDAO = new ReviewDAO();
          const mockDBRun = jest
            .spyOn(db, "run")
            .mockImplementation((sql, callback) => {
              callback(new Error);
              return {} as Database;
            });
            expect(reviewDAO.deleteAllReviews()).rejects.toThrow();
          mockDBRun.mockRestore();
        });
      });
  });
  