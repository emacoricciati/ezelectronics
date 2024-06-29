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

describe("Cart routes integration tests", () => {
  beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    await postUser(manager);
    await postUser(customer2);
    await postUser(customer);
    await registerProduct(product);
    await registerProduct(product2);
    customerCookie = await login(customer);
  });
  afterAll(async () => {
    await cleanup();
  });
  describe("GET /carts", () => {
    test("It should return a 200 success code and the current cart of the logged in user", async () => {
      const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);

      const cart = response.body;
      expect(cart).toBeDefined();
      expect(cart.customer).toBe(customer.username);
      expect(cart.paid).toBe(false);
      expect(cart.paymentDate).toBe(null);
      expect(cart.total).toBe(0);
      expect(cart.products).toHaveLength(0);
    });
    test("It should return a 401 if the user is not a customer", async () => {
      adminCookie = await login(admin);
      await request(app)
        .get(`${routePath}/carts`)
        .send(product)
        .set("Cookie", adminCookie)
        .expect(401);
    });
  });
  describe("POST /carts", () => {
    test("It should return a 200 success code and it adds a product to the cart if it's not already present", async () => {
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: product.model,
        })
        .set("Cookie", customerCookie)
        .expect(200);

      // check if the product is added to the cart

      const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);

      const cart = response.body;
      expect(cart).toBeDefined();
      expect(cart.customer).toBe(customer.username);
      expect(cart.paid).toBe(false);
      expect(cart.paymentDate).toBe(null);
      expect(cart.total).toBe(product.sellingPrice);
      expect(cart.products).toHaveLength(1);
      expect(cart.products[0].model).toBe(product.model);
    });
    test("It should return a 200 success code and it adds a product to the cart updating the quantity if it's already present", async () => {
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: product.model,
        })
        .set("Cookie", customerCookie)
        .expect(200);
      // check if the product is added to the cart
      const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);
      const cart = response.body;
      expect(cart).toBeDefined();
      expect(cart.customer).toBe(customer.username);
      expect(cart.paid).toBe(false);
      expect(cart.paymentDate).toBe(null);
      expect(cart.total).toBe(2 * product.sellingPrice);
      expect(cart.products).toHaveLength(1);
      expect(cart.products[0].model).toBe(product.model);
      expect(cart.products[0].quantity).toBe(2);
    });
    test("It should return a 422 error code if the model is not empty", async () => {
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "",
        })
        .set("Cookie", customerCookie)
        .expect(422);
    });
    test("It should return a 404 error code if the model does not exist", async () => {
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "test5",
        })
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 409 error code if the product is sold out", async () => {
      // add a new product with quantity 1
      adminCookie = await login(admin);
      await request(app)
        .post(`${routePath}/products`)
        .send({
          model: "test3",
          category: Category.SMARTPHONE,
          quantity: 1,
          details: "",
          sellingPrice: 999,
          arrivalDate: "2024-05-12",
        })
        .set("Cookie", adminCookie)
        .expect(200);
      // sell the product
      await request(app)
        .patch(`${routePath}/products/test3/sell`)
        .send({ quantity: 1 })
        .set("Cookie", adminCookie)
        .expect(200);
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "test3",
        })
        .set("Cookie", customerCookie)
        .expect(409);
    });
  });
  describe("PATCH /carts", () => {
    test("It should return a 200 success code and it simulates the payment", async () => {
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);

      // check if the product is sold
      adminCookie = await login(admin);
      const response2 = await request(app)
        .get(`${routePath}/products?grouping=model&model=test`)
        .set("Cookie", adminCookie)
        .expect(200);
      const prods = response2.body;
      const prod = prods.find((p: any) => p.model === product.model);
      expect(prod).toBeDefined();
      expect(prod.quantity).toBe(product.quantity - 2);
    });
    test("It should return a 401 error code and the user is not a customer", async () => {
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", adminCookie)
        .expect(401);
    });
    test("It should return a 404 error code if there is no info about an unpaid cart in the db", async () => {
      customerCookie = await login(customer);
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 400 error code if there is info about an unpaid cart but with no products", async () => {
      // add a new product in the cart
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: product.model,
        })
        .set("Cookie", customerCookie)
        .expect(200);
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/${product.model}`)
        .set("Cookie", customerCookie)
        .expect(200);
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(400);
    });
    test("It should return a 409 if the product is sold out", async () => {
      // increase the quantity of the product test3 (1)
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test3`)
        .send({ quantity: 1 })
        .set("Cookie", adminCookie)
        .expect(200);
      // add a new product in the cart
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "test3",
        })
        .set("Cookie", customerCookie)
        .expect(200);
      // sell the product (1)
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test3/sell`)
        .send({ quantity: 1 })
        .set("Cookie", adminCookie)
        .expect(200);
        customerCookie = await login(customer);
      // try to pay the cart again
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(409);
    });
    test("It should return a 409 if at least one product in the cart whose quantity is higher than the available quantity in the stock", async () => {
      // increse the quantity of the product test3 (2)
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test3`)
        .send({ quantity: 2 })
        .set("Cookie", adminCookie)
        .expect(200);
      // add a new product in the cart
      customerCookie = await login(customer);
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "test3",
        })
        .set("Cookie", customerCookie)
        .expect(200);
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: "test3",
        })
        .set("Cookie", customerCookie)
        .expect(200);
      // sell the product (1)
      adminCookie = await login(admin);
      await request(app)
        .patch(`${routePath}/products/test3/sell`)
        .send({ quantity: 1 })
        .set("Cookie", adminCookie)
        .expect(200);
      // try to pay the cart again
      customerCookie = await login(customer);
      await request(app)
        .patch(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(409);
    });
  });
  describe("GET /carts/history", () => {
    test("It should return a 200 success code and it returns an array of previous carts", async () => {
      const response = await request(app)
        .get(`${routePath}/carts/history`)
        .set("Cookie", customerCookie)
        .expect(200);
      const carts = response.body;
      expect(carts).toBeDefined();
      expect(carts).toHaveLength(1);
      expect(carts[0].customer).toBe(customer.username);
      expect(carts[0].paid).toBe(true);
      expect(carts[0].paymentDate).toBeDefined();
      expect(carts[0].total).toBe(product.sellingPrice * 2);
      expect(carts[0].products).toHaveLength(1);
    });
    test("It should return a 401 error code if the user is not a customer", async () => {
      adminCookie = await login(admin);
      await request(app)
        .get(`${routePath}/carts/history`)
        .set("Cookie", adminCookie)
        .expect(401);
    });
  });
  describe("DELETE /carts/products/:model", () => {
    test("It should return a 200 success code and it decreases the quantity of the product in the cart if the quantity > 1", async () => {
      customerCookie = await login(customer);
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/test3`)
        .set("Cookie", customerCookie)
        .expect(200);
      await request(app)
        .delete(`${routePath}/carts/products/test3`)
        .set("Cookie", customerCookie)
        .expect(200);
    });
    test("It should return a 200 success code and it decreases the quantity of the product in the cart if the quantity = 1", async () => {
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/test3`)
        .set("Cookie", customerCookie)
        .expect(200);
      // get the cart
      const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);
      const cart = response.body;
      expect(cart).toBeDefined();
      expect(cart.products).toHaveLength(0);
    });
    test("It should return a 401 error code if the user is not a customer", async () => {
      adminCookie = await login(admin);
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/test3`)
        .set("Cookie", adminCookie)
        .expect(401);
    });
    test("It should return a 400 error code if the cart is empty", async () => {
      customerCookie = await login(customer);
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/test1`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 404 error code if the product is not in the cart", async () => {
      // add a new product in the cart
      await request(app)
        .post(`${routePath}/carts`)
        .send({
          model: product.model,
        })
        .set("Cookie", customerCookie)
        .expect(200);
      // remove product from the cart
      await request(app)
        .delete(`${routePath}/carts/products/test2`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 404 error code if the product does not exist", async () => {
      await request(app)
        .delete(`${routePath}/carts/products/wrong`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
    test("It should return a 404 error code if there is no info about an unpaid cart", async () => {
      customerCookie = await login(customer2);
      await request(app)
        .delete(`${routePath}/carts/products/wrong`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
  });
  describe("DELETE /carts/current", () => {
    test("It should return a 200 success code and it empties the cart by deleting all of its products", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/carts/current`)
        .set("Cookie", customerCookie)
        .expect(200);
      // get the cart
      const response = await request(app)
        .get(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(200);
      const cart = response.body;
      expect(cart).toBeDefined();
      expect(cart.products).toHaveLength(0);
      expect(cart.total).toBe(0);
    });
    test("It should return a 401 error code if the user is not a customer", async () => {
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/carts/current`)
        .set("Cookie", adminCookie)
        .expect(401);
    });
    test("It should return a 404 if there is no info about an unpaid cart", async () => {
      customerCookie = await login(customer2);
      await request(app)
        .delete(`${routePath}/carts/current`)
        .set("Cookie", customerCookie)
        .expect(404);
    });
  });
  describe("GET /carts/all", () => {
    test("It should return a 200 success code and it returns an array of both current and past carts of all users", async () => {
      adminCookie = await login(admin);
      const response = await request(app)
        .get(`${routePath}/carts/all`)
        .set("Cookie", adminCookie)
        .expect(200);
      const carts = response.body;
      expect(carts).toBeDefined();
      expect(carts).toHaveLength(2);
    });
    test("It should return a 401 if the user is not an admin or customer", async () => {
      customerCookie = await login(customer);
      await request(app)
        .get(`${routePath}/carts/all`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
  });
  describe("DELETE /carts", () => {
    test("It should return a 200 success code and it deletes all existing carts of all users, both current and past", async () => {
      adminCookie = await login(admin);
      await request(app)
        .delete(`${routePath}/carts`)
        .set("Cookie", adminCookie)
        .expect(200);
      // get all carts
      const response = await request(app)
        .get(`${routePath}/carts/all`)
        .set("Cookie", adminCookie)
        .expect(200);
      const carts = response.body;
      expect(carts).toHaveLength(0);
    });
    test("It should return a 401 error code if the user is a customer", async () => {
      customerCookie = await login(customer);
      await request(app)
        .delete(`${routePath}/carts`)
        .set("Cookie", customerCookie)
        .expect(401);
    });
  });
});
