export function getCart(html_str) {
    var items = [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html_str, 'text/html');
    
    // 🔹 Ищем контейнеры товаров по стабильным частям классов (без хешей)
    const cartRows = doc.querySelectorAll('div[class*="CartItemNew"][class*="root"]');
    
    cartRows.forEach((block) => {
        var aggregatedArray = aggregate(block);
        if (aggregatedArray) {
            items.push(aggregatedArray);    
        }
    })
    
    // 🔹 Возвращаем ТОЧНО такой же формат, как было
    return JSON.stringify(items);
}

export function aggregate(block) {
    // 🔹 Вспомогательная функция: поиск элемента по стабильной части класса
    const findByClassPart = (part, tag = '*', suffix = '') => {
        return block.querySelector(`${tag}[class*="${part}"]${suffix}`);
    };
    
    // 🔹 Безопасное получение текста
    const getText = (part, tag = '*', suffix = '') => {
        return findByClassPart(part, tag, suffix)?.innerText?.trim() || null;
    };
    
    // 🔹 Безопасное получение value
    const getValue = (part, tag = '*', suffix = '') => {
        return findByClassPart(part, tag, suffix)?.value?.trim() || null;
    };
    
    // 🔹 Извлекаем поля только по стабильным частям имён классов
    const nameEl = getText('name__') || getText('name');
    const brandEl = getText('brand');
    const partNumberEl = getText('partsNumber', 'a') || getText('partsNumber');
    const overpriceEl = String(Math.ceil(Number(getText('overprice')?.replace(',', '.') / 5)) * 5) || null;
    const countEl = getValue('input', '', '[readonly]') || '1';

    // Если нет ключевых данных — возвращаем null (как в оригинале при ошибке)
    if (!brandEl || !partNumberEl) return null;

    const id = brandEl + "|" + partNumberEl + "|" + countEl + "|" + overpriceEl;

    const productList = {
        id: id,
        partName: nameEl,
        brand: brandEl,
        code: partNumberEl,
        count: countEl,
        price: overpriceEl
    };
    
    return productList;
}