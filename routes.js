const express = require("express");
const router = express.Router();


const subscribedPolicyController = require("./controllers/subscribedPolicyController.js");
router.get("/subscribedPolicy", subscribedPolicyController.subscribedPolicyGet);
// router.post("/company", companyController.companyPost);
// router.post("/register", companyController.registerPost);

const policyExpirationController = require("./controllers/policyExpirationController.js");
router.get("/isPolicyExpired", policyExpirationController.isPolicyExpired);