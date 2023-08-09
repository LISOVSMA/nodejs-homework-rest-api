const express = require("express");
const ctrl = require("../../controllers/contacts");
const { schemas } = require("../../models/contact");
const { emptyBody, validateBody, isValidId } = require("../../middlewares");
const router = express.Router();

router.get("/", ctrl.listContacts);

router.get("/:id", isValidId, ctrl.getContactById);

router.post("/", validateBody(schemas.addSchema), ctrl.addContact);

router.delete("/:id", isValidId, ctrl.removeContact);

router.put(
  "/:id",
  isValidId,
  emptyBody,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

router.patch(
  "/:id/favorite",
  isValidId,
  validateBody(schemas.updateFavoreteSchema),
  ctrl.updateStatusContact
);

module.exports = router;
