/**
 * Convert a number to words (Indian Rupees format)
 * @param num - The number to convert
 * @returns String representation in words
 */
export function numberToWords(num) {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanThousand(n) {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }

    function convertToWords(n) {
        if (n === 0) return 'Zero';

        const crore = Math.floor(n / 10000000);
        const lakh = Math.floor((n % 10000000) / 100000);
        const thousand = Math.floor((n % 100000) / 1000);
        const remainder = n % 1000;

        let result = '';

        if (crore > 0) {
            result += convertLessThanThousand(crore) + ' Crore ';
        }
        if (lakh > 0) {
            result += convertLessThanThousand(lakh) + ' Lakh ';
        }
        if (thousand > 0) {
            result += convertLessThanThousand(thousand) + ' Thousand ';
        }
        if (remainder > 0) {
            result += convertLessThanThousand(remainder);
        }

        return result.trim();
    }

    // Handle decimal part (paise)
    const [integerPart, decimalPart] = num.toFixed(2).split('.');
    const rupees = convertToWords(parseInt(integerPart));

    if (parseInt(decimalPart) > 0) {
        return `${rupees} Rupees and ${convertToWords(parseInt(decimalPart))} Paise`;
    }

    return rupees;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
}
