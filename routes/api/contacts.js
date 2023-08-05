const express = require("express");
const ctrl = require("../../controllers/contacts");
const schemas = require("../../schemas/contacts");
const { emptyBody, validateBody } = require("../../middlewares");
const router = express.Router();

router.get("/", ctrl.listContacts);

router.get("/:id", ctrl.getContactById);

router.post("/", validateBody(schemas.addSchema), ctrl.addContact);

router.delete("/:id", ctrl.removeContact);

router.put(
  "/:id",
  emptyBody,
  validateBody(schemas.addSchema),
  ctrl.updateContact
);

module.exports = router;
