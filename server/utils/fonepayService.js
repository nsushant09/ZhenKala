const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

class FonepayService {
  constructor() {
    this.merchantCode = process.env.FONEPAY_PG_MERCHANT_CODE;
    this.merchantSecret = process.env.FONEPAY_PG_MERCHANT_SECRET;
    this.baseUrl = process.env.FONEPAY_PG_URL || 'https://clientapi.fonepay.com';
    this.callbackUrl = process.env.FONEPAY_PG_CALLBACK_URL;
  }

  /**
   * Generates a secure Fonepay payment URL for redirection
   */
  async generateWebPaymentUrl(order) {
    if (!order) throw new Error('Order data is required for Fonepay initialization');

    // PRN should be unique, we use the order ID + timestamp
    const prn = `${order._id}_${Date.now()}`;
    const amount = order.totalPrice.toFixed(2);
    
    // Fonepay requires date in MM/DD/YYYY
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const date = `${month}/${day}/${year}`;

    const paymentData = {
      PID: this.merchantCode,
      MD: 'P',
      PRN: prn,
      AMT: amount,
      CRN: 'NPR',
      DT: date,
      R1: `Payment for Order ${order._id}`,
      R2: 'ZhenKala Art Collection',
      RU: this.callbackUrl
    };

    // Calculate Digital Verification (DV)
    const dataToHash = `${paymentData.PID},${paymentData.MD},${paymentData.PRN},${paymentData.AMT},${paymentData.CRN},${paymentData.DT},${paymentData.R1},${paymentData.R2},${paymentData.RU}`;
    
    const DV = crypto
      .createHmac('sha512', this.merchantSecret)
      .update(dataToHash, 'utf-8')
      .digest('hex');

    // Create the final Direct Redirect URL
    const params = new URLSearchParams({
      ...paymentData,
      DV
    });

    const paymentUrl = `${this.baseUrl}/api/merchantRequest?${params.toString()}`;

    return {
      success: true,
      paymentUrl,
      prn
    };
  }

  /**
   * Validates the integrity of the response from Fonepay backend-to-backend
   */
  async verifyPayment(params) {
    try {
      const { PRN, PID, PS, RC, UID, BC, INI, P_AMT, R_AMT, DV } = params;

      // 1. Validate Signature (Local Hash Check)
      const responseString = `${PRN},${PID},${PS},${RC},${UID},${BC},${INI},${P_AMT},${R_AMT}`;
      const expectedHash = crypto
        .createHmac('sha512', this.merchantSecret)
        .update(responseString, 'utf-8')
        .digest('hex')
        .toUpperCase();

      if (expectedHash !== DV.toUpperCase()) {
        console.error('[Fonepay] Signature Verification Failed');
        return { success: false, message: 'Invalid response signature' };
      }

      // 2. Server-to-Server Verification (API check)
      const verificationHashSource = `${PID},${P_AMT},${PRN},${BC || ''},${UID}`;
      const verificationDV = crypto
        .createHmac('sha512', this.merchantSecret)
        .update(verificationHashSource, 'utf-8')
        .digest('hex');

      const verificationParams = new URL(
        `${this.baseUrl}/api/merchantRequest/verificationMerchant`
      );
      verificationParams.searchParams.append('PID', PID);
      verificationParams.searchParams.append('PRN', PRN);
      verificationParams.searchParams.append('AMT', P_AMT);
      verificationParams.searchParams.append('BID', BC || '');
      verificationParams.searchParams.append('UID', UID);
      verificationParams.searchParams.append('DV', verificationDV);

      const response = await axios.get(verificationParams.toString(), {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ZhenKala-Ecom/1.0'
        }
      });

      const parsedResponse = await this._parseXml(response.data);
      const serverResult = parsedResponse?.response;

      if (serverResult && serverResult.success === 'true' && serverResult.response_code === 'successful') {
        return {
          success: true,
          prn: PRN,
          transactionId: UID,
          amount: parseFloat(P_AMT),
          raw: serverResult
        };
      }

      return {
        success: false,
        message: serverResult?.message || 'Fonepay verification API returned failure',
        raw: serverResult
      };
    } catch (error) {
      console.error('[Fonepay] Verification Error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async _parseXml(xmlContent) {
    return new Promise((resolve, reject) => {
      xml2js.parseString(xmlContent, { explicitArray: false }, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}

module.exports = new FonepayService();
