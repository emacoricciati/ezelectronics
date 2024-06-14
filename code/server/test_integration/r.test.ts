import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";
import { Category } from "../src/components/product";

const routePath = "/ezelectronics"; //Base route path for the API

const product = {
  model: "test",
  category: Category.SMARTPHONE,
  quantity: 10,
  details: "",
  sellingPrice: 999,
  arrivalDate: "2024-05-12",
};

const review = {
  score: 5,
  comment: "",
};

//Default user information. We use them to create users and evaluate the returned values
const customer = {
  username: "customer",
  name: "customer",
  surname: "customer",
  password: "customer",
  role: "Customer",
};
const customer2 = {
  username: "customer2",
  name: "customer",
  surname: "customer",
  password: "customer",
  role: "Customer",
};
const admin = {
  username: "admin",
  name: "admin",
  surname: "admin",
  password: "admin",
  role: "Admin",
};
const manager = {
  username: "manager",
  name: "manager",
  surname: "manager",
  password: "manager",
  role: "Manager",
};
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string;
let adminCookie: string;
let managerCookie: string;

const postUser = async (userInfo: any) => {
  await request(app).post(`${routePath}/users`).send(userInfo).expect(200);
};

const login = async (userInfo: any) => {
  return new Promise<string>((resolve, reject) => {
    request(app)
      .post(`${routePath}/sessions`)
      .send(userInfo)
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err);
        }
        resolve(res.header["set-cookie"][0]);
      });
  });
};

const registerProduct = async (product: any) => {
  adminCookie = await login(admin);
      await request(app)
      .post(`${routePath}/products`)
      .send(product)
      .set("Cookie", adminCookie)
      .expect(200);
}

describe("Reviews routes integration tests", () => {
  beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    await postUser(manager);
    await postUser(customer);
    await postUser(customer2);
    await registerProduct(product);
  });
  afterAll(async () => {
    await cleanup();
  });
  describe("POST /reviews/:model", () => {
    test("It should return a 200 success code and it creates a new review by a single customer to a product", async () => {
      // add a review
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(200);
    });
    test("It should return a 422 error code if the data is not valid", async () => {
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send({
          score: 0,
          comment: "test",
        })
        .set("Cookie", customerCookie)
        .expect(422);
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send({
          score: 4,
          comment: null,
        })
        .set("Cookie", customerCookie)
        .expect(422);
    });
    test("It should return a 401 error code if the user is not a customer", async () => {
      adminCookie = await login(admin);
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", adminCookie)
        .expect(401);
      managerCookie = await login(manager);
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", managerCookie)
        .expect(401);
    });
    test("It should return a 404 error code if the product does not exist", async () => {
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/reviews/wrong`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 409 error code if the review already exist by the user", async () => {
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(409);
    });
  });
  describe("GET /reviews/:model", () => {
    test("It should return a 200 success code and it returns all reviews for a specific product", async () => {
      const response = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(200);
        const reviews = response.body;
        expect(reviews).toHaveLength(1);
    });
    test("It should return a 401 if the user is not logged in", async () => {
      await request(app)
        .get(`${routePath}/reviews/test`)
        .expect(401);
    });
  });
  describe("DELETE /reviews/:model", () => {
    test("It should return a 200 success code and it deletes the review made by the current user for a specific product", async () => {
      await request(app)
        .delete(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(200);
        // get reviews
        const response = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(200);
        const reviews = response.body;
        expect(reviews).toHaveLength(0);
    });
    test("It should return a 401 error code if the user is not a customer", async () => {
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/reviews/test`)
        .set("Cookie", adminCookie)
        .expect(401);
      managerCookie = await login(manager);
      await request(app)
        .delete(`${routePath}/reviews/test`)
        .set("Cookie", managerCookie)
        .expect(401);
    });
    test("It should return a 404 error code if the product does not exist in the db", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/reviews/wrong`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 404 error code if the user does not have a review for the product identified by the model", async () => {
      await request(app)
        .delete(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
  });
  describe("DELETE /reviews/:model/all", () => {
    test("It should return a 200 success code and it deletes all the reviews for a product", async () => {
      // add a review
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(200);
        customerCookie = await login(customer2);
        // add a review
        await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(200);

      // get reviews
      const res = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(200);
        let reviews = res.body;
        expect(reviews).toHaveLength(2);
        // delete all reviews
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/reviews/test/all`)
        .set("Cookie", adminCookie)
        .expect(200);
        // get reviews
        const response = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", adminCookie)
        .expect(200);
        reviews = response.body;
        expect(reviews).toHaveLength(0);
    });
    test("It should return a 401 if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/reviews/test/all`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return a 404 error code if the model does not exist", async () => {
      managerCookie = await login(manager);
      await request(app)
        .delete(`${routePath}/reviews/wrong/all`)
        .set("Cookie", managerCookie)
        .expect(404);
    });
  });
  describe("DELETE /reviews", () => {
    test("It should return a 200 success code and it deletes all the reviews of all existing products", async () => {
      customerCookie = await login(customer);
      // add a review
      await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(200);
        customerCookie = await login(customer2);
        // add a review
        await request(app)
        .post(`${routePath}/reviews/test`)
        .send(review)
        .set("Cookie", customerCookie)
        .expect(200);

      // get reviews
      const res = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", customerCookie)
        .expect(200);
        let reviews = res.body;
        expect(reviews).toHaveLength(2);
        // delete all reviews
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/reviews`)
        .set("Cookie", adminCookie)
        .expect(200);
        // get reviews
        const response = await request(app)
        .get(`${routePath}/reviews/test`)
        .set("Cookie", adminCookie)
        .expect(200);
        reviews = response.body;
        expect(reviews).toHaveLength(0);
    });

    test("It should return a 401 if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/reviews`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
  })
});
