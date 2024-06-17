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
const product2 = {
  model: "test1",
  category: Category.SMARTPHONE,
  quantity: 10,
  details: "test",
  sellingPrice: 999,
  arrivalDate: "2024-05-12",
};

//Default user information. We use them to create users and evaluate the returned values
const customer = {
  username: "customer",
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

describe("Product routes integration tests", () => {
  beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    await postUser(manager);
    await postUser(customer);
    adminCookie = await login(admin);
  });
  afterAll(async () => {
    await cleanup();
  });
  describe("POST /products", () => {
    test("It should return a 200 success code and create a new product", async () => {
      await request(app)
        .post(`${routePath}/products`)
        .send(product)
        .set("Cookie", adminCookie)
        .expect(200);
    });
    test("It should return a 200 success code and create a new product", async () => {
      managerCookie = await login(manager);
      await request(app)
        .post(`${routePath}/products`)
        .send(product2)
        .set("Cookie", managerCookie)
        .expect(200);
    });
    test("It should return a 422 if data are not valid", async () => {
      await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "",
          category: "test",
          quantity: 10,
          details: "test",
          sellingPrice: 999,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", managerCookie)
        .expect(422);
        await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test",
          category: "test",
          quantity: 10,
          details: "test",
          sellingPrice: 999,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", managerCookie)
        .expect(422);
        await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test",
          category: "test",
          quantity: 0,
          details: "test",
          sellingPrice: 999,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", managerCookie)
        .expect(422);
        await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test",
          category: "test",
          quantity: 10,
          details: "test",
          sellingPrice: 0,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", managerCookie)
        .expect(422);
        await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test",
          category: "test",
          quantity: 10,
          details: "test",
          sellingPrice: 0,
          arrivalDate: "20-05-2024",
        })
        .set("Cookie", managerCookie)
        .expect(422);
    });
    test("It should return a 401 if user is not admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/products`)
        .send(product2)
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return a 409 if the model already exists", async () => {
      managerCookie = await login(manager);
      await request(app)
        .post(`${routePath}/products`)
        .send(product2)
        .set("Cookie", managerCookie)
        .expect(409);
    });
    test("It should return a 400 if the arrival date is after the current date", async () => {
      await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test3",
          category: Category.SMARTPHONE,
          quantity: 10,
          details: "test",
          sellingPrice: 999,
          arrivalDate: "2100-05-12",
        })
        .set("Cookie", managerCookie)
        .expect(400);
    });
  });
  describe("PATCH /products/:model", () => {
    test("It should return a 200 success code and create a new product", async () => {
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 20,
          changeDate: "2024-05-15",
        })
        .set("Cookie", adminCookie)
        .expect(200);
    });
    test("It should return a 422 if data is not valid", async () => {
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: -1,
          changeDate: "2024-05-15",
        })
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 10,
          changeDate: "20-05-2024",
        })
        .set("Cookie", adminCookie)
        .expect(422);
    });
    test("It should return a 401 if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 20,
          changeDate: "2024-05-15",
        })
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return 404 if model does not exist in the db", async () => {
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test5`)
        .send({
          quantity: 20,
          changeDate: "2024-05-15",
        })
        .set("Cookie", adminCookie)
        .expect(404);
    });
    test("It should return 400 if the change date is after the current date", async () => {
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 20,
          changeDate: "2100-05-15",
        })
        .set("Cookie", adminCookie)
        .expect(400);
    });
    test("It should return 400 if the change date is before the arrival date", async () => {
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 20,
          changeDate: "2019-05-15",
        })
        .set("Cookie", adminCookie)
        .expect(400);
    });
  });
  describe("PATCH /products/:model/sell", () => {
    test("It should return a 200 success code and the quantity is decreased", async () => {
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 5,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(200);
    });
    test("It should return a 422 error code if data is not valid", async () => {
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 5,
          sellingDate: "20-05-2024",
        })
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: -1,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(422);
    });
    test("It should return a 401 if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 5,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return a 404 if the product does not exist", async () => {
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test5/sell`)
        .send({
          quantity: 5,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(404);
    });
    test("It should return a 400 error code if the selling date is after the current date", async () => {
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 5,
          sellingDate: "2100-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(400);
    });
    test("It should return a 400 error code if the selling date is before the arrival date", async () => {
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 5,
          sellingDate: "2019-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(400);
    });
    test("It should return a 409 error code if the model has quantity 0", async () => {
      await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 25,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(200);
        await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 1,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(409);
    });
    test("It should return a 409 error code if the quantity is not available", async () => {
      await request(app)
        .patch(`${routePath}/products/test`)
        .send({
          quantity: 25,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(200);
        await request(app)
        .patch(`${routePath}/products/test/sell`)
        .send({
          quantity: 30,
          sellingDate: "2024-05-20",
        })
        .set("Cookie", adminCookie)
        .expect(409);
    });
  });
  describe("GET /products", () => {
    test("It should return a 200 success code and an array of products, no grouping", async () => {
      // add a product with quantity 1
      await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test2",
          category: Category.SMARTPHONE,
          quantity: 1,
          details: "test",
          sellingPrice: 999,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", adminCookie)
        .expect(200);
        // sell the product
        await request(app).patch(`${routePath}/products/test2/sell`).send({
          quantity: 1,
          sellingDate: "2024-05-20",
        }).set("Cookie", adminCookie).expect(200);
      const response = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .expect(200);
        const prod1 = response.body.find((p: any) => p.model === product.model);
        const prod2 = response.body.find((p: any) => p.model === product2.model);
        const prod3 = response.body.find((p: any) => p.model === "test2");
        expect(prod1).toBeDefined();
        expect(prod2).toBeDefined();
        expect(prod1.category).toBe(product.category);
        expect(prod1.details).toBe(product.details);
        expect(prod1.sellingPrice).toBe(product.sellingPrice);
        expect(prod1.arrivalDate).toBe(product.arrivalDate);
        expect(prod2.category).toBe(product2.category);
        expect(prod2.details).toBe(product2.details);
        expect(prod2.sellingPrice).toBe(product2.sellingPrice);
        expect(prod2.arrivalDate).toBe(product2.arrivalDate);
        expect(prod3).toBeDefined();
        expect(prod3.quantity).toBe(0); 
    });
    test("It should return a 200 success code and an array of products, grouping category", async () => {
      const response = await request(app)
        .get(`${routePath}/products?grouping=category&category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(200);
        const prod1 = response.body.find((p: any) => p.model === product.model);
        expect(prod1).toBeDefined();
        expect(prod1.category).toBe(product.category);
        expect(prod1.details).toBe(product.details);
        expect(prod1.sellingPrice).toBe(product.sellingPrice);
        expect(prod1.arrivalDate).toBe(product.arrivalDate);
        const response1 = await request(app)
        .get(`${routePath}/products?grouping=category&category=Appliance`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response1.body.length).toBe(0);
        const response2 = await request(app)
        .get(`${routePath}/products?grouping=category&category=Laptop`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response2.body.length).toBe(0);
    });
    test("It should return a 200 success code and an array of products, grouping model", async () => {
      const response = await request(app)
        .get(`${routePath}/products?grouping=model&model=test`)
        .set("Cookie", adminCookie)
        .expect(200);
        const prod = response.body.find((p: any) => p.model === product.model);
        expect(prod).toBeDefined();
        expect(prod.category).toBe(product.category);
        expect(prod.details).toBe(product.details);
        expect(prod.sellingPrice).toBe(product.sellingPrice);
        expect(prod.arrivalDate).toBe(product.arrivalDate);
    });
    test("It should return a 422 error code if the data is not valid", async () => {
      await request(app)
        .get(`${routePath}/products?grouping=category`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products?grouping=model`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products?grouping=model&category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products?grouping=category&model=test`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products?model=test`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products?category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(422);
    });
    test("It should return a 404 error code if the model does not represent a product in the db", async () => {
      await request(app)
        .get(`${routePath}/products?grouping=model&model=test5`)
        .set("Cookie", adminCookie)
        .expect(404);
    });
  });
  describe("GET /products/available", () => {
    test("It should return a 200 success code and an array of products, no grouping", async () => {
      const response = await request(app)
        .get(`${routePath}/products/available`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response.body.length).toBe(2);
        const prod1 = response.body.find((p: any) => p.model === product.model);
        const prod2 = response.body.find((p: any) => p.model === product2.model);
        expect(prod1).toBeDefined();
        expect(prod2).toBeDefined();
        expect(prod1.category).toBe(product.category);
        expect(prod1.quantity).toBeGreaterThan(0);
        expect(prod1.details).toBe(product.details);
        expect(prod1.sellingPrice).toBe(product.sellingPrice);
        expect(prod1.arrivalDate).toBe(product.arrivalDate);
        expect(prod2.category).toBe(product2.category);
        expect(prod2.details).toBe(product2.details);
        expect(prod2.quantity).toBeGreaterThan(0);
        expect(prod2.sellingPrice).toBe(product2.sellingPrice);
        expect(prod2.arrivalDate).toBe(product2.arrivalDate);
    });
    test("It should return a 200 success code and an array of products, grouping category", async () => {
      const response = await request(app)
        .get(`${routePath}/products/available?grouping=category&category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response.body.length).toBe(2);
        const prod1 = response.body.find((p: any) => p.model === product.model);
        expect(prod1).toBeDefined();
        expect(prod1.quantity).toBeGreaterThan(0);
        expect(prod1.category).toBe(product.category);
        expect(prod1.details).toBe(product.details);
        expect(prod1.sellingPrice).toBe(product.sellingPrice);
        expect(prod1.arrivalDate).toBe(product.arrivalDate);
        const response1 = await request(app)
        .get(`${routePath}/products/available?grouping=category&category=Appliance`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response1.body.length).toBe(0);
        const response2 = await request(app)
        .get(`${routePath}/products/available?grouping=category&category=Laptop`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response2.body.length).toBe(0);
    });
    test("It should return a 200 success code and an array of products, grouping model", async () => {
      const response = await request(app)
        .get(`${routePath}/products/available?grouping=model&model=test`)
        .set("Cookie", adminCookie)
        .expect(200);
        const prod = response.body.find((p: any) => p.model === product.model);
        expect(prod).toBeDefined();
        expect(prod.category).toBe(product.category);
        expect(prod.details).toBe(product.details);
        expect(prod.sellingPrice).toBe(product.sellingPrice);
        expect(prod.arrivalDate).toBe(product.arrivalDate);
    });
    test("It should return a 422 error code if the data is not valid", async () => {
      await request(app)
        .get(`${routePath}/products/available?grouping=category`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products/available?grouping=model`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products/available?grouping=model&category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products/available?grouping=category&model=test`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products/available?model=test`)
        .set("Cookie", adminCookie)
        .expect(422);
        await request(app)
        .get(`${routePath}/products/available?category=Smartphone`)
        .set("Cookie", adminCookie)
        .expect(422);
    });
    test("It should return a 404 error code if the model does not represent a product in the db", async () => {
      await request(app)
        .get(`${routePath}/products/available?grouping=model&model=test5`)
        .set("Cookie", adminCookie)
        .expect(404);
    });
  });
  describe("DELETE /products/:model", () => {
    test("It should return a 200 success code and remove the product", async () => {
      const response = await request(app)
        .delete(`${routePath}/products/test2`)
        .set("Cookie", adminCookie)
        .expect(200);
      // get products
      const response1 = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .expect(200);
        const prod1 = response1.body.find((p: any) => p.model === product.model);
        const prod2 = response1.body.find((p: any) => p.model === product2.model);
        const prod3 = response1.body.find((p: any) => p.model === "test2");
        expect(prod1).toBeDefined();
        expect(prod2).toBeDefined();
        expect(prod3).toBeUndefined();
    });
    test("It should return a 401 if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/products/test2`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return a 404 if the model does not exist", async () => {
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/products/test2`)
        .set("Cookie", adminCookie)
        .expect(404);
    });
  });
  describe("DELETE /products", () => {
    test("It should return a 200 success code and remove all the products", async () => {
      await request(app)
        .delete(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .expect(200);
      // get products
      const response1 = await request(app)
        .get(`${routePath}/products`)
        .set("Cookie", adminCookie)
        .expect(200);
        expect(response1.body.length).toBe(0);
    });
    test("It should return a 401 error code if the user is not an admin or manager", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/products`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
  });
});
