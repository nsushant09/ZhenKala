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

const User = require('../models/User');

const sendOrderConfirmationEmail = async (order) => {
    try {
        // Populate coupon for percent display if not already populated
        if (order.coupon && typeof order.coupon === 'string' || order.coupon instanceof require('mongoose').Types.ObjectId) {
            await order.populate('coupon', 'code discountPercent');
        }

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

        const discountRowHtml = (order.discountAmount > 0) ? `
            <tr>
                <td style="padding: 8px 0; color: #c53030; font-size: 14px; text-align: left; font-weight: 600;">
                    Discount ${order.coupon ? `(${order.coupon.discountPercent}%)` : ''}
                </td>
                <td style="padding: 8px 0; text-align: right; color: #c53030; font-weight: 600;">-${order.currency} ${order.discountAmount.toFixed(2)}</td>
            </tr>
        ` : '';

        // 1. Send Customer Invoice
        const customerMailOptions = {
            from: `"ZhenKala Art" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Invoice for Order #${order._id.toString().slice(-8).toUpperCase()} - ZhenKala`,
            html: `
                <div style="background-color: #fcfcfc; padding: 40px 0;">
                    <div style="font-family: 'Jost', Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 50px; border-radius: 24px; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.02); border: 1px solid #f0f0f0;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 50px; border-bottom: 2px solid #fdf2f2; padding-bottom: 30px;">
                            <tr>
                                <td width="50%" align="left" valign="top">
                                    <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">ZHENKALA</h1>
                                    <p style="color: #c53030; margin: 5px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Official Purchase Invoice</p>
                                </td>
                                <td width="50%" align="right" valign="top" style="text-align: right; color: #888; font-size: 13px; line-height: 1.6;">
                                    <strong>ZhenKala Art & Handicrafts</strong><br>
                                    Thamel Street, Kathmandu<br>
                                    Nepal, 44600<br>
                                    <a href="mailto:contact.zhenkala@gmail.com" style="color: #c53030; text-decoration: none;">contact.zhenkala@gmail.com</a>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 40px;">
                            <tr>
                                <td width="50%" align="left" valign="top">
                                    <h3 style="color: #c53030; text-transform: uppercase; font-size: 12px; margin-bottom: 10px; letter-spacing: 1px;">Bill To</h3>
                                    <p style="color: #1a1a1a; margin: 0; font-weight: 600;">${order.user.firstName} ${order.user.lastName}</p>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px; line-height: 1.5;">
                                        ${order.shippingAddress.street}<br>
                                        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                                        ${order.shippingAddress.country}
                                    </p>
                                </td>
                                <td width="50%" align="right" valign="top" style="text-align: right;">
                                    <h3 style="color: #c53030; text-transform: uppercase; font-size: 12px; margin-bottom: 10px; letter-spacing: 1px;">Invoice Details</h3>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>No:</strong> #${order._id.toString().toUpperCase()}</p>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Date:</strong> ${new Date(order.paidAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p style="color: #666; margin: 5px 0; font-size: 14px;"><strong>Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                                </td>
                            </tr>
                        </table>

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

                        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
                            <tr>
                                <td align="right">
                                    <table width="250" border="0" align="right" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td style="padding: 8px 0; color: #666; font-size: 14px; text-align: left;">Subtotal</td>
                                            <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">${order.currency} ${order.itemsPrice.toFixed(2)}</td>
                                        </tr>
                                        ${discountRowHtml}
                                        <tr>
                                            <td style="padding: 8px 0; color: #666; font-size: 14px; text-align: left;">Shipping</td>
                                            <td style="padding: 8px 0; text-align: right; color: #1a1a1a; font-weight: 500;">${order.currency} ${order.shippingPrice.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 15px 0; border-top: 2px solid #1a1a1a; color: #1a1a1a; font-weight: 700; font-size: 18px; text-align: left;">Total Paid</td>
                                            <td style="padding: 15px 0; border-top: 2px solid #1a1a1a; text-align: right; color: #c53030; font-weight: 700; font-size: 18px;">${order.currency} ${order.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>

                        <div style="text-align: center; padding-top: 40px; border-top: 1px solid #f0f0f0;">
                            <p style="color: #1a1a1a; font-weight: 600; font-size: 16px; margin: 0;">Thank you for your purchase.</p>
                            <p style="color: #888; font-size: 13px; margin: 10px 0 30px;">We are now carefully preparing your selection from the Himalayas.</p>
                            <div style="display: inline-block; padding: 12px 30px; background-color: #1a1a1a; border-radius: 8px; color: #ffffff; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                                ZHENKALA ART & HANDICRAFTS
                            </div>
                        </div>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(customerMailOptions);
        console.log(`Confirmation invoice email sent to customer: ${order.user.email}`);

        // 2. Fetch and Notify Admins
        const admins = await User.find({ role: 'admin' }).select('email firstName');
        if (admins && admins.length > 0) {
            const adminEmails = admins.map(admin => admin.email);
            const adminMailOptions = {
                from: `"ZhenKala Notifications" <${process.env.EMAIL_USER}>`,
                to: adminEmails,
                subject: `NEW ORDER RECEIVED - #${order._id.toString().toUpperCase()}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background: #ffffff;">
                        <div style="background: #1a1a1a; color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
                            <h2 style="margin: 0; letter-spacing: 2px;">NEW ORDER ALERT</h2>
                            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 12px;">Customer: ${order.user.firstName} ${order.user.lastName}</p>
                        </div>
                        
                        <div style="margin-bottom: 25px;">
                            <h3 style="color: #c53030; font-size: 14px; margin-bottom: 15px;">ORDER SUMMARY</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                ${order.orderItems.map(item => `
                                    <tr>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5; font-size: 14px;"><strong>${item.name}</strong> x ${item.quantity}</td>
                                        <td style="padding: 10px 0; border-bottom: 1px solid #f5f5f5; text-align: right; font-size: 14px;">${order.currency} ${item.price.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                                <tr>
                                    <td style="padding: 15px 0; font-weight: bold; font-size: 16px;">TOTAL REVENUE</td>
                                    <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 16px; color: #c53030;">${order.currency} ${order.totalPrice.toFixed(2)}</td>
                                </tr>
                            </table>
                        </div>

                        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h3 style="font-size: 14px; margin-top: 0; color: #333;">SHIPPING TO:</h3>
                            <p style="margin: 0; font-size: 14px; line-height: 1.6;">
                                ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
                                ${order.shippingAddress.state} ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}<br>
                                <strong>Phone:</strong> ${order.shippingAddress.phone}
                            </p>
                        </div>

                        <div style="text-align: center;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/orders" 
                               style="display: inline-block; padding: 15px 40px; background: #c53030; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                                VIEW ORDER IN DASHBOARD
                            </a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
                            This is an automated operational notification from the ZhenKala Engine.
                        </p>
                    </div>
                `
            };
            await transporter.sendMail(adminMailOptions);
            console.log(`Admin notification emails sent to: ${adminEmails.join(', ')}`);
        }

    } catch (error) {
        console.error('Error sending order emails:', error);
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
const sendContactEmail = async (name, email, message) => {
    try {
        const mailOptions = {
            from: `"ZhenKala Contact" <${process.env.EMAIL_USER}>`,
            to: 'contact.zhenkala@gmail.com',
            replyTo: email,
            subject: `New Inquiry from: ${name}`,
            html: `
                <div style="font-family: 'Jost', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff; border: 1px solid #eee; border-radius: 12px;">
                    <div style="border-bottom: 2px solid #c53030; padding-bottom: 20px; margin-bottom: 30px;">
                        <h2 style="color: #1a1a1a; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">New Contact Form Submission</h2>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Sender Details</p>
                        <p style="color: #1a1a1a; margin: 0; font-size: 16px; font-weight: 500;"><strong>Name:</strong> ${name}</p>
                        <p style="color: #1a1a1a; margin: 5px 0 0 0; font-size: 16px; font-weight: 500;"><strong>Email:</strong> ${email}</p>
                    </div>

                    <div style="background: #fdfdfd; padding: 25px; border-left: 4px solid #c53030; border-radius: 4px; margin-bottom: 30px;">
                        <p style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; margin-top: 0;">Message</p>
                        <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f0f0f0;">
                        <p style="color: #bbb; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">ZhenKala Automated Contact System</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Contact email sent successfully from ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending contact email:', error);
        return false;
    }
};

module.exports = { sendOrderConfirmationEmail, sendOTPEmail, sendContactEmail };
