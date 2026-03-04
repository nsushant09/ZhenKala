const nodemailer = require('nodemailer');

const sendOrderConfirmationEmail = async (order) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'contact.zhenkala@gmail.com',
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        const itemsHtml = order.orderItems.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} x ${item.quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${order.currency} ${item.price.toFixed(2)}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: 'ZhenKala Art <contact.zhenkala@gmail.com>',
            to: order.user.email,
            subject: `Order Confirmed: #${order._id.toString().slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #c53030; margin: 0;">ZhenKala</h1>
                        <p style="color: #666; margin: 5px 0;">Authentic Himalayan Art</p>
                    </div>
                    
                    <h2 style="color: #333;">Thank You for Your Order!</h2>
                    <p>Hi ${order.user.firstName || 'there'},</p>
                    <p>Your payment has been confirmed, and we've started processing your order.</p>
                    
                    <div style="background: #fdf2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0; color: #c53030;">Order Details</h4>
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().toUpperCase()}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.paidAt).toLocaleDateString()}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #eee;">
                                <th style="padding: 10px; text-align: left;">Item</th>
                                <th style="padding: 10px; text-align: right;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Total</td>
                                <td style="padding: 10px; font-weight: bold; text-align: right;">${order.currency} ${order.totalPrice.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                        <p><strong>Shipping Address:</strong></p>
                        <p style="color: #555; line-height: 1.5;">
                            ${order.shippingAddress.street}<br>
                            ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}<br>
                            ${order.shippingAddress.country}
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; color: #888; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} ZhenKala Art. All rights reserved.</p>
                        <p>If you have any questions, reply to this email or contact us at contact.zhenkala@gmail.com</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${order.user.email}`);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

module.exports = { sendOrderConfirmationEmail };
