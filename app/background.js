import { CONFIG } from "./modules/setConstants.js"; // SERVER_URL AUTH


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendData') {
        // req().then(result => sendResponse({success: true, answer: result}))
        send(request.name, request.description, request.data)
            .then(result => sendResponse({ success: true, answer: result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Указывает Chrome, что ответ асинхронный
    }
});

async function send(_name, _descrypt, _data) {
    // Валидация входных данных
    try {
        const response = await fetch(CONFIG.SERVER_URL, {
            method: 'POST',
            headers: {
                'auth': CONFIG.AUTH,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: _name,
                description: _descrypt,
                products: _data
            }),
            mode: 'cors', // Явное указание режима CORS
            credentials: 'omit' // Не отправлять куки (безопаснее для локального сервера)
        });

        // Проверка HTTP-статуса
        if (!response.ok) {
            const errorText = await response.json().catch(() => 'Неизвестная ошибка');
            throw new Error(`Сервер вернул ошибку ${response.status}: ${errorText}`);
        }

        // Проверка типа ответа перед парсингом
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            throw new TypeError('Сервер не вернул JSON в ответе');
        }

        // Возврат ответа
        return await response.json();
    } catch (error) {
        // Детальное логирование для отладки
        console.error('[Extension POST Error]', {
            url: CONFIG.SERVER_URL,
            timestamp: new Date().toISOString(),
            originalError: error.message,
            stack: error.stack
        });
        throw error; // Пробрасываем ошибку для обработки вызывающим кодом
    }
}
