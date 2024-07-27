(function () {
    const Test = {
        progressBarElement: null,
        prevButtonElement: null,
        nextButtonElement: null,
        passButtonElement: null,
        questionTitleElement: null,
        optionsElement: null,
        quiz: null,
        currentQuestionIndex: 1,      // переменная для индекса текущего вопроса
        userResult: [],       // переменная для хранения ответов на вопросы теста
        init() {
            // проверка введенных данных
            checkUserData();
            // проверка присланного id теста
            const url = new URL(location.href);
            const testId = url.searchParams.get('id');
            // проверить, существует ли этот параметр
            if (testId) {
                // если в адресе есть testId - запрос с сервера данных об этом конкретном тесте
                const xhr = new XMLHttpRequest();
                xhr.open('GET', 'https://testologia.ru/get-quiz?id=' + testId, false);
                // отправить запрос
                xhr.send();
                // проверить
                if (xhr.status === 200 && xhr.responseText) {
                    try {
                        // взять данные о тесте и разместить в переменную
                        this.quiz = JSON.parse(xhr.responseText);
                    } catch (e) {
                        location.href = 'index.html';
                    }
                    this.startQuiz();
                } else {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
        },
        // если все в порядке, начинается тест
        startQuiz() {
            // console.log(this.quiz);
            this.progressBarElement = document.getElementById('progress-bar');
            this.questionTitleElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');
            document.getElementById('pre-title').innerText = this.quiz.name;

            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this, 'next');   // bind - чтобы контекст не потерялся, next - передать осуществляемый action

            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this, 'pass');

            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this, 'prev');

            this.prepareProgressBar();
            this.showQuestion();

            // для таймера: переменная для элемента таймера, общее время и функция отсчета с шагом в 1000 мс
            const timerElement = document.getElementById('timer');
            let seconds = 59;
            const interval = setInterval(function () {
                seconds--;    // на каждом шаге значение seconds уменьшается на 1
                timerElement.innerText = seconds;   // отображение оставшихся секунд внутри часиков
                // если время закончится - вызов функции завершения теста
                if (seconds === 0) {
                    clearInterval(interval);  // остановит таймер на 0, не даст отсчету уйти в минус
                    this.complete();
                }
            }.bind(this),  // bind - чтобы передать вместе с этой функцией установленное значение this (не потерять контекст)
                1000);
        },

        prepareProgressBar() {
            // создать нужное количество элементов в прогресс-баре
            for (let i = 0; i <this.quiz.questions.length; i++) {
                // создать элементы в нем
                const itemElement = document.createElement('div');
                // добавить класс test-progress-bar-item + класс active для первого элемента либо ничего для остальных
                itemElement.className = 'test-progress-bar-item ' + (i === 0 ? 'active' : '');

                const itemCircleElement = document.createElement('div');
                itemCircleElement.className = 'test-progress-bar-item-circle';

                const itemTextElement = document.createElement('div');
                itemTextElement.className = 'test-progress-bar-item-text';
                itemTextElement.innerText = 'Вопрос ' + (i + 1);

                // добавить элементы друг в друга и в общий элемент
                itemElement.appendChild(itemCircleElement);
                itemElement.appendChild(itemTextElement);

                this.progressBarElement.appendChild(itemElement);

            }
        },

        // отображение текущего вопроса
        showQuestion() {
            // переменная с текущим активным вопросом
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = '<span>Вопрос ' + this.currentQuestionIndex + ':</span> ' + activeQuestion.question;

            // очистить элемент, удалить все варианты ответов, которые были (для старта и для перехода к следующему)
            this.optionsElement.innerHTML = '';

            // чтобы функция chooseAnswer не теряла контекст
            const that = this;

            // когда показывается вопрос, вызывается showQuestion(), в этот момент создается переменная для проверки, есть ли уже для этого вопроса какой-то сохраненный результат в массиве ответов (id вопроса сравнивается с id активного вопроса);
            // в переменную попадет запись из userResult, соответствующая выбранному варианту (null, если на вопрос еще не отвечали)
            const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);

            // создание структуры вариантов ответов
            // пройтись циклом по свойству answer
            activeQuestion.answers.forEach(answer => {
                // создание "test-question-option"
                const optionElement = document.createElement('div');
                optionElement.className = 'test-question-option';

                const inputId = 'answer-' + answer.id;

                // создание инпута (использовать айдишники, которые у ответов в базе)
                const inputElement = document.createElement('input');
                inputElement.className = 'option-answer';    // добавить инпутам отдельный класс, чтобы брать их по классу
                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', 'answer');
                inputElement.setAttribute('value', answer.id);

                // проверить, есть ли что-то в chosenOption
                if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    // если рассматривается и отрисовывается выбранный элемент, ему надо добавить checked
                    inputElement.setAttribute('checked', 'checked');
                }

                // добавление обработчика, чтобы при выборе варианта ответа кнопки становились активными
                inputElement.onchange = function () {
                    that.chooseAnswer();
                }

                // создание лейбла
                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                // созданные элементы добавить в optionElement по порядку, а потом все эти в this.optionsElement
                optionElement.appendChild(inputElement);
                optionElement.appendChild(labelElement);

                this.optionsElement.appendChild(optionElement);
            });

            // не делать кнопку неактивной, если был возврат назад (и там уже выбран ответ)
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                // сделать кнопку неактивной во всех стальных вопросах до выбора ответа
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }

          // у последнего вопроса д.б. не "пропустить", а "завершить"
            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } // если вопрос не последний, innerText "Далее" возвращается
            else {
                this.nextButtonElement.innerText = 'Далее';
            }
            // проверить, надо ли дизейблить кнопку "назад"
            if (this.currentQuestionIndex >1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else { // вернулись на первый вопрос и индекс его 1 (или меньше, что невозможно)
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled');

            this.passButtonElement.setAttribute('disabled', 'disabled');



        },
        // универсальная функция, когда куда-либо переходим
        move (action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

            //записать ответы в массив:
            // найти все элементы с классом и выбрать отмеченный
            // document.getElementsByClassName('option-answer') вернет коллекцию элементов, эту коллекцию надо превратить в массив и разместить его в переменную
                const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find(element => {
                    return element.checked;
                });

                // записать, какой ответ выбран
                let chosenAnswerId = null;
                if (chosenAnswer && chosenAnswer.value) {
                    chosenAnswerId = Number(chosenAnswer.value);   // переменная для хранения выбранного ответа (создана выше, заранее, чтобы если ответ не выбран, была она пустая)
                }

                // проверить, есть ли объект для такого questionId
                const existingResult = this.userResult.find(item => {
                    return item.questionId === activeQuestion.id
                });
                if (existingResult) {
                    existingResult.chosenAnswerId = chosenAnswerId;
                } else  {
                    // сохранить выбранные ответы
                    this.userResult.push({
                        questionId: activeQuestion.id,
                        chosenAnswerId: chosenAnswerId    // если вопрос пропущен, будет null, если ответ выбран - сюда сохранится id ответа
                    })
                }
                // console.log(this.userResult);

                // изменить индекс текущего вопроса
            if (action === 'next' || action === 'pass') {
                // увеличивается индекс текущего вопроса
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            // проверить, не больше ли индекс вопроса количества вопросов
            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();   // если больше, вызов функции завершения теста
                return;   // чтобы дальнейший код не выполнялся, не  показывался бы следующий вопрос и не менялся бы прогресс-бар
            }

            // изменить состояние прогресс-бара
            // пройтись по всем его элементам (массив из коллекции, цикл)
            Array.from(this.progressBarElement.children).forEach((item, index) => {
                // переменная для хранения индекса текущего вопроса
                const currentItemIndex = index + 1;

                // для каждого удалить классы complete и active и заново строить структуру
              item.classList.remove('complete');
              item.classList.remove('active');


            // определить, где находимся, по индексу вопроса, этому вопросу присвоить класс active, а предыдущим - complete
            if (currentItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currentItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
            })

            this.passButtonElement.removeAttribute('disabled');

            // отображается вопрос с новым индексом
            this.showQuestion();
        },

        // завершить тест, выбранные ответы отправить на сервер вместе с остальными данными, которые есть в url
        complete() {
            const url = new URL(location.href);
            const id = url.searchParams.get('id');
            const name = url.searchParams.get('name');
            const lastName = url.searchParams.get('lastName');
            const email = url.searchParams.get('email');

            const xhr = new XMLHttpRequest();       // запрос на сервер
            xhr.open('POST', 'https://testologia.ru/pass-quiz?id=' + id, false);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');  // чтобы сервер понял, что отправляются json-данные
            xhr.send(JSON.stringify({     // передать объект, превращенный в json-строку
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }));

            // массив чисто с ответами пользователя, взятыми из массива с результатами
            let resultArray = this.userResult.map(item =>
              item.chosenAnswerId
            );
            console.log(resultArray);
            console.log(this.userResult);

            // строка из массива с ответами пользователя, чтобы добавить ее в url
            let preparedResultArray = resultArray.join();

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    // взять данные о тесте и разместить в переменную
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
                if (result) {
                    // console.log(result);
                    // location.href = 'result.html?score=' + result.score + '&total=' + result.total + '&userAnswers=' + preparedResultArray;
                    location.href = 'result.html' + location.search + '&score=' + result.score + '&total=' + result.total + '&userAnswers=' + preparedResultArray;
                    // location.href = 'result.html';
                }
            } else {
                location.href = 'index.html';
            }
        }
    }

    Test.init();
})();