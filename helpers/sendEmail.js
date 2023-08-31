const sendgrid = require("@sendgrid/mail");

const { SENDGRID_API_KEY } = process.env;

sendgrid.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
  const email = { ...data, from: "lisovsma@proton.me" };
  await sendgrid.send(email);
  return true;
};

module.exports = sendEmail;
