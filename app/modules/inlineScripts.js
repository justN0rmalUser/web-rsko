export function getCart(html_str) {
    var items = [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html_str, 'text/html');
    const cartRows = doc.querySelectorAll('.src-features-cart-components-CartItemNew-__style__centerBlock__VUSGz');

    cartRows.forEach((block) => {
        var aggregatedArray = aggregate(block);
        items.push(aggregatedArray);
    })
    return items;
}

export function aggregate(block) {
    // const nameEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__name__px5+y')[0].innerText || null;
    const brandEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__brand__eb6TV')[0].innerText || null;
    const partNumberEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__partsNumber__yDq9v')[0].innerText || null;
    const overpriceEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__overprice__C7Mb3')[0].innerText || null;
    // const defaultPriceEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__defaultPrice__wmMef')[0].innerText || null;
    const countEl = block.querySelector('.src-features-cart-components-CartItemNew-__style__input__I2zVG').value || null;
    
    const newArray = [
        // nameEl+"$",
        brandEl+"$",
        "$"+partNumberEl+"$",
        "$"+countEl+"$",
        "$"+overpriceEl+"!"
        // "$"+defaultPriceEl+"$",
    ];
    return newArray;
}