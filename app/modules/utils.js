export function anyElement(gdsArray) {
    switch (typeof(gdsArray)) {
        case 'object':
            if (!Array.isArray(gdsArray)) {
                return false;
            }

            return gdsArray.some(product => {
                product.brand && product.code && product.price && product.count
            }); 
        default:
            return false;
    }
}

export function str_to_obj(data) {
    var result = [];
    switch (typeof(data)) {
        case 'string':
            if (!data) {
                return result;
            }    
            
            data = data.slice(0, -1);
            const dataList = data.split('!,');
            
            dataList.forEach(product => {
                var propertiesList = product.replaceAll(",", ".").split("$.$");
                console.log(propertiesList);
                const prod = new Product(
                    propertiesList[0], 
                    propertiesList[1], 
                    propertiesList[2],
                    propertiesList[3]
                );
                console.log(prod);
                result.push(prod);
                console.log(result);
            });

            return result;
        default:
            console.log(`${typeof(gdsArray)}; хуй знает че`)
            return result;
    }
}

export const ROWCELLS = `<tr>
    <td>
        <div class="word">$firm</div>
        <hr class="divider">
        <div class="word">$code</div>
    </td>
    <td>$count</td>
    <td>$price</td>
</tr>
`;

export class Product {
    constructor(brand, code, count, price) {
        this.brand = brand;
        this.code = code;
        this.count = count;
        this.price = price;
    }
}