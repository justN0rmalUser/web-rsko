const REQUIRED_URL = "file:///C://Users//Danya//Desktop//tempFiles//rsko.html";

document.addEventListener('DOMContentLoaded', () => {
    const helpBtn = document.getElementById('helpBtn');
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const closeTutorial = document.getElementById('closeTutorial');

    const btnAdd = document.getElementById('btn-add');
    const btnEdit = document.getElementById('btn-edit');
    const btnSend = document.getElementById('btn-send');

    
    helpBtn.addEventListener('click', () => {
        tutorialOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    closeTutorial.addEventListener('click', () => {
        tutorialOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
    
    tutorialOverlay.addEventListener('click', (e) => {
        if (e.target === tutorialOverlay) {
            tutorialOverlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });


    btnAdd.addEventListener('click', async () => {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true
            }); 
            const tab = tabs[0];
            
            // Проверка правильности вкладки
            if (tab.url !== REQUIRED_URL || !tab) {
                throw new Error(`Не та вкладка ${tab.url}`);
            }
            
            // Список распаршенных товаров
            const gdsList = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
            })
            .then(async (rawHTML) => {
                res = await getelements(rawHTML[0].result);
                return res
            })

            console.log(`Проверка: ${gdsList}`);
            for (card of gdsList) {
                console.log(`товар: ${card}`);
                for (section of card) {
                    console.log(section);
                }
            }
        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
        }
    });
    document.querySelector('.btn-edit').addEventListener('click', () => {
        alert('Функция "Редактировать" будет доступна в полной версии расширения');
        // TODO
    });
    document.querySelector('.btn-send').addEventListener('click', () => {
        alert('Функция "Отправить" будет доступна в полной версии расширения');
        // TODO
    });
});


function getelements(html_str) {
    var items = [];
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html_str, 'text/html');
    const cartRows = doc.querySelectorAll('.src-features-cart-components-CartItemNew-__style__centerBlock__VUSGz');


    cartRows.forEach((block) => {
        aggregatedArray = aggregate(block);
        items.push(aggregatedArray);
    })
    return items;
}

function aggregate(block) {
    const nameEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__name__px5+y');
    const brandEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__brand__eb6TV');
    const partNumberEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__partsNumber__yDq9v');
    const overpriceEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__overprice__C7Mb3');
    const defaultPriceEl = block.getElementsByClassName('src-features-cart-components-CartItemNew-__style__defaultPrice__wmMef');
    const countEl = block.querySelector('.src-features-cart-components-CartItemNew-__style__input__I2zVG').value;
    
    const newArray = [
        nameEl[0].innerText,
        brandEl[0].innerText,
        partNumberEl[0].innerText,
        overpriceEl[0].innerText,
        defaultPriceEl[0].innerText,
        countEl
    ];
    return newArray;
}