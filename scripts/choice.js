(function () {
    const Choice = {
        quizzes: [],
        init() {
            checkUserData();

            // запрос тестов с сервера
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://testologia.ru/get-quizzes', false);
            // отправить запрос на сервер
            xhr.send();
            // проверить его успешность
            if (xhr.status === 200 && xhr.responseText) {
                // распарсить строку, находящуюся в xhr.responseText (обернув в ловец ошибок)
                try {
                    this.quizzes = JSON.parse(xhr.responseText)
                } catch (e) {
                    location.href = 'index.html';
                }
                // отображает элементы (названия тестов) на странице
                this.processQuizzes();
            } else {
                location.href = 'index.html';
            }
            // console.log(this.quizzes);
        },
        // создает элементы с названиями тестов на странице
        processQuizzes() {
            const choiceOptionsElement = document.getElementById('choice-options');
            // если что-то есть в quizzes, и длина массива не 0
            if (this.quizzes && this.quizzes.length > 0) {
                // выполняется код для отображения его на странице
                this.quizzes.forEach(quiz => {
                    const that = this;
                    const choiceOptionElement = document.createElement('div');
                    choiceOptionElement.className = 'choice-option';
                    // элементу присваивается id
                    choiceOptionElement.setAttribute('data-id', quiz.id);
                    choiceOptionElement.onclick = function () {
                        that.chooseQuiz(this);
                    }

                    const choiceOptionTextElement = document.createElement('div');
                    choiceOptionTextElement.className = 'choice-option-text';
                    choiceOptionTextElement.innerText = quiz.name;

                    const choiceOptionArrowElement = document.createElement('div');
                    choiceOptionArrowElement.className = 'choice-option-arrow';

                    const choiceOptionImageElement = document.createElement('img');
                    choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                    choiceOptionImageElement.setAttribute('alt', 'Стрелка');

                    choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                    choiceOptionElement.appendChild(choiceOptionTextElement);
                    choiceOptionElement.appendChild(choiceOptionArrowElement);

                    choiceOptionsElement.appendChild(choiceOptionElement);
                });
            }
        },

        chooseQuiz(element) {
            const dataId = element.getAttribute('data-id');
            if (dataId) {
                location.href = 'test.html' + location.search + '&id='+ dataId;
            }
        }
    }

    Choice.init();
})();