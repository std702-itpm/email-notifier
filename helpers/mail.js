const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require("es6-promisify");

const transport = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS
  }
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../email-templates/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};


exports.send = async (options, done) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = { 
    priority: 'high',
    from: `Reggie - IT Policy Manager <no-reply-reggie@gmail.com>`,
    to: options.to,
    subject: options.subject,
    html,
    text
  };
  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};

// Example:
// await mail.send({
//   to: email_client, // receiver
//   filename: 'projectSubmit-client', //template
//   subject: 'YourQS - Your have successfully submitted your Project', // custom_subject
//   client_fname, // custom variables 
//   project_name,
//   project_code,
//   downloadURL
// });