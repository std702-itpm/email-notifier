const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require("es6-promisify");

// setup mailing service
const transport = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS
  }
});

// find the template and render the template in online
const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../email-templates/${filename}.pug`, options);
  const inlined = juice(html);
  return inlined;
};

// wrap it up and send the email
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