const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',  // dùng service gmail cho nhanh
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function sendOTPByEmail(toEmail, otp, customerName) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Mã OTP của bạn',
    text: `Mã OTP của bạn là: ${otp}`,
    html: `<!DOCTYPE html>
              <html lang="vi">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Xác thực OTP</title>
                <style>
                  body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f7f9fb;
                    margin: 0;
                    padding: 0;
                  }
                  .email-container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    padding: 30px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                    text-align: center;
                    border-bottom: 2px solid #eeeeee;
                    padding-bottom: 20px;
                  }
                  .header h2 {
                    color: #333;
                    margin: 0;
                  }
                  .greeting {
                    margin-top: 20px;
                    font-size: 18px;
                    color: #333;
                  }
                  .greeting strong {
                    font-weight: 700;
                    color: #222;
                  }
                  .content {
                    font-size: 16px;
                    color: #555;
                    line-height: 1.6;
                    margin-top: 20px;
                  }
                  .otp-box {
                    margin: 30px 0;
                    padding: 20px;
                    text-align: center;
                    font-size: 28px;
                    font-weight: bold;
                    color: #111;
                    letter-spacing: 6px;
                    background-color: #f4f6f8;
                    border: 2px dashed #0d6efd;
                    border-radius: 8px;
                  }
                  .footer {
                    text-align: center;
                    font-size: 13px;
                    color: #888;
                    margin-top: 30px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="email-container">
                  <div class="header">
                    <h2>Xác thực quên mật khẩu</h2>
                  </div>
                  <div class="greeting">
                    Xin chào, <strong>${customerName}</strong>
                  </div>
                  <div class="content">
                    <p>Bạn vừa yêu cầu mã xác thực (OTP) để đăng nhập hoặc thực hiện một hành động đổi mật khẩu.</p>
                    <p>Vui lòng sử dụng mã OTP bên dưới để tiếp tục:</p>
                  </div>
                  <div class="otp-box">
                    ${otp}
                  </div>
                  <div class="content">
                    <p>Mã này sẽ hết hạn sau <strong>3 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                  </div>
                  <div class="footer">
                    &copy; 2025 Táo Bro. Mua Apple đến ngay Táo Bro.<br/>
                    Hotline hỗ trợ: 1900 9999 | Email: support@taobro.vn
                  </div>
                </div>
              </body>
              </html>
            `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPByEmail };
