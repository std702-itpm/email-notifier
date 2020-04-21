const mongoose = require('mongoose');
require("../models/company.model.js");
require("../models/subscribedPolicy.model.js");
const Company = mongoose.model('Company');
const User = mongoose.model('User');
const Policy = mongoose.model('Policy');
const SubscribedPolicy=mongoose.model('SubscribedPolicy');

const Nodemailer = require('nodemailer');
const mongoConnectionString = "mongodb://127.0.0.1/it_psych_db";
const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: mongoConnectionString } });

const moment=require('moment');




// Email Notification for Registration 
//set up transporter
const transporter = Nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'itpsychiatrist.policymanager@gmail.com',
           pass: 'Aspire2CKD'
       }
});

exports.isPolicyExpired=(req,res)=>{
    console.log("PolicyExpiration.isPolicyExpired");
    var expiryDate;
     SubscribedPolicy.find({
         status:"not reviewed"
     },function(error,response){

         for(var i=0;i<response.length;i++)
        {
             console.log(response[i].date_expired)
             let now = moment();
             let day = moment(response[i].date_expired);
             let days = day.diff(now, 'days');
             console.log("Days: "+days)
             if(days===60)
            {
                sendMail(response[i].company_id,response[i].policy_name,"60");
            }else if(days===30)
            {
                sendMail(response[i].company_id,response[i].policy_name,"30");
            }else if(days===10)
            {
                sendMail(response[i].company_id,response[i].policy_name,"10");
            }else if(days===1)
            {
                sendMail(response[i].company_id,response[i].policy_name,"1");
            }

        }
     });
};

function sendMail(companyId,policyName,days){
    console.log("CompanyID: "+companyId);
    User.findOne({_id:companyId},function(err,res){
        Company.findOne({_id:res.company},
            function(error,response){
                if(!error){
                    let mailOption={
                        from:"itpsychiatrist.policymanager@gmail.com",
                        to:response.company_email,
                        subject: "The" + " " + policyName + " " + "is expiring soon.",
                        html: "The " + policyName + " " + "is going to expire in " + days + "days."
                    }
                    transporter.sendMail(mailOption,function(err,info){
                        if(err){console.log("Error is: "+err)}
                        else{console.log(info)}
    
                    })
                }
            })
    })
    
    
}