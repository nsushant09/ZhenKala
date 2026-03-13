const puppeteer = require('puppeteer');

/**
 * Generates a PDF of the invoice from HTML content
 * @param {string} html - The HTML content to render as PDF
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
const generateInvoicePDF = async (html) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set content and wait for it to be loaded
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                bottom: '20px',
                left: '20px',
                right: '20px'
            }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) await browser.close();
        throw error;
    }
};

module.exports = { generateInvoicePDF };
