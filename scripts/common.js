function checkUserData() {
    // парсит url в переменную
        const url = new URL(location.href);
        // берет нужные параметры из этого url (в адресной строке)
        const name = url.searchParams.get('name');
        const lastName = url.searchParams.get('lastName');
        const email = url.searchParams.get('email');

        // если параметров не хватает, переход на главную страницу
        if (!name || !lastName || !email) {
            location.href = 'index.html';
        }
}