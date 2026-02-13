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
        alert('Функция "Добавить" будет доступна в полной версии расширения');
        // TODO
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