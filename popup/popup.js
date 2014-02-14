var backgroundPage = chrome.extension.getBackgroundPage(); // переменная, которая помогает нам связываться с бэкграунд пейдж

// локализуем наш тулбар, получаем строку из файла локализации и подставляем в нужный тег
function getLocalization(msg, tag) {
    var message = chrome.i18n.getMessage(msg);
	
    if ($(tag).is('span')) {
        $(tag).html(message);
    } else if($(tag).is('i')) {
        if ($(tag).hasClass('b-button__icon')) {
            $(tag).parent().attr('title', message);
        } else {
            $(tag).html(message);
        }
    } else if ($(tag).is('a')) {
        if ($(tag).hasClass('b-button_size_small')) {
            $(tag).attr('title', message);
        } else {
            $(tag).html(message);
            $(tag).attr('title', message);
        }
    } else if ($(tag).is('input')) {
        $(tag).attr('value', message);
    }
}

$(document).ready(function () {
    getLocalization('Feed', '#lenta');
    getLocalization('Profile', '#profile');
    getLocalization('Settings', '#settings');
    getLocalization('CloseToolbar', '#toolbar');
    getLocalization('Logout', '#logout');

    // переходим Домой
    $('#lenta').on('click', function (event) {
        chrome.tabs.create({ url: event.target.href });
        window.close();
    });

    // переходим в Профиль
    $('#profile').on('click', function (event) {
        backgroundPage.SBTB.openProfile();
        //chrome.tabs.create({ url: event.target.href });
        window.close();
    });

    // переходим в Настройки
    $('#settings').on('click', function (event) {
        chrome.tabs.create({ url: event.target.href });
        window.close();
    });

    // врубаем наш тулбар
    $('#toolbar').on('click', function (event) {
        backgroundPage.SBTB.closeToolbar();
        window.close();
    });

    // разлогиниваемся
   $('#logout').on('click', function (event) {
        chrome.tabs.create({ url: event.target.href });
        window.close();
   });
});

// проверяем авторизован ли юзер
if (backgroundPage.SBTB.getProfile(function (userName) {}) != '') {
    $('#profile').removeClass('hide');
    $('#settings').removeClass('hide');
    $('#logout').removeClass('hide');
}

// отлавливаем нажатие иконки расширения в браузере
backgroundPage.SBTB.onBrowserActionClicked(function (showPopup) {
    if (showPopup) {
        window.close();
    }
});