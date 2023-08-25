require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = require("../app");
const { User } = require("../models/user");

const { DB_HOST, PORT } = process.env;

const testUser = {
  email: "test@example.com",
  password: "testpassword",
  subscription: "pro",
  avatarUrl: "../tmp/ezhik.jpg",
};

describe("test login controller", () => {
  let user;
  let token;

  beforeAll(async () => {
    await mongoose
      .connect(DB_HOST)
      .then(() => {
        app.listen(PORT);
        console.log("Test Database connection successful");
      })
      .catch((error) => {
        console.log(error.message);
      });

    user = new User({
      email: testUser.email,
      password: await bcrypt.hash(testUser.password, 10),
      subscription: testUser.subscription,
      avatarUrl: testUser.avatarUrl,
    });

    await user.save();
  });

  afterAll(async () => {
    await User.deleteMany({ email: testUser.email });
    await mongoose.disconnect();
  });

  test("should respond with status code 200", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(response.status).toBe(200);
  });

  test("should respond with a valid token", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(response.body).toHaveProperty("token");
    token = response.body.token;
  });

  test("should respond with object with 2 string fields: email and subscription", async () => {
    const response = await request(app)
      .post("/users/login")
      .send({ email: testUser.email, password: testUser.password });
    console.log(response.body);
    expect(response.body).toEqual(expect.any(Object));
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });
});
