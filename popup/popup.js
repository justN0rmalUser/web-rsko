const REQUIRED_URL = "file:///C://Users//Danya//Desktop//tempFiles//rsko.html"; // FIXME

let toastTimeout = null;
let hideTimeout = null;


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
                showToast("Это не корзина Rossko!", 0);
                return;
            }
            
            await localStorage.clear();

            // Список распаршенных товаров
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
            })
            .then(async (rawHTML) => {
                res = await getelements(rawHTML[0].result);
                localStorage.setItem("goods_list", res);
                showToast("Список товаров обновлён.", 1);
            })

        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
        }

    });
    btnEdit.addEventListener('click', () => {
        alert('Функция "Редактировать" будет доступна в полной версии расширения');
        // TODO
    });
    btnSend.addEventListener('click', () => {
        alert('Функция "Отправить" будет доступна в полной версии расширения');
        // TODO
    });
});

function showToast(message, is_good_toast, duration = 1500) {
    // Отменяем все предыдущие действия
    if (toastTimeout) clearTimeout(toastTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    let toast = is_good_toast ? document.querySelector('.good-toast-notification') : document.querySelector('.bad-toast-notification');

    const msgEl = toast.querySelector('.toast-message');
    msgEl.textContent = message;

    // Сбрасываем классы и состояние
    toast.classList.remove('show');
    toast.classList.remove('hiding');
    toast.style.visibility = 'hidden'; // гарантируем скрытие

    void toast.offsetWidth; // reflow

    // Показываем
    toast.classList.add('show');
    toast.style.visibility = 'visible';

    // Планируем скрытие
    hideTimeout = setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hiding');

        // После анимации скрытия — полностью прячем
        toastTimeout = setTimeout(() => {
            toast.classList.remove('hiding');
            toast.style.visibility = 'hidden';
            // опционально: можно оставить как есть для переиспользования
        }, 300); // должно совпадать с длительностью fadeOut
    }, duration);
}

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