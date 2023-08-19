const { User } = require("../models/user");
const { HttpError, ctrlWrapper } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { email, password } = req.body;
  const candidate = await User.findOne({ email });
  if (candidate) {
    throw HttpError(409, "Email in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ ...req.body, password: hashedPassword });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const candidate = await User.findOne({ email });
  if (!candidate) {
    throw HttpError(401, "Email or password is wrong");
  }
  const comparePassword = await bcrypt.compare(password, candidate.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const token = jwt.sign({ id: candidate._id }, SECRET_KEY, {
    expiresIn: "23h",
  });
  await User.findByIdAndUpdate(candidate._id, { token });
  res.json({
    token,
    user: {
      email: candidate.email,
      subscription: candidate.subscription,
    },
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json({});
};

const current = (req, res) => {
  const { email, subscription } = req.user;
  res.json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  const { _id, subscription } = req.user;
  const newSubscription = req.body.subscription;
  if (newSubscription === subscription) {
    throw HttpError(409, "Invalid subscription");
  }
  const updatedSubscription = await User.findByIdAndUpdate(
    _id,
    { $set: { subscription: newSubscription } },
    {
      new: true,
    }
  );
  if (!updateSubscription) {
    throw HttpError(409, "Not Found");
  }
  res.json({
    message: `New subscription is ${updatedSubscription.subscription}`,
  });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscription: ctrlWrapper(updateSubscription),
};
