const express = require("express");
const controller = require("../../controllers/auth");
const { validateBody, checkJwt } = require("../../middlewares");
const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validateBody(schemas.signSchema), controller.register);

router.post("/login", validateBody(schemas.signSchema), controller.login);

router.post("/logout", checkJwt, controller.logout);

router.get("/current", checkJwt, controller.current);

router.patch(
  "/",
  checkJwt,
  validateBody(schemas.updateSubscriptionSchema),
  controller.updateSubscription
);

module.exports = router;
