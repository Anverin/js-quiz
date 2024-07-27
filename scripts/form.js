// создать самовызывающуюся фукнцию, чтобы этот код не был доступен как глобальные объекты (сделать закрытые scope, к которому у пользователя никогда не будет доступа, для безопасности)
// (function () {
// })();

(function () {
    // объект, внутри которого функции
    const Form = {
        // свойство для значения чекбокса
        agreeElement: null,
        // свойство для кнопки
        processElement: null,
        // свойство fields содержит поля, для которых нужна валидация
        fields: [
            {
                name: 'name',
                id: 'name',
                element: null,
                regex: /^[А-Я][а-я]+\s*$/,    // регулярное выражение для валидации
                valid: false  // валидно ли поле в момент времени
            },
            {
                name: 'lastName',
                id: 'last-name',
                element: null,
                regex: /^[А-Я][а-я]+\s*$/
            },
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            },
        ],
        // повесить обработчики на поля - функция init
        init () {
            // в переменную that попадает текущий контент (ссылка на весь объект Form), чтобы его было видно дальше, даже при потере контекста
            const that = this;
            this.fields.forEach(item => {
                item.element = document.getElementById(item.id);   // в свойство element разместится нужный элемент, когда цикл пройдется
                item.element.onchange = function () {
                    that.validateField.call(that, item, this)   // контекст и два параметра (элемент массива и ссылку на html-объект, найденный по id, который является местным контекстом для функции, вызывающейся при изменении поля)
// при изменении значения в каждом инпуте будет вызываться validateField, куда будет передаваться текущий field + ссылка на сам элемент через this
                }
            });

            // разместить кнопку в новый элемент
            this.processElement = document.getElementById('process');
            // и добавить ей обработчик событий
            this.processElement.onclick = function () {
                that.processForm();
            }

            // валидация чекбокса, для чего вызывается validateForm
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                // that вместо this, чтобы в замыкании разместить свойство this
                that.validateForm();
            }

        },
        validateField(field, element) {
            // если поле не заполнено или содержимое не совпадает с регуляркой
            if(!element.value || !element.value.match(field.regex)) {
                element.parentNode.style.borderColor = 'red';
                field.valid = false;
            } else {
                // возвращаются обычные стили и в свойство valid записывается true
                element.parentNode.removeAttribute('style');
                field.valid = true;
            }
            this.validateForm();   // вызвать validateForm после заполнения одного (каждого) поля
        },

        // проверить, заполнена ли вся форма и можно ли разблокировать кнопку
        validateForm() {
            const validForm = this.fields.every(item => item.valid);
            // переменная со значением валидации
            const isValid = this.agreeElement.checked && validForm;
            if (isValid) {
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');   // при удалении значений из полей кнопка снова заблокируется
            }
            return isValid;
        },

        // перекидывает значения через url
        // заново делает валидацию формы при нажатии на кнопку (вызывается при нажатии на кнопку), даже если валидация уже была
        processForm() {
            if (this.validateForm()) {
                // в новую строку размещается значение каждого параметра
                let paramString = '';
                // обходит массив fields и добавляет в строку каждый параметр поочередно
                this.fields.forEach(item => {
                    // тернарный оператор проверяет, есть ли что-то в строке, если нет - добавляет ?, если есть - &; так формируется строка, которую нужно передать дальше
                    // + по циклу добавляется name и его значение
                    paramString += (!paramString ? '?' : '&') + item.name + '=' + item.element.value;
                })

                location.href = 'choice.html' + paramString;
            }
        }

    };

    Form.init(); // сразу же вызывается

})();