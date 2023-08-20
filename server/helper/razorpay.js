const Razorpay = require('razorpay');
const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET }); 

exports.generateRazorpay = (orderId, total)=>{
    return new Promise((resolve, reject)=>{
        const options = {
            amount: total*100,  // amount in the smallest currency unit
            currency: "INR",
            receipt: String(orderId)
        };
        instance.orders.create(options, function(err, order) {
            if(err){
                console.log(err);
                reject(err);
            }else{
                console.log("Order Generated RazorPAY: " + JSON.stringify(order));
                resolve(order);
            }
        });
    })    
};

exports.verifyPayment = (details)=>{
    console.log("DETAILS : " + JSON.stringify(details));
    return new Promise((resolve, reject)=>{
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET );

        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex');
        if(hmac == details.payment.razorpay_signature){
            console.log("Verify SUCCESS");
            resolve();
        }else{
            console.log("Verify FAILED");
            reject();
        }
    })
};