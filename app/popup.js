import { getCart } from './modules/inlineScripts.js';
import { anyElement, str_to_obj, ROWCELLS } from './modules/utils.js';
import { getTab } from './modules/setConstants.js';


const REQUIRED_URL = "file:///C://Users//Danya//Desktop//tempFiles//rsko.html"; // FIXME
const MAX_LENGTH = 80;
const SERVER_URL = "http://127.0.0.1:5050";
const AUTH = null; // FIXME

var gds = createPartsList();
var have_elements = gds ? true : false;

let toastTimeout = null;
let hideTimeout = null;


document.addEventListener('DOMContentLoaded', () => {
    /* 
    Объявление элементов, которые будут учавствовать
    */
    const editContainer = document.getElementById('editOverlay');
    const closeEditor = document.getElementById('closeEdit');
    const tBody = document.getElementById('tableBody');

    const sendContainer = document.getElementById('sendOverlay');
    const closeSender = document.getElementById('closeSend');
    const inputName = document.getElementById('limited-input');
    const inputDescript = document.getElementById('area-input');
    const counterName = document.getElementById('char-counter');
    const sendServer = document.getElementById('send-to-server');

    const helpBtn = document.getElementById('helpBtn');
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const closeTutorial = document.getElementById('closeTutorial');

    const btnAdd = document.getElementById('btn-add');
    const btnEdit = document.getElementById('btn-edit');
    const btnSend = document.getElementById('btn-send');

    /* 
    Кнопка туториала
    */
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

    /* 
    Добавление товаров
    */
    btnAdd.addEventListener('click', async () => {
        try {
            // установка начальных значений
            const tab = await getTab() 
            
            // Проверка правильности вкладки
            if (tab.url !== REQUIRED_URL || !tab) {
                showToast(`Это не корзина <b>Rossko</b>!`, "red", 3000);
                return;
            }

            // Обработка полученных данных
            localStorage.clear();
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
            }).then(async (rawHTML) => {
                const res = getCart(rawHTML[0].result);
                
                localStorage.setItem("goods_import", res);
                localStorage.setItem("goods_list", res);
                
                gds = createPartsList();
                have_elements = true;
            }).finally(() => showToast("Список товаров обновлён.", "green"))

        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
        }
    });
    
    /* 
    Простмотр и редактирование
    */
    btnEdit.addEventListener('click', async () => {
        try {
            // Установка значений
            let inner = ``;
            
            // Обработка
            for (var product of gds) {
                console.log(product);
                inner += ROWCELLS.replace("$firm", product.brand)
                    .replace("$code", product.code)
                    .replace("$price", product.price)
                    .replace("$count", product.count);
            }

            // Отображение страницы
            tBody.innerHTML = inner;
            editContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
        }
    });

    /* 
    Заполнение формы
    */
    btnSend.addEventListener('click', () => {
        // Отображение страницы
        sendContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    /* 
    Ввод имени и описания соответственно
    */
    inputName.addEventListener('input', (event) => {
        if (event.target.value.length > MAX_LENGTH) {
            inputName.value = event.target.value.substring(0, MAX_LENGTH);
            showToast("Буфер <b>не может быть</b> превышен!", "yellow", 1000);
        }
        inputName.value = event.target.value;
        counterName.innerText = `${inputName.value.length} / 80`;
    });

    inputDescript.addEventListener('input', (event) => {
        inputDescript.value = event.target.value;
    })

    /* 
    Отправка на сервер непосредственно
    */
    sendServer.addEventListener('click', async () => {
        const docname = inputName.value.trim()
        const docdesc = inputDescript.value.trim()
        if (!docname) {
            showToast("Наименование <b>не может быть</b> пустым!", "yellow", 1000);
            return
        }
        if (!have_elements) {
            showToast("Нет данных для отправки", "yellow", 1000);
            return
        }

        chrome.runtime.sendMessage({ 
            action: "sendData",
            name: docname, 
            descryption: docdesc,
            productList: gds
        }, (response) => {
                // Обязательная проверка ошибок!
                if (chrome.runtime.lastError) {
                    console.error("Ошибка связи с фоновым скриптом:", 
                    chrome.runtime.lastError.message);
                    return;
                }

                console.log("Ответ от фонового скрипта:", response);
                // Обработка ответа
            }
        );

        localStorage.clear();
        have_elements = false;
        gds = [];

        inputName.value = '';
        inputDescript.value = '';

        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';

        showToast("Отлично! Запрос выполнен, ожидайте документ на сервере", "green", 1500) ;
    })
    
    closeEditor.addEventListener('click', () => {
        tBody.innerHTML = "";
        editContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    closeSender.addEventListener('click', () => {
        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

function createPartsList() {
    const rawGds = localStorage.getItem("goods_list");
    return str_to_obj(rawGds);
}

// async function sendData(_name, _desc, _data) {
//     return await fetch(SERVER_URL, {
//         method: 'POST',
//         headers: { 
//             'auth': AUTH,
//             'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify({
//             name: _name,
//             description: _desc,
//             productList: _data
//         }),
//         credentials: 'omit' // Не отправлять куки (безопаснее для локального сервера)
//     });
// }

function showToast(HTMLmessage, color, duration=1500) {
    // Отменяем все предыдущие действия
    if (toastTimeout) clearTimeout(toastTimeout);
    if (hideTimeout) clearTimeout(hideTimeout);

    let toast = null
    switch (color) {
        case "red":
            toast = document.querySelector('.bad-toast-notification');
            break;
        case "green":
            toast = document.querySelector('.good-toast-notification');
            break;
        case "yellow":
            toast = document.querySelector('.warn-toast-notification');
            break;
        default:
            toast = document.querySelector('.bad-toast-notification');
            break;
    }
    
    const msgEl = toast.querySelector('.toast-message');
    msgEl.innerHTML = HTMLmessage;


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
