const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const sendOrderConfirmationEmail = async (order) => {
    try {
        const itemsHtml = order.orderItems.map(item => `
            <tr>
                <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; color: #444;">
                    <div style="font-weight: 600;">${item.name}</div>
                    ${item.size ? `<div style="font-size: 11px; color: #888;">Size: ${item.size}</div>` : ''}
                    ${item.color ? `<div style="font-size: 11px; color: #888;">Color: ${item.color}</div>` : ''}
                </td>
                <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666;">${item.quantity}</td>
                <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a1a; font-weight: 500;">${order.currency} ${item.price.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"ZhenKala Art" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Invoice for Order #${order._id.toString().slice(-8).toUpperCase()} - ZhenKala`,
            html: `
                <div style="background-color: #fcfcfc; padding: 40px 0;">
                    <div style="font-family: 'Jost', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 50px; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #f0f0f0;">
                        
                        <!-- Header / Branding -->
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; border-bottom: 2px solid #fdf2f2; padding-bottom: 30px;">
                            <div>
                                <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">ZHENKALA</h1>
                                <p style="color: #c53030; margin: 5px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Official Purchase Invoice</p>
                            </div>
                            <div style="text-align: right; color: #888; font-size: 13px; line-height: 1.6;">
                                <strong>ZhenKala Art & Handicrafts</strong><br>
                                Thamel Street, Kathmandu<br>
                                Nepal, 44600<br>
                                <a href="mailto:contact.zhenkala@gmail.com" style="color: #c53030; text-decoration: none;">contact.zhenkala@gmail.com</a>
                            </div>
                        </div>

                        <!-- Invoice Meta -->
                        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
                            <div style="flex: 1;">
                                <h3 style="color: #c53030; text-transform: uppercase; font-size: 12px; margin-bottom: 10px; letter-spacing: 1px;">Bill To</h3>
                                <p style="color: #1a1a1a; margin: 0; font-weight: 600;">${order.user.firstName} ${order.user.lastName}</p>
                                <p style="color: #666; margin: 5px 0; font-size: 14px; line-height: 1.5;">
                                    ${order.shippingAddress.street}<br>
                                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                                    ${order.shippingAddress.country}
                                </p>
                            </div>
                            <div style="flex: 1; text-align: right;">
                                <h3 style="color: #c53030; text-transform: uppercase; font-size: 12px; margin-bottom: 10px; letter-spacing: 1px;">Invoice Details</h3>
                                <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>No:</strong> #${order._id.toString().toUpperCase()}</p>
                                <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(order.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Method:</strong> ${order.paymentMethod}</p>
                            </div>
                        </div>

                        <!-- Items Table -->
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <thead>
                                <tr style="background-color: #f9f9f9;">
                                    <th style="padding: 12px 10px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; border-bottom: 2px solid #eee;">Item Selection</th>
                                    <th style="padding: 12px 10px; text-align: center; font-size: 12px; color: #888; text-transform: uppercase; border-bottom: 2px solid #eee;">Qty</th>
                                    <th style="padding: 12px 10px; text-align: right; font-size: 12px; color: #888; text-transform: uppercase; border-bottom: 2px solid #eee;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <!-- Totals Section -->
                        <div style="display: flex; justify-content: flex-end; margin-bottom: 50px;">
                            <table style="width: 250px; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Subtotal</td>
                                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">${order.currency} ${order.itemsPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Shipping</td>
                                    <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">${order.currency} ${order.shippingPrice.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-top: 1px solid #eee; color: #1a1a1a; font-weight: 700; font-size: 18px;">Total Paid</td>
                                    <td style="padding: 15px 0; border-top: 1px solid #eee; text-align: right; color: #c53030; font-weight: 700; font-size: 18px;">${order.currency} ${order.totalPrice.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <!-- Footer Note -->
                        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #f0f0f0;">
                            <p style="color: #1a1a1a; font-weight: 600; font-size: 16px; margin: 0;">Thank you for your patronage.</p>
                            <p style="color: #888; font-size: 13px; margin: 10px 0 30px;">This invoice confirms that your payment has been received and your sacred artwork is being prepared for transit.</p>
                            
                            <div style="display: inline-block; padding: 12px 30px; background-color: #1a1a1a; border-radius: 8px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 1px;">
                                ZHENKALA ART & HANDICRAFTS
                            </div>
                        </div>

                        <div style="text-align: center; margin-top: 50px; color: #bbb; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
                            &copy; ${new Date().getFullYear()} ZHENKALA • Verified Authentic Himalayan Masterpieces
                        </div>
                    </div>
                </div>
                <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation invoice email sent to ${order.user.email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

const sendOTPEmail = async (email, otp, name) => {
    try {
        const mailOptions = {
            from: `"ZhenKala Auth" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Verify Your Account - Your OTP Code: ${otp}`,
            html: `
                <div style="font-family: 'Jost', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; border-radius: 20px; background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%); border: 1px solid #eee;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ZHENKALA</h1>
                        <div style="height: 2px; width: 40px; background: #c53030; margin: 15px auto;"></div>
                        <p style="color: #666; font-size: 14px; font-style: italic;">Sacred Art. Verified Authenticity.</p>
                    </div>

                    <div style="background: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); text-align: center;">
                        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Welcome to the fold, ${name}</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">To finalize your registration and begin your journey into Himalayan aesthetics, please use the following verification code:</p>
                        
                        <div style="margin: 40px 0; padding: 25px; background: #fdf2f2; border-radius: 12px; border: 1px solid #fee2e2;">
                            <span style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 800; color: #c53030; letter-spacing: 12px; display: block; margin-bottom: 5px;">${otp}</span>
                            <span style="font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">Expires in 10 minutes</span>
                        </div>

                        <p style="color: #888; font-size: 13px;">If you did not initiate this request, please disregard this email or contact our security team.</p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 25px;">
                        <p style="color: #bbb; font-size: 11px;">&copy; ${new Date().getFullYear()} ZhenKala Art & Handicrafts. Verified Secure Registration.</p>
                    </div>
                </div>
                <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap" rel="stylesheet">
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendOrderConfirmationEmail, sendOTPEmail };
