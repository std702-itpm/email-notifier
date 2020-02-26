// see usage: https://www.npmjs.com/package/dotenv
require('dotenv').config();

const mongoConnectionString = process.env.DB_URL;
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: mongoConnectionString } });
const nodemailer = require('nodemailer');

// const mail = require("./handlers/mail"); //mail.send

agenda.define('send email', { priority: 'high', concurrency: 10 }, function(job, done) {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		service: process.env.EMAIL_SERVICE, // gmail
		auth: {
			user: process.env.EMAIL_SENDER, // email sender
			pass: process.env.EMAIL_PASS, // email sender password
		},
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: '"Reggie - IT Policy Manager" <no-reply-reggie@gmail.com>', // sender address
		to: 'roaldjap@gmail.com', // list of receivers
		subject: 'Expiration Notification', // Subject line
		text: 'Hello world ?', // plain text body
		html: '<b>Hello world ?</b>', // html body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, res) {
		console.log('Message sent: ' + JSON.stringify(res));
		transporter.close();
		done();
	});
});

(async function() {
	await agenda.start();

	await agenda.every('1 minute', 'send email');
})();
