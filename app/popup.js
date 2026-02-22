import { getCart } from './modules/inlineScripts.js';
import { toIterable, ROWCELLS } from './modules/utils.js';
import { getTab } from './modules/setConstants.js';


const HOST_URL = "kuban.rossko.ru"; // FIXME
const PATH_URL = "/cart/";
const MAX_LENGTH = 80;

var gds = getPartsList();

let toastTimeout = null;
let hideTimeout = null;


document.addEventListener('DOMContentLoaded', () => {
    /* 
    Объявление элементов, которые будут учавствовать
    */
    const editContainer = document.getElementById('editOverlay');
    const closeEditor = document.getElementById('closeEdit');
    const resetEditor = document.getElementById('resetEdit');
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
            const tab = await getTab(); 
            const url = new URL(tab.url);
            console.log(url);   
            
            // Проверка правильности вкладки
            if (url.hostname !== HOST_URL || url.pathname !== PATH_URL) {
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
                
                gds = getPartsList();
            }).finally(() => showToast("Список товаров обновлён.", "green"))

        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
            listClear();
        }
    });
    
    /* 
    Простмотр и редактирование
    */
    btnEdit.addEventListener('click', async () => {
        try {
            // Обработка
            if (gds.length) {
                renderList();
            }
            
            // Отображение страницы
            tBody.addEventListener('click', handleClick);

            editContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
            listClear();
        }
    });

    resetEditor.addEventListener('click', async () => {
        gds = resetPartsList();
        if (gds.length) {
            renderList();
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
        if (!gds.length) {
            showToast("Нет данных для отправки", "yellow", 1000);
            return
        }


        chrome.runtime.sendMessage({ 
            action: "sendData",
            name: docname, 
            description: docdesc,
            data: gds
        }, (response) => {
                // Обязательная проверка ошибок!
                if (chrome.runtime.lastError) {
                    console.error("Ошибка связи с фоновым скриптом:", 
                    chrome.runtime.lastError.message);
                    return;
                }

                console.log("Ответ от фонового скрипта:", response);
                console.log(response.success);
                response.success ? showToast("Документ создан. Проверяйте <b>AutoDealer</b>!", "blue", 3000) : showToast("Ошибка создания документа!", "red", 3000);
            }
        )

        listClear()

        inputName.value = '';
        inputDescript.value = '';
        counterName.innerText = '0 / 80';

        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    })
    
    closeEditor.addEventListener('click', () => {
        tBody.innerHTML = "";
        tBody.removeEventListener('click', handleClick);
        editContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    closeSender.addEventListener('click', () => {
        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

function resetPartsList() {
    const rawGds = localStorage.getItem("goods_import");
    localStorage.setItem("goods_list", JSON.stringify(rawGds));
    return toIterable(JSON.parse(rawGds));
}

function getPartsList() {
    const rawGds = localStorage.getItem("goods_list");
    console.log(rawGds);
    return toIterable(JSON.parse(rawGds));
}

function deleteItem(id) {
    const len = gds.length;
    for (var i=0; i < len; i++) {
        if (gds[i].id === id) {
            gds.splice(i, 1);
            break;
        }
    }
    localStorage.setItem("goods_list", JSON.stringify(gds));
    gds = getPartsList();
}

function listClear() {
    localStorage.clear();
    gds = [];
}


function handleClick(event) {
    var row = event.target.closest('tr');
    console.log('Клик по строке:', row);
    const body = document.querySelector('tbody'); 
    body.removeChild(row);
    deleteItem(row.id);
}

function renderList() {
    let inner = ``;
    for (var product of gds) {
        console.log(product);
        inner += ROWCELLS.replace("$id", `id="${product.id}"`)
            .replace("$firm", product.brand)
            .replace("$code", product.code)
            .replace("$price", product.price)
            .replace("$count", product.count);
    }
    const body = document.getElementById('tableBody');
    body.innerHTML = inner;
}

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
        case "blue":
            toast = document.querySelector('.blue-toast-notification');
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
