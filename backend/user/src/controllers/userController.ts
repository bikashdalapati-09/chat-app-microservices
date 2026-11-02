import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async (req, res) => {
  const { email } = req.body;

  const rateLimitKey = `otp:ratelimit:${email}`;
  const rateLimit = await redisClient.get(rateLimitKey);

  if (rateLimit) {
    res.status(429).json({
      message: "Too many request, please wait before requesting new otp !!",
    });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;
  await redisClient.set(otpKey, otp, {
    EX: 300,
  });
  await redisClient.set(rateLimitKey, "true", {
    EX: 60,
  });

  const message = {
    to: email,
    subject: "Your OTP code",
    body: `Your otp is ${otp}. It is valid for 5 minutes`

  }
  await publishToQueue("send-otp",message)
  return res.status(200).json({
    message: "otp sent to your mail"
  })
});


export const verifyUser = TryCatch(async(req, res) => {
  const {email, otp:enteredOtp} = req.body;

  if(!email || !enteredOtp){
    return res.status(400).json({
      message:"Email and OTP Required"
    })
  }

  const otpKey = `otp:${email}`
  const storedOtp = await redisClient.get(otpKey)

  if(!storedOtp || storedOtp !== enteredOtp){
    res.status(400).json({
      message: "Invalid or Expired otp"
    })
    return;
  }
  
  await redisClient.del(otpKey)

  let user = await User.findOne({email});

  if(!user){
    const name = email.slice(0,8);
    user = await User.create({name, email})
  }

  const token = generateToken(user)
  res.json({
    message: "User Verified",
    user,
    token
  })
})

