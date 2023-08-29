const express = require("express");
const controller = require("../../controllers/auth");
const { validateBody, checkJwt, upload } = require("../../middlewares");
const { schemas } = require("../../models/user");

const router = express.Router();

router.post("/register", validateBody(schemas.signSchema), controller.register);

router.get("/verify/:verificationToken", controller.verifyEmail);

router.post(
  "/verify",
  validateBody(schemas.emailSchema),
  controller.resendVerifyEmail
);

router.post("/login", validateBody(schemas.signSchema), controller.login);

router.post("/logout", checkJwt, controller.logout);

router.get("/current", checkJwt, controller.current);

router.patch(
  "/",
  checkJwt,
  validateBody(schemas.updateSubscriptionSchema),
  controller.updateSubscription
);

router.patch(
  "/avatars",
  checkJwt,
  upload.single("avatar"),
  controller.updateAvatar
);

module.exports = router;
