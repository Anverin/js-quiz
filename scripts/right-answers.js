(function () {

    // получение массива с правильными ответами
    const RightAnswers = {
        answers: [],
        init() {
            // проверка присланного id теста
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            // проверить, существует ли этот параметр
            if (testId) {
                // если в адресе есть testId - запрос с сервера данных об этом конкретном тесте
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.ru/get-quiz-right?id=' + testId, false);
                // отправить запрос на сервер
                xhr.send();
                // проверить его успешность
                if (xhr.status === 200 && xhr.responseText) {
                    // распарсить строку (обернув в ловец ошибок)
                    try {
                        this.answers = JSON.parse(xhr.responseText)
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    console.log(this.answers);
                } else {
                    location.href = 'index.html';
                }
            }
        },
    }

    RightAnswers.init();

    // получение массива с ответами пользователя
    const url = new URL(location.href);
    // получается голая строка, взятая из куска url
    let userAnswers = url.searchParams.get('userAnswers');
    // превратить ее в массив (состоит из строк, содержащих числа)
    userAnswers.split(',');
    // превратить строки в настоящие числа
    let userAnswersArray = userAnswers.split(',').map(item => parseInt(item));
    // console.log(userAnswersArray);

    // получение варианта теста (вопросы и варианты ответов)
    const Test = {
        allQuestions: null,
        init() {
            // проверка присланного id теста
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            // проверить, существует ли этот параметр
            if (testId) {
                // если в адресе есть testId - запрос с сервера данных об этом конкретном тесте
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + testId, false);

                // отправить запрос на сервер
                xhr.send();
                // проверить его успешность
                if (xhr.status === 200 && xhr.responseText) {
                    // распарсить строку, находящуюся в xhr.responseText (обернув в ловец ошибок)
                    try {
                        this.allQuestions = JSON.parse(xhr.responseText)
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    // отображает элементы (вопросы + ответы тестов) на странице
                    this.displayQuizzes();
                    // отображает название варианта теста
                    this.displayTestTitle();
                } else {
                    location.href = 'index.html';
                }
                console.log(this.allQuestions);
                console.log(this.allQuestions.questions);
            }
        },

        // пишет название варианта теста
        displayTestTitle() {
            const testTitleElement = document.getElementById('result-test-name');
            testTitleElement.className = 'result-test-name';
            testTitleElement.innerText = this.allQuestions.name;
            console.log(this.allQuestions.name);
        },

        // создает элементы с вопросами теста на странице
        displayQuizzes() {
            // поиск родительского для всех вопросов элемента
            const allQuestionsElement = document.getElementById('questions');

            // если что-то есть в  allQuestions, и длина массива не 0
            if (this.allQuestions.questions && this.allQuestions.questions.length > 0) {
                // выполняется код для отображения его на странице
                this.allQuestions.questions.forEach((question, index) => {

                    // из массива пользовательских ответов берется значение элемента с индексом, равным индексу элемента массива вопросов, обрабатываемого в данный момент
                    let userAnswer = userAnswersArray[index];
                    // из массива правильных ответов то же
                    let rightAnswer = RightAnswers.answers[index];

                    // в переменную - результат вызова рисующей функции, куда передаются по одному элементу из массивов вопросов/ответов
                    let oneQuestionItem = this.displayOneQuestion(question, userAnswer, rightAnswer, index);
                   // вложить эту переменную (отрисованный вопрос) в родительский для всех вопросов элемент
                    allQuestionsElement.appendChild(oneQuestionItem);

                    // получить порядковый номер вопросов в массиве теста
                    let questionNumber = index;
                });
            }
        },

        // создание вопросов (по одному) для отображения на странице
        displayOneQuestion(question, userAnswer, rightAnswer, index) {
            // создание дива одного вопроса целиком
            const questionItemElement = document.createElement('div');
            questionItemElement.className = 'question';

            // создание дива заголовка вопроса
            const testQuestionTitleElement = document.createElement('div');
            testQuestionTitleElement.className = 'test-question-title';
            testQuestionTitleElement.classList.add('question-header');
            testQuestionTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;

            // создание дива всех вариантов ответов
            const testQuestionOptionsElement = document.createElement('div');
            testQuestionOptionsElement.className = 'test-question-options';

            // создание самих вариантов ответов: кружочек и текст
            // массив вопросов перебирается, для каждого вызывается рисующая функция
            question.answers.forEach(answer => {
                // создание дива одного варианта ответа
                const testQuestionOptionElement = document.createElement('div');
                testQuestionOptionElement.className = 'test-question-option';

                // создание кружочка
                const answerCircleElement = document.createElement('div');
                answerCircleElement.className = 'test-question-option-circle';

                // создание текста варианта ответа
                const answerTextElement = document.createElement('div');
                answerTextElement.className = 'test-question-option-text';
                answerTextElement.innerText = answer.answer;

                // в момент создания кружочка он окрашивается, если его id совпадает с id выбранного ответа (все выбранные должны окрашиваться)
                if (userAnswer && userAnswer === answer.id) {
                    // если ответ выбранный, проверяется дальше, правильный он или нет, и красится в нужный цвет
                    if (userAnswer === rightAnswer) {
                        answerCircleElement.classList.add('correct-answer-circle');
                        answerTextElement.classList.add('correct-answer');
                    } else {
                        answerCircleElement.classList.add('incorrect-answer-circle');
                        answerTextElement.classList.add('incorrect-answer');
                    }
                }

                //в див одного варианта ответа вкладываются кружочек и текст
                testQuestionOptionElement.appendChild(answerCircleElement);
                testQuestionOptionElement.appendChild(answerTextElement);
                // в див всех вариантов ответа вкладывается див одного варианта
                testQuestionOptionsElement.appendChild(testQuestionOptionElement);
            })

            // текст вопроса и див со всеми вариантами ответов вкладываются в див вопроса целиком
            questionItemElement.appendChild(testQuestionTitleElement);
            questionItemElement.appendChild(testQuestionOptionsElement);

            // функция возвращает созданный вопрос целиком
            return questionItemElement;
        }
    }

    Test.init();

    // возвращение по ссылкам обратно к результату теста
    document.getElementById('result-test').setAttribute('href', 'result.html' + location.search);
    document.getElementById('back-to-result').setAttribute('href', 'result.html' + location.search);

    // выведение имени пользователя над тестом
    const userDataElement = document.getElementById('user-data');
    const userDataTextElement = document.createElement('div');
    userDataTextElement.className = 'user-data-text';
    userDataTextElement.innerHTML = 'Тест выполнил ' + '<span>' + url.searchParams.get('name') + ' ' + url.searchParams.get('lastName') + ', ' + url.searchParams.get('email') + '</span>';
    userDataElement.appendChild(userDataTextElement);

})();


