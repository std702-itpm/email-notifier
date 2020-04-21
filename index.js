const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);

const Nodemailer = require('nodemailer');
const mongoConnectionString = "mongodb://127.0.0.1/it_psych_db";
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: mongoConnectionString } });

const SubscribedPolicy=require("./controllers/subscribedPolicyController.js");
const ExpiredPolicy=require("./controllers/policyExpirationController.js");

// Define routes here
const indexRoute = require('./routes');

// invoke express on port 5200
const app = express();
const port = process.env.PORT || 5200;

require('dotenv').config();


var store = new MongoDBStore({
  uri: process.env.DATABASE_URL,
  collection: 'sessions',
  unset: 'destroy'
});

store.on('error', function (error) {
  console.log(error);
});

app.use(session({
  secret: 'Somesercrets',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day
  },
  //store: store,
  resave: true,
  saveUninitialized: false
}));

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useFindAndModify: false 
});
const connection = mongoose.connection;

connection.once('open', function () {
  console.log("MongoDB database connection established successfully");
})

app.use(cors());
app.use(express.json());

// invoke routes
//app.use('/', indexRoute);


app.listen(port, function () {
  console.log("Server is running on Port: " + port);
});


// (async function() {
//   await agenda.start();

//   await agenda.every('1 minute', 'send email');
// })();

// // Email Notification for Registration 
// //set up transporter
// const transporter = Nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//          user: 'itpsychiatrist.policymanager@gmail.com',
//          pass: 'Aspire2CKD'
//      }
// })

// agenda.define('send email', (job, done) => {
                
//   const mailOptions={
//   from: 'itpsychiatrist.policymanager@gmail.com', // sender address
//   to: "pooja.khaire@yahoo.com", 
//   subject:'The policy is not reviewed',
//   html: 'Please review the policy as soon as possible.' + '</br>' +
//       'Thank you.' + '</br>'+
//       'Regards,' + '</br'+
//       'IT Policy Manager'
// };
// transporter.sendMail(mailOptions,function(err,info){
//   if(err){
//       console.log(err);
//   }
//   else{
//       console.log(info);
//   }
// })
// done();

(async function() {
  await agenda.start();

  await agenda.every('5 minutes', 'send email');
  await agenda.every('5 minutes', 'send expiry notification');
})();

agenda.define('send email',(job,done)=>{
  SubscribedPolicy.subscribedPolicyGet({
    textIs:"I am in Company.companyGet"
  });
  done();  
});  
agenda.define('send expiry notification',(job,done)=>{
  ExpiredPolicy.isPolicyExpired({
    textIs:"I am in ExpiredPolicy.isPolicyExpired"
  });
  done();  
}); 

module.exports = app;