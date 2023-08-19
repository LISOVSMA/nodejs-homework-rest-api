const express = require("express");
const controller = require("../../controllers/contacts");
const { schemas } = require("../../models/contact");
const {
  emptyBody,
  validateBody,
  isValidId,
  checkJwt,
} = require("../../middlewares");
const router = express.Router();

router.get("/", checkJwt, controller.listContacts);

router.get("/:id", checkJwt, isValidId, controller.getContactById);

router.post(
  "/",
  checkJwt,
  validateBody(schemas.addSchema),
  controller.addContact
);

router.delete("/:id", checkJwt, isValidId, controller.removeContact);

router.put(
  "/:id",
  checkJwt,
  isValidId,
  emptyBody,
  validateBody(schemas.addSchema),
  controller.updateContact
);

router.patch(
  "/:id/favorite",
  checkJwt,
  isValidId,
  validateBody(schemas.updateFavoreteSchema),
  controller.updateStatusContact
);

module.exports = router;
