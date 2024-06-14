import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { app } from "../index";
import { cleanup } from "../src/db/cleanup";

const routePath = "/ezelectronics"; //Base route path for the API

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
//Cookies for the users. We use them to keep users logged in. Creating them once and saving them in a variables outside of the tests will make cookies reusable
let customerCookie: string;
let adminCookie: string;

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

describe("User routes integration tests", () => {
  beforeAll(async () => {
    await cleanup();
    await postUser(admin);
    adminCookie = await login(admin);
  });
  afterAll(async () => {
    await cleanup();
  });
  describe("POST /users", () => {
    test("It should return a 200 success code and create a new user", async () => {
      await request(app).post(`${routePath}/users`).send(customer).expect(200);

      const users = await request(app)
        .get(`${routePath}/users`)
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let cust = users.body.find(
        (user: any) => user.username === customer.username
      );
      expect(cust).toBeDefined();
      expect(cust.name).toBe(customer.name);
      expect(cust.surname).toBe(customer.surname);
      expect(cust.role).toBe(customer.role);
    });

    test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "",
          name: "test",
          surname: "test",
          password: "test",
          role: "Customer",
        }) //We send a request with an empty username. The express-validator checks will catch this and return a 422 error code
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "",
          surname: "test",
          password: "test",
          role: "Customer",
        })
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "test",
          surname: "",
          password: "test",
          role: "Customer",
        })
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "test",
          surname: "test",
          password: "",
          role: "Customer",
        })
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "test",
          surname: "test",
          password: "",
          role: "",
        })
        .expect(422);
      await request(app)
        .post(`${routePath}/users`)
        .send({
          username: "test",
          name: "test",
          surname: "test",
          password: "",
          role: "WrongRole",
        })
        .expect(422);
    });
    test("It should return a 409 error when username represents a user that is already in the database", async () => {
      await request(app).post(`${routePath}/users`).send(customer);
      await request(app).post(`${routePath}/users`).send(customer).expect(409);

      const users = await request(app)
        .get(`${routePath}/users`)
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let cust = users.body.find(
        (user: any) => user.username === customer.username
      );
      expect(cust).toBeDefined();
      expect(cust.name).toBe(customer.name);
      expect(cust.surname).toBe(customer.surname);
      expect(cust.role).toBe(customer.role);
    });
  });

  describe("GET /users", () => {
    test("It should return an array of users", async () => {
      const users = await request(app)
        .get(`${routePath}/users`)
        .set("Cookie", adminCookie)
        .expect(200);
      expect(users.body).toHaveLength(2);
      let cust = users.body.find(
        (user: any) => user.username === customer.username
      );
      expect(cust).toBeDefined();
      expect(cust.name).toBe(customer.name);
      expect(cust.surname).toBe(customer.surname);
      expect(cust.role).toBe(customer.role);
      let adm = users.body.find(
        (user: any) => user.username === admin.username
      );
      expect(adm).toBeDefined();
      expect(adm.name).toBe(admin.name);
      expect(adm.surname).toBe(admin.surname);
      expect(adm.role).toBe(admin.role);
    });

    test("It should return a 401 error code if the user is not an Admin", async () => {
      customerCookie = await login(customer);
      await request(app)
        .get(`${routePath}/users`)
        .set("Cookie", customerCookie)
        .expect(401);
      await request(app).get(`${routePath}/users`).expect(401);
    });
  });

  describe("GET /users/roles/:role", () => {
    test("It should return an array of users with a specific role", async () => {
      const admins = await request(app)
        .get(`${routePath}/users/roles/Admin`)
        .set("Cookie", adminCookie)
        .expect(200);
      expect(admins.body).toHaveLength(1);
      let adm = admins.body[0];
      expect(adm.username).toBe(admin.username);
      expect(adm.name).toBe(admin.name);
      expect(adm.surname).toBe(admin.surname);
    });

    test("It should fail if the role is not valid", async () => {
      await request(app)
        .get(`${routePath}/users/roles/Invalid`)
        .set("Cookie", adminCookie)
        .expect(422);
    });
    test("It should return 401 if the user is not an admin", async () => {
        await request(app)
          .get(`${routePath}/users/roles/Invalid`)
          .set("Cookie", customerCookie)
          .expect(401);
      });
  });
  describe("GET /users/:username", () => {
    test("It should return an user with a given username", async () => {
      const response = await request(app)
        .get(`${routePath}/users/customer`)
        .set("Cookie", adminCookie)
        .expect(200);
      let cust = response.body;
      expect(cust.username).toBe(customer.username);
      expect(cust.name).toBe(customer.name);
      expect(cust.surname).toBe(customer.surname);
    });
    test("It should return 401 error code if the user is not logged in", async () => {
        await request(app)
          .get(`${routePath}/users/customer`)
          .expect(401);
      });
      test("It should a 404 if the username does not exist in the database", async () => {
        await request(app)
          .get(`${routePath}/users/wrong`)
          .set("Cookie", adminCookie)
          .expect(404);
      });
      test("It should return 401", async () => {
        await request(app)
          .get(`${routePath}/users/admin`)
          .set("Cookie", customerCookie)
          .expect(401);
      });
  });
  describe("DELETE /users/:username", () => {
    test("It should return 200 success code", async () => {
      await request(app)
        .delete(`${routePath}/users/customer`)
        .set("Cookie", adminCookie)
        .expect(200);
    });
    test("It should return 401 if the user is not logged in", async () => {
        await request(app)
          .delete(`${routePath}/users/customer`)
          .expect(401);
      });
      test("It should return 404 if the user does not exist in the db", async () => {
        await request(app)
          .delete(`${routePath}/users/customer`)
          .set("Cookie", adminCookie)
          .expect(404);
      });
      test("It should return 401 if the user is not an admin and the username is different", async () => {
        await postUser({...customer, username: "anothercustomer"});
        await postUser(customer)
        customerCookie = await login(customer)
        const response = await request(app)
          .delete(`${routePath}/users/anothercustomer`)
          .set("Cookie", customerCookie)
          .expect(401);
          expect(response.body.error).toBe("You cannot access the information of other users");
      });
      test("It should return 401 if an admin tries to delete another admin", async () => {
        await postUser({...admin, username: "anotheradmin"});
        const response = await request(app)
          .delete(`${routePath}/users/anotheradmin`)
          .set("Cookie", adminCookie)
          .expect(401);
          expect(response.body.error).toBe("Admins cannot be deleted");
      });
  });
  describe("DELETE /users", () => {
    test("It should return 200 success code", async () => {
      await request(app)
        .delete(`${routePath}/users`)
        .set("Cookie", adminCookie)
        .expect(200);
    });
    test("It should return 401 if the user is not an admin", async () => {
        await request(app)
          .delete(`${routePath}/users`)
          .set("Cookie", customerCookie)
          .expect(401);
      });
  });
  describe("PATCH /users/:username", () => {
    test("It should return 200 success code", async () => {
        await postUser(customer)
        customerCookie = await login(customer)
      await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: "2000-01-01"})
        .set("Cookie", customerCookie)
        .expect(200);
        const users = await request(app).get(`${routePath}/users`).set("Cookie", adminCookie).expect(200);
        let cust = users.body.find((user: any) => user.username === customer.username);
        expect(cust).toBeDefined();
        expect(cust.name).toBe("newName");
        expect(cust.surname).toBe("newSurname");
        expect(cust.address).toBe("newAddress");
        expect(cust.birthdate).toBe("2000-01-01");
    });
    test("It should return 422 if data are not correct", async () => {
      await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "", surname: "newSurname", address: "newAddress", birthdate: "2000-01-01"})
        .set("Cookie", customerCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "newName", surname: "", address: "newAddress", birthdate: "2000-01-01"})
        .set("Cookie", customerCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "newName", surname: "newSurname", address: "", birthdate: "2000-01-01"})
        .set("Cookie", customerCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: ""})
        .set("Cookie", customerCookie)
        .expect(422);
        await request(app)
        .patch(`${routePath}/users/customer`)
        .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: "01-01-2000"})
        .set("Cookie", customerCookie)
        .expect(422);
    });
    test("It should return a 401 when user and username are different", async () => {
      await request(app)
        .patch(`${routePath}/users/anothercustomer`)
        .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: "2000-01-01"})
        .set("Cookie", customerCookie)
        .expect(401);
    });
    test("It should return a 404 error if the user does not exist", async () => {
        await request(app)
          .patch(`${routePath}/users/wrong`)
          .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: "2000-01-01"})
          .set("Cookie", adminCookie)
          .expect(404);
      });
      test("It should return a 400 if the birthdate is after the current date", async () => {
        await request(app)
          .patch(`${routePath}/users/customer`)
          .send({name: "newName", surname: "newSurname", address: "newAddress", birthdate: "2100-01-01"})
          .set("Cookie", adminCookie)
          .expect(400);
      });
  });
});
