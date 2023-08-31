const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { email, password } = req.body;
  const candidate = await User.findOne({ email });
  if (candidate) {
    throw HttpError(409, "Email in use");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const avatarUrl = gravatar.url(email);
  const verificationToken = nanoid();
  const newUser = await User.create({
    ...req.body,
    password: hashedPassword,
    avatarUrl,
    verificationToken,
  });
  await sendEmail({
    to: email,
    subject: "Please, confirm your email",
    html: `<a target ="_blank" href = "${BASE_URL}/users/verify/${verificationToken}">Confirm your email</a>`,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });
  res.json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  await sendEmail({
    to: email,
    subject: "Please, confirm your email",
    html: `<a target='_blank' href="${BASE_URL}/users/verify/${user.verificationToken}">Confirm your email</a>`,
  });
  res.json({
    message: "Verification email sent",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const candidate = await User.findOne({ email });
  if (!candidate) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!candidate.verify) {
    throw HttpError(401, " Email not verified");
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

const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const { _id: id } = req.user;
  const imageName = `${id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, imageName);
  await fs.rename(tempUpload, resultUpload);
  const image = await Jimp.read(resultUpload);
  await image.resize(250, 250).write(resultUpload);
  const avatarUrl = path.join("avatars", imageName);
  await User.findByIdAndUpdate(id, { avatarUrl });
  res.json({ avatarUrl });
};

module.exports = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  current: ctrlWrapper(current),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
