import { getCart } from './modules/inlineScripts.js';


const REQUIRED_URL = "file:///C://Users//Danya//Desktop//tempFiles//rsko.html"; // FIXME
const MAX_LENGTH = 80;
const ROWCELLS = `<tr>
    <td>
        <div class="word">$firm</div>
        <hr class="divider">
        <div class="word">$code</div>
    </td>
    <td>$count</td>
    <td>$price</td>
</tr>
`;

var have_elements = false;
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
    const sendServer = document.getElementById("send-to-server");

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
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true
            }); 
            const tab = tabs[0];
            
            // Проверка правильности вкладки
            if (tab.url !== REQUIRED_URL || !tab) {
                showToast(`Это не корзина <b>Rossko</b>!`, "red", 3000);
                return;
            }
            
            localStorage.clear();

            // Список распаршенных товаров
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => document.documentElement.outerHTML
            })
            .then(async (rawHTML) => {
                const res = getCart(rawHTML[0].result);
                localStorage.setItem("goods_import", res);
                localStorage.setItem("goods_list", res);
                showToast("Список товаров обновлён.", "green");
            })

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
            var gds = localStorage.getItem("goods_list");
            
            if (anyElement(gds)) {
                gds = gds?.replaceAll("$$,", "$")
                    ?.replaceAll("$,$", "$")
                    ?.replaceAll(",", ".")
                    ?.replaceAll("$$", "");
            
                gds = gds.split("$");
            }

            editContainer.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            if (anyElement(gds)) {
                let innerHTML = ``;
                for (var i=0; i+3 < gds.length; i+=4) {
                    innerHTML += ROWCELLS
                        .replace("$firm", gds[i])
                        .replace("$code", gds[i+1])
                        .replace("$count", gds[i+2])
                        .replace("$price", gds[i+3])
                }
                tBody.innerHTML = innerHTML;
                have_elements = true;
            }
            

        } catch(err) {
            console.error("❌ Ошибка:", err.message);
            alert(`Ошибка: ${err.message}`);
        }
    });

    /* 
    Заполнение формы
    */
    btnSend.addEventListener('click', () => {
        sendContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
    });


    inputName.addEventListener('input', (event) => {
        console.log(event.target.value)
        inputName.value = event.target.value;

        if (event.target.value.length > MAX_LENGTH) {
            inputName.value = event.target.value.substring(0, MAX_LENGTH);
            showToast("Буфер <b>не может быть</b> превышен!", "yellow", 1000);
        }
        counterName.innerText = `${inputName.value.length} / 80`;
    });

    inputDescript.addEventListener('input', (event) => {
        inputDescript.value = event.target.value;
    })

    sendServer.addEventListener('click', () => {
        if (!inputName.value) {
            showToast("Наименование <b>не может быть</b> пустым!", "yellow", 1000);
            return
        }
        if (!have_elements) {
            showToast("Нет данных для отправки", "yellow", 1000);
            return
        }

        // chrome.runtime.sendMessage(
        //     { action: "sendData", name: inputName.value, descryption: inputDescript.value }, (response) => {
        //         // Обязательная проверка ошибок!
        //         if (chrome.runtime.lastError) {
        //             onsole.error("Ошибка связи с фоновым скриптом:", 
        //             chrome.runtime.lastError.message);
        //             return;
        //         }
                
        //         console.log("Ответ от фонового скрипта:", response);
        //         // Обработка ответа
        //     }
        // );

        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';

        showToast("Отлично! Запрос выполнен, ожидайте документ на сервере", "green", 1500) ;

        localStorage.clear();
        tBody.innerHTML = '';
        have_elements = false;
        inputName.value = null;
        inputDescript.value = null;
    })
    
    closeEditor.addEventListener('click', () => {
        editContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    closeSender.addEventListener('click', () => {
        sendContainer.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

function anyElement(arr) {
    switch (typeof(arr)) {
        case "object":
            if (arr) {
                let result = 0;
                for (var obj of arr) {
                    result += anyElement(obj);
                }
                return result;
            } else {
                return 0
            }
        case "number":
            return 1;
        case "string":
            return arr ? 1 : 0
        case "bigint":
            return 1;
        case "symbol":
            return arr ? 1 : 0
        default:
            return 0
    }
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
