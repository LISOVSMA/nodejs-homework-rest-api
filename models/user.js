const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: emailRegex,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: "",
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

const signSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required().messages({
    "any.required": `missing required email field`,
  }),
  password: Joi.string().required().messages({
    "any.required": `missing required password field`,
  }),
});

const validValues = ["starter", "pro", "business"];

const updateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...validValues)
    .required(),
});

const schemas = {
  signSchema,
  updateSubscriptionSchema,
};

const User = model("user", userSchema);

module.exports = {
  User,
  schemas,
};
