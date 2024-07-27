(function () {
    const Result = {
        init() {
            const url = new URL(location.href);
            document.getElementById('result-score').innerText = url.searchParams.get('score') + '/' + url.searchParams.get('total');

            // переход на страницу правильных ответов
            document.getElementById('see-answers').setAttribute('href', 'right-answers.html' + location.search);
        }
    }

    Result.init();

})();