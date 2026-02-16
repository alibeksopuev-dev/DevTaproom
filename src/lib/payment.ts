/**
 * VietQR Payment Integration
 * 
 * Generates VietQR-compatible URLs that produce QR codes for bank transfers.
 * Uses the VietQR.IO quick link format for immediate use without API registration.
 * 
 * For production with webhooks, upgrade to VietQR.vn API (Pro/Plus).
 * 
 * Quick link format: https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png
 * With params: ?amount={amount}&addInfo={description}&accountName={name}
 */

// Bank configuration — update these with your actual bank details
const VIETQR_CONFIG = {
    bankId: 'BIDV',                      // Bank code (MB = MBBank, VCB = Vietcombank, TCB = Techcombank, etc.)
    accountNo: '8845478944',           // Your bank account number
    accountName: 'MAMASHEVA AKYLAI',            // Account holder name (no diacritics)
    template: 'compact2',             // QR template: compact, compact2, qr_only, print
};

/**
 * Generates a VietQR image URL for a specific payment
 */
export function generateVietQRUrl(
    amount: number,
    orderNumber: string,
    description?: string
): string {
    const { bankId, accountNo, accountName, template } = VIETQR_CONFIG;

    // Transfer content: order number for reconciliation (max 19 chars, no special chars)
    const addInfo = description || `${orderNumber}`;

    const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
    const params = new URLSearchParams({
        amount: amount.toString(),
        addInfo: addInfo,
        accountName: accountName,
    });

    return `${baseUrl}?${params.toString()}`;
}

/**
 * Generates VietQR data for custom QR rendering (if needed)
 */
export function generateVietQRData(
    amount: number,
    orderNumber: string,
): {
    bankId: string;
    accountNo: string;
    accountName: string;
    amount: number;
    description: string;
    qrImageUrl: string;
} {
    return {
        bankId: VIETQR_CONFIG.bankId,
        accountNo: VIETQR_CONFIG.accountNo,
        accountName: VIETQR_CONFIG.accountName,
        amount,
        description: orderNumber,
        qrImageUrl: generateVietQRUrl(amount, orderNumber),
    };
}

/**
 * List of supported banks for reference
 * Full list: https://api.vietqr.io/v2/banks
 */
export const POPULAR_BANKS = [
    { code: 'MB', name: 'MBBank' },
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'VTB', name: 'Vietinbank' },
] as const;
