const nodemailer = require('nodemailer');
const PaymentConfig = require('../models/PaymentConfig');
const { generateInvoicePDF } = require('./invoiceGenerator');

const CURRENCY_SYMBOLS = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$',
    CHF: 'Fr', CNY: '¥', SEK: 'kr', NZD: 'NZ$', SGD: 'S$',
    HKD: 'HK$', INR: '₹', BRL: 'R$', ZAR: 'R', PHP: '₱',
    IDR: 'Rp', MYR: 'RM', THB: '฿', TRY: '₺', MXN: '$',
    KRW: '₩', ILS: '₪', ISK: 'kr', PLN: 'zł', DKK: 'kr',
    NOK: 'kr', HUF: 'Ft', CZK: 'Kč', RON: 'lei', BGN: 'лв'
};

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Generates the formal HTML invoice used for PDF and fallback
 */
const getInvoiceHtml = (order, merchant) => {
    const useChinese = order.currency === 'CNY';
    const t = {
        shipTo: useChinese ? '邮寄至' : 'SHIP TO',
        invoice: useChinese ? '发票' : 'INVOICE',
        orderId: useChinese ? '订单编号' : 'Order ID',
        date: useChinese ? '日期' : 'Date',
        status: useChinese ? '状态' : 'Status',
        currency: useChinese ? '币种' : 'Currency',
        trxId: useChinese ? '交易单号' : 'Transaction ID',
        paidOn: useChinese ? '付款时间' : 'Paid On',
        description: useChinese ? '项描述' : 'Description',
        price: useChinese ? '单价' : 'Price',
        qty: useChinese ? '数量' : 'Qty',
        total: useChinese ? '小计' : 'Total',
        subtotal: useChinese ? '商品小计' : 'Subtotal',
        shipping: useChinese ? '运费' : 'Shipping',
        totalPaid: useChinese ? '实付总额' : 'TOTAL PAID',
        free: useChinese ? '免费' : 'FREE',
        phone: useChinese ? '电话' : 'Phone',
        tagline: useChinese ? '地道的喜马拉雅艺术' : 'Authentic Himalayan Art',
        size: useChinese ? '尺寸' : 'Size',
        color: useChinese ? '颜色' : 'Color',
        thanks: useChinese ? '感谢您的购买！' : 'Thank You for Your Patronage!',
        confMsg: useChinese ? '在此确认您的付款已经收到，您的艺术品正准备运送。' : 'This invoice confirms that your payment has been received and your sacred artwork is being prepared for transit.'
    };

    const formatPrice = (amount) => {
        const symbol = CURRENCY_SYMBOLS[order.currency] || order.currency;
        return `${symbol} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const itemsHtml = order.orderItems.map(item => `
        <tr>
            <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
                <div style="font-weight: 700; color: #000; font-size: 15px; margin-bottom: 4px;">${item.name}</div>
                <div style="font-size: 11px; color: #999; font-style: italic;">
                    ${item.size ? `<span>${t.size}: ${item.size}</span>` : ''}
                    ${item.color ? `<span style="margin-left: 10px;">${t.color}: ${item.color}</span>` : ''}
                </div>
            </td>
            <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">${formatPrice(item.price)}</td>
            <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 14px;">${item.quantity}</td>
            <td style="padding: 15px 10px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #000; font-weight: 700; font-size: 14px;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    return `
        <div style="background-color: #fcfcfc; padding: 40px 10px; font-family: 'Jost', 'EB Garamond', Arial, sans-serif;">
            <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eee; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                
                <!-- Header Logo -->
                <div style="padding: 40px 20px; text-align: center; background: #fff; border-bottom: 1px solid #f9f9f9;">
                    <img src="https://zhenkala.com/LogoRed.png" alt="ZhenKala Logo" style="height: 40px; margin-bottom: 8px;" />
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #999; font-weight: 400;">${t.tagline}</div>
                    <div style="margin-top: 15px; color: #888; font-size: 12px; letter-spacing: 0.5px;">
                        ${merchant.email} <span style="color: #eee; margin: 0 8px;">•</span> ${merchant.phone || ''}
                    </div>
                </div>

                <div style="padding: 40px;">
                    <!-- Address & Meta Row -->
                    <div style="margin-bottom: 40px; display: table; width: 100%;">
                        <div style="display: table-cell; width: 45%; vertical-align: top; background: #f8f9fa; padding: 25px; border-radius: 8px;">
                            <div style="font-size: 10px; font-weight: 800; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 15px;">${t.shipTo}</div>
                            <div style="font-weight: 700; font-size: 18px; color: #000; margin-bottom: 8px;">${order.user.firstName} ${order.user.lastName}</div>
                            <div style="font-size: 14px; color: #555; line-height: 1.5;">
                                ${order.shippingAddress.street}<br>
                                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                                ${order.shippingAddress.country}<br>
                                <div style="margin-top: 10px; font-size: 12px; color: #888;">${t.phone}: ${order.shippingAddress.phone}</div>
                            </div>
                        </div>
                        <div style="display: table-cell; width: 5%; font-size: 1px;">&nbsp;</div>
                        <div style="display: table-cell; width: 50%; vertical-align: top; text-align: right; background: #fdfdfd; border: 1px solid #f6f6f6; padding: 25px; border-radius: 8px;">
                            <div style="font-size: 28px; font-weight: 900; color: #000; margin-bottom: 15px; letter-spacing: -1px;">${t.invoice}</div>
                            
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 13px; color: #666; margin-bottom: 4px;"><strong style="color: #aaa; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-right: 8px;">${t.orderId}</strong> ${order._id.toUpperCase()}</div>
                                <div style="font-size: 13px; color: #666; margin-bottom: 4px;"><strong style="color: #aaa; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-right: 8px;">${t.date}</strong> ${new Date(order.paidAt).toLocaleDateString(useChinese ? 'zh-CN' : 'en-US', { dateStyle: 'long' })}</div>
                                <div style="font-size: 13px; color: #666; margin-bottom: 4px;"><strong style="color: #aaa; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-right: 8px;">${t.currency}</strong> ${order.currency}</div>
                            </div>

                            <div style="border-top: 1px dashed #eee; padding-top: 12px;">
                                <div style="font-size: 12px; color: #16a34a; font-weight: 600; margin-bottom: 4px;"><strong style="color: #dcfce7; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-right: 8px;">${t.trxId}</strong> ${order.paymentResult?.id?.toUpperCase() || ''}</div>
                                <div style="font-size: 12px; color: #16a34a; font-weight: 600;"><strong style="color: #dcfce7; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-right: 8px;">${t.paidOn}</strong> ${new Date(order.paidAt).toLocaleDateString(useChinese ? 'zh-CN' : 'en-US')}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <thead>
                            <tr>
                                <th style="padding: 15px 10px; text-align: left; background: #f9f9f9; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #999; letter-spacing: 1.5px; border-bottom: 2px solid #eee;">${t.description}</th>
                                <th style="padding: 15px 10px; text-align: center; background: #f9f9f9; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #999; letter-spacing: 1.5px; border-bottom: 2px solid #eee;">${t.price}</th>
                                <th style="padding: 15px 10px; text-align: center; background: #f9f9f9; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #999; letter-spacing: 1.5px; border-bottom: 2px solid #eee;">${t.qty}</th>
                                <th style="padding: 15px 10px; text-align: right; background: #f9f9f9; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #999; letter-spacing: 1.5px; border-bottom: 2px solid #eee;">${t.total}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <!-- Totals Box -->
                    <div style="width: 100%; display: table;">
                        <div style="display: table-cell; width: 60%;">&nbsp;</div>
                        <div style="display: table-cell; width: 40%; vertical-align: top;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-size: 14px;">${t.subtotal}</td>
                                    <td style="padding: 8px 0; text-align: right; color: #000; font-weight: 500;">${formatPrice(order.itemsPrice)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-size: 14px;">${t.shipping}</td>
                                    <td style="padding: 8px 0; text-align: right; color: #000; font-weight: 500;">${order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : t.free}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px 0; border-top: 2px solid #000; font-size: 18px; font-weight: 900; color: #000;">${t.totalPaid}</td>
                                    <td style="padding: 15px 0; border-top: 2px solid #000; text-align: right; font-size: 18px; font-weight: 900; color: #c53030;">${formatPrice(order.totalPrice)}</td>
                                </tr>
                            </table>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f0f0f0; text-align: center;">
                        <div style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 10px;">${t.thanks}</div>
                        <div style="font-size: 13px; color: #888; margin-bottom: 30px; line-height: 1.6;">${t.confMsg}</div>
                        <div style="padding: 12px 25px; background: #000; color: #fff; display: inline-block; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 1.5px;">ZHENKALA ART & HANDICRAFTS</div>
                    </div>
                </div>

                <div style="padding: 30px; background: #fcfcfc; text-align: center; color: #bbb; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;">
                    &copy; ${new Date().getFullYear()} ZHENKALA • Verified Authentic Himalayan Art<br>
                    Thamel Street, Kathmandu, Nepal, 44600
                </div>
            </div>
        </div>
        <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    `;
};

const sendOrderConfirmationEmail = async (order) => {
    try {
        const config = await PaymentConfig.findOne();
        const merchant = config?.businessInfo || {
            email: 'contact.zhenkala@gmail.com',
            phone: '',
            address: 'Thamel Street, Kathmandu, Nepal'
        };

        const useChinese = order.currency === 'CNY';

        // 1. Generate Invoice HTML
        const invoiceHtml = getInvoiceHtml(order, merchant);

        // 2. Generate PDF Buffer
        console.log(`📄 Generating PDF Invoice for Order #${order._id}...`);
        const pdfBuffer = await generateInvoicePDF(invoiceHtml);

        const formatPrice = (amount) => {
            const symbol = CURRENCY_SYMBOLS[order.currency] || order.currency;
            return `${symbol} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        const mailOptions = {
            from: `"ZhenKala Art" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: useChinese
                ? `您的订单已确认 - #${order._id.toString().slice(-8).toUpperCase()}`
                : `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()} - ZhenKala`,
            text: `Hi ${order.user.firstName},\n\nThank you for your purchase from ZhenKala! Your order #${order._id.toUpperCase()} has been successfully paid and is now being processed.\n\nPlease find your formal invoice attached as a PDF.\n\nTotal Paid: ${formatPrice(order.totalPrice)}\n\nWarm regards,\nThe ZhenKala Team`,
            html: `
                <div style="font-family: 'Jost', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #ffffff; border: 1px solid #eee; border-radius: 16px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ZHENKALA</h1>
                        <p style="color: #c53030; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Sacred Art Confirmation</p>
                    </div>

                    <h2 style="color: #1a1a1a; font-size: 22px; margin-bottom: 20px;">${useChinese ? `感谢您的惠顾，${order.user.firstName}` : `Greetings, ${order.user.firstName}`}</h2>
                    
                    <p style="color: #444; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                        ${useChinese
                    ? `我们很高兴地通知您，您的订单 <strong>#${order._id.toUpperCase()}</strong> 已确认。我们的艺术家已经开始为您精心准备这些神圣的作品。`
                    : `We are delighted to confirm that your payment for order <strong>#${order._id.toUpperCase()}</strong> has been successfully received. Our artisans are now meticulously preparing your selection for its journey.`}
                    </p>

                    <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #eee;">
                        <div style="font-size: 11px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Order Summary</div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666; font-size: 14px;">Transaction Amount:</span>
                            <span style="color: #000; font-weight: 700; font-size: 14px;">${formatPrice(order.totalPrice)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666; font-size: 14px;">Payment Method:</span>
                            <span style="color: #000; font-weight: 700; font-size: 14px;">${order.paymentMethod}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666; font-size: 14px;">Date:</span>
                            <span style="color: #000; font-weight: 700; font-size: 14px;">${new Date(order.paidAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <p style="color: #444; font-size: 15px; line-height: 1.6; margin-bottom: 35px;">
                        ${useChinese
                    ? '您的正式发票作为 PDF 文件附在下面。如有任何问题，请随时回复此邮件。'
                    : 'Your formal digital invoice is attached below as a PDF document for your records. If you have any inquiries, please do not hesitate to reach out.'}
                    </p>

                    <div style="text-align: center; border-top: 1px solid #f0f0f0; padding-top: 30px;">
                        <p style="color: #999; font-size: 13px; margin-bottom: 10px;">Thank you for supporting traditional craftsmanship.</p>
                        <strong style="color: #1a1a1a; letter-spacing: 1px;">ZHENKALA ART & HANDICRAFTS</strong>
                    </div>
                </div>
                <link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;600;700&display=swap" rel="stylesheet">
            `,
            attachments: [
                {
                    filename: `Invoice-${order._id.toString().slice(-8).toUpperCase()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ],
            headers: {
                'X-Entity-Ref-ID': order._id.toString()
            }
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Confirmation email with PDF attachment sent to ${order.user.email}`);
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
    }
};

const sendOTPEmail = async (email, otp, name) => {
    try {
        const mailOptions = {
            from: `"ZhenKala Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Verification Code for ${name}`,
            text: `Welcome to ZhenKala, ${name}!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email.\n\nZhenKala Art & Handicrafts\nThamel, Kathmandu, Nepal`,
            html: `
                <div style="font-family: 'Jost', Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; border-radius: 20px; background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%); border: 1px solid #eee;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">ZHENKALA</h1>
                        <div style="height: 2px; width: 40px; background: #c53030; margin: 15px auto;"></div>
                        <p style="color: #666; font-size: 14px; font-style: italic;">Sacred Art. Verified Authenticity.</p>
                    </div>

                    <div style="background: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); text-align: center;">
                        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Identity Verification</h2>
                        <p style="color: #555; font-size: 16px; line-height: 1.6;">Hello ${name}, to continue with your registration on ZhenKala, please enter the following verification code:</p>
                        
                        <div style="margin: 40px 0; padding: 25px; background: #fdf2f2; border-radius: 12px; border: 1px solid #fee2e2;">
                            <span style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: 800; color: #c53030; letter-spacing: 12px; display: block; margin-bottom: 5px;">${otp}</span>
                            <span style="font-size: 11px; color: #ef4444; text-transform: uppercase; letter-spacing: 1px;">Expiring soon • 10 minute window</span>
                        </div>

                        <p style="color: #888; font-size: 13px;">This code was requested to secure your account. If you did not make this request, please disregard this message.</p>
                    </div>

                    <div style="text-align: center; margin-top: 40px; border-top: 1px solid #eee; padding-top: 25px;">
                        <p style="color: #bbb; font-size: 11px; line-height: 1.5;">
                            &copy; ${new Date().getFullYear()} ZhenKala Art & Handicrafts.<br>
                            Thamel Street, Kathmandu, Nepal, 44600<br>
                            <span style="font-size: 10px;">You are receiving this because a registration attempt was initiated using this email.</span>
                        </p>
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
