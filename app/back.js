const url = "http://localhost:5050/data";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'sendData') {
        req().then(result => sendResponse({success: true, answer: result}))
        // send(request.name, request.descryption, )
        //     .then(result => sendResponse({ success: true, answer: result }))
        //     .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Указывает Chrome, что ответ асинхронный
    }
});

async function send(name, descrypt, ) {
    // Валидация входных данных
    if (typeof data !== 'object' || data === null) {
        throw new TypeError('Аргумент "data" должен быть объектом');
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'auth': null, // TODO
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
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
        return await response.json();
    } catch (error) {
        // Детальное логирование для отладки
        console.error('[Extension POST Error]', {
            url,
            timestamp: new Date().toISOString(),
            originalError: error.message,
            stack: error.stack
        });
        throw error; // Пробрасываем ошибку для обработки вызывающим кодом
    }
}

async function req() {
    const response = await fetch("https://cat-fact.herokuapp.com/facts/random", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    if (response.ok) {
        console.log(response.json())
    }
}