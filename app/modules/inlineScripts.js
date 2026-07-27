export function extractCartFromPage() {
    const findFirst = (root, selectors) => {
        for (const selector of selectors) {
            const element = root.querySelector(selector);
            if (element) return element;
        }
        return null;
    };

    const getText = (root, selectors) => {
        return findFirst(root, selectors)?.textContent?.trim() || null;
    };

    const parsePrice = (value) => {
        if (!value) return null;

        const compactValue = String(value)
            .replace(/[\s\u00A0\u202F₽]/g, '')
            .replace(/[^\d,.-]/g, '');

        if (!compactValue) return null;

        const lastComma = compactValue.lastIndexOf(',');
        const lastDot = compactValue.lastIndexOf('.');
        const decimalSeparator = Math.max(lastComma, lastDot);
        const fractionLength = decimalSeparator >= 0
            ? compactValue.length - decimalSeparator - 1
            : 0;

        let normalizedValue;
        if (decimalSeparator >= 0 && fractionLength > 0 && fractionLength <= 2) {
            const integerPart = compactValue
                .slice(0, decimalSeparator)
                .replace(/[.,]/g, '');
            const fractionPart = compactValue
                .slice(decimalSeparator + 1)
                .replace(/\D/g, '');

            normalizedValue = `${integerPart}.${fractionPart}`;
        } else {
            normalizedValue = compactValue.replace(/[.,]/g, '');
        }

        const numericValue = Number(normalizedValue);
        if (!Number.isFinite(numericValue) || numericValue <= 0) return null;

        return Math.ceil(numericValue / 5) * 5;
    };

    const cardSelectors = [
        'div[class*="CartItemNew"][class*="root"]',
        '[class*="CartItemNew"][class*="root"]'
    ];
    const cartRows = document.querySelectorAll(cardSelectors.join(','));

    const products = [];
    const errors = [];

    cartRows.forEach((block, index) => {
        const partName = getText(block, [
            '[class*="CartItemNew"][class*="name__"]',
            '[class*="name__"]',
            '[class*="name"]'
        ]);
        const brand = getText(block, [
            '[class*="CartItemNew"][class*="brand__"]',
            '[class*="brand"]'
        ]);
        const code = getText(block, [
            '[data-testid="partsNumber"] a',
            '[data-testid="partsNumber"]',
            'a[class*="partsNumber"]',
            '[class*="partsNumber"]'
        ]);
        const rawPrice = getText(block, [
            '[class*="CartItemNew"][class*="price__"]',
            '[class*="overprice"]',
            '[class*="price__"]'
        ]);
        const countInput = findFirst(block, [
            'input[data-testid="input-counter"]',
            'input[class*="CartItemNew"][class*="input"][readonly]',
            'input[class*="input"][readonly]',
            'input[class*="input"]',
            'input[type="number"]'
        ]);
        const rawCount = countInput?.value?.trim() || null;

        const parsedPrice = parsePrice(rawPrice);
        const hasValidCountFormat = /^\d+$/.test(rawCount || '');
        const parsedCount = hasValidCountFormat ? Number(rawCount) : NaN;
        const invalidFields = [];

        if (!partName) invalidFields.push('partName');
        if (!brand) invalidFields.push('brand');
        if (!code) invalidFields.push('code');
        if (!Number.isSafeInteger(parsedCount) || parsedCount <= 0) {
            invalidFields.push('count');
        }
        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            invalidFields.push('price');
        }

        if (invalidFields.length) {
            errors.push({
                row: index + 1,
                fields: invalidFields,
                raw: {
                    partName,
                    brand,
                    code,
                    count: rawCount,
                    price: rawPrice
                }
            });
            return;
        }

        const count = String(parsedCount);
        const price = String(parsedPrice);
        const id = `${brand}|${code}|${count}|${price}`;

        products.push({
            id,
            partName,
            brand,
            code,
            count,
            price
        });
    });

    return {
        products,
        errors,
        meta: {
            foundRows: cartRows.length,
            url: location.href
        }
    };
}
