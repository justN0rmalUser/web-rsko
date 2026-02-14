const REQUIRED_URL = "about:debugging#/runtime/this-firefox";

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


    btnAdd.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
            const tab = tabs[0];
            try {
                // Проверка правильности вкладки
                if (tab.url !== REQUIRED_URL) {throw new Error("не та страница");}

                chrome.runtime.sendMessage({ action: "getFullHTML" }, (fullHTML) => {
                    chrome.runtime.sendMessage({ action: "parseHTML", HTML: fullHTML }, (HTML) => {
                        alert(`success ${HTML}`)
                    })
                })
            } catch(err){
                console.error("❌ Ошибка:", err.message);
                alert(`Ошибка: ${err.message}`);
            }
        })
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