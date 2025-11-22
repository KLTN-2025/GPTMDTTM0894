// utils/smsService.js
const twilio = require("twilio");

const accountSid = "ACf466971686fa3e3dbb2a2666fb42af46";
const authToken = "cf6e6a2504322e678ca2f2bf2fbe0bba";
const fromPhone = "+15074104256"; // số Twilio dùng để gửi

const client = twilio(accountSid, authToken);

async function sendOtpSms(to, otp) {
  try {
    const message = await client.messages.create({
      body: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 5 phút.`,
      from: fromPhone,
      to: to, // Ví dụ: "+84777527125"
    });

    console.log("Gửi OTP thành công:", message.sid);
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi OTP:", error.message);
    return false;
  }
}

module.exports = { sendOtpSms };
