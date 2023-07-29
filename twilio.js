const dotenv = require('dotenv');
dotenv.config({path:'config.env'});
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN);

client.messages
    .create({
        body: 'JMJ Music House - OTP for Login is 654321',
        from: '+17626002830',
        to: '+919656255604'
    })
    .catch(err=>console.log(err));