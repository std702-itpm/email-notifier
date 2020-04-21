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

exports.subscribedPolicyGet=(options,done)=>{
    console.log("Subscribed.subscribedPolicyGet");
    var subscribedPolicies=[];
    SubscribedPolicy.find({status:"not reviewed"},
        function(error,response){
           for(let i=0;i<response.length;i++){
               subscribedPolicies.push(response[i]);
            }
        for(let i=0;i<subscribedPolicies.length;i++){
            //console.log("SubscribedPolicies: "+subscribedPolicies[i].reviewer_list)
            getUser(subscribedPolicies[i].reviewer_list,subscribedPolicies[i]._id);
        }
     });
    console.log(options.textIs)     
    
};

function getUser(reviewers,id)
{
    for(let i=0;i<reviewers.length;i++){
        if(reviewers[i].review_status===false){
            User.findById({_id:reviewers[i].reviewer_id},
                function(error,response){
                    var DBDate=reviewers[i].review_first_email_sent_time;
                    var now = moment(); // Current date now.
                    var firstEmailDate = moment(DBDate) // Start of 2010.
                    let days = now.diff(firstEmailDate, 'days');
                    
                    console.log(response.email+"date is: "+days);
                    if(days===15){
                     const mailOptions={
                      from: 'itpsychiatrist.policymanager@gmail.com', // sender address
                      to: response.email, 
                      subject:'The policy is not reviewed',
                      html: 'Please review the policy as soon as possible.' + '</br>' +
                      'Thank you.' + '</br>'+
                      'Regards,' + '</br'+
                      'IT Policy Manager'
                      };
                      transporter.sendMail(mailOptions,function(err,info){
                      if(err){
                      console.log(err);
                      }
                       else{
                       console.log(info);
                       saveReviewDetails(id,reviewers[i].reviewer_id);
                    }
                  })
                    }
 
                    
                })
        }
    }
}

function saveReviewDetails(id,reviewerId){
    var reviewers=[];
    console.log(id+reviewerId)
    SubscribedPolicy.findById(
        {
            _id:id,
        },function(error,response){
          reviewers=response.reviewer_list;
          for(let i=0;i<reviewers.length;i++){
            console.log(reviewers[i]._id)
            if(reviewers[i].reviewer_id===reviewerId){
                response.status="awareness";
                response.reviewer_list[i].review_status=true;
                response.reviewer_list[i].review_reminder_email_sent=true;
                response.save();
            }
          }

    });

}

