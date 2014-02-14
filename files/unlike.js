    var categories = {
        "65" : chrome.i18n.getMessage('Design'),
        "51" : chrome.i18n.getMessage('Humor'),
        "49" : chrome.i18n.getMessage('Science'),
        "104" : chrome.i18n.getMessage('Cybersport'),
        "69" : chrome.i18n.getMessage('TVseries'),
        "80" : chrome.i18n.getMessage('Games'),
        "102" : chrome.i18n.getMessage('Medicine'),
        "95" : chrome.i18n.getMessage('Aviation'),
        "70" : chrome.i18n.getMessage('News'),
        "100" : chrome.i18n.getMessage('Nature'),
        "94" : chrome.i18n.getMessage('Work'),
        "60" : chrome.i18n.getMessage('Sport'),
        "61" : chrome.i18n.getMessage('Fitness'),
        "55" : chrome.i18n.getMessage('Shopping'),
        "92" : chrome.i18n.getMessage('Auto'),
        "91" : chrome.i18n.getMessage('Advertisment'),
        "47" : chrome.i18n.getMessage('Cartoons'),
        "78" : chrome.i18n.getMessage('Society'),
        "72" : chrome.i18n.getMessage('Scandals'),
        "85" : chrome.i18n.getMessage('Catastrophes'),
        "71" : chrome.i18n.getMessage('Celebrities'),
        "57" : chrome.i18n.getMessage('Fashion'),
        "105" : chrome.i18n.getMessage('Gifs'),
        "64" : chrome.i18n.getMessage('Books'),
        "66" : chrome.i18n.getMessage('Culture'),
        "54" : chrome.i18n.getMessage('Web'),
        "52" : chrome.i18n.getMessage('Computers'),
        "48" : chrome.i18n.getMessage('Movies'),
        "88" : chrome.i18n.getMessage('Children'),
        "56" : chrome.i18n.getMessage('Gadgets'),
        "68" : chrome.i18n.getMessage('Hobby'),
        "63" : chrome.i18n.getMessage('Technology'),
        "106" : chrome.i18n.getMessage('Telecom'),
        "107" : chrome.i18n.getMessage('Anime'),
        "73" : chrome.i18n.getMessage('Video'),
        "82" : chrome.i18n.getMessage('Erotic'),
        "103" : chrome.i18n.getMessage('Programming'),
        "67" : chrome.i18n.getMessage('Relationships'),
        "59" : chrome.i18n.getMessage('History'),
        "74" : chrome.i18n.getMessage('Travel'),
        "93" : chrome.i18n.getMessage('Moto'),
        "84" : chrome.i18n.getMessage('Crime'),
        "86" : chrome.i18n.getMessage('Economics'),
        "79" : chrome.i18n.getMessage('Travel'),
        "58" : chrome.i18n.getMessage('Blogs'),
        "81" : chrome.i18n.getMessage('Psychology'),
        "76" : chrome.i18n.getMessage('Music'),
        "75" : chrome.i18n.getMessage('Health'),
        "50" : chrome.i18n.getMessage('Photo'),
        "89" : chrome.i18n.getMessage('Education'),
        "83" : chrome.i18n.getMessage('Architecture'),
        "53" : chrome.i18n.getMessage('Food'),
        "108" : chrome.i18n.getMessage('Art'),
        "77" : chrome.i18n.getMessage('Religion'),
        "62" : chrome.i18n.getMessage('Animals'),
        "99" : chrome.i18n.getMessage('Pictures'),
        "109" : chrome.i18n.getMessage('Girls'),
        "110" : chrome.i18n.getMessage('Weapons'),
        "111" : chrome.i18n.getMessage('Beauty'),
        "112" : chrome.i18n.getMessage('Entertainment')
    };
        // получаем магию
        function getMagica () {
            $.ajax({
                url: 'http://surfingbird.ru/ajax/magickey',
                success: function(data) {
                    magica = data;
                }
            });
        }
        getMagica();

        $(document).ready(function () {
            var domainBtn = $('#domain'),
                adderBtn = $('#adder'),
                wrongBtn = $('#wrong-cat'),
                spamBtn = $('#spam'),
                sbDomain = 'http://surfingbird.ru',
                dontShow = chrome.i18n.getMessage('dontShow');

            getLocalization('Spam', '#spam');
            getLocalization('WrongCat', '#wrong-cat');

            chrome.extension.sendRequest({ action : 'UNLIKE_MENU' }, function (response) {
                if (response.url) {
                    var url = response.url.match(/:\/\/(.[^/]+)/)[1],
                        adder  = response.adder,
                        domain = (url.search('www.') == -1) ? 'www.' + url : url;

                    domainBtn.html(dontShow + ' ' + domain).attr("rel", url);
                    adderBtn.html(dontShow + ' ' + adder).attr("rel", adder);

                    // отправляем в черный список домен
                    function addDomainToBlacklist () {
                        var name = domainBtn.attr('rel');

                        $.ajax({
                            type: 'POST',
                            url: 'http://surfingbird.ru/ajax/user/add_blacklist',
                            dataType: 'json',
                            data: {
                                type: 'domains',
                                domain: name,
                                Magica: magica
                            },
                            success: function(data) {
                                magica = data.Magica;
                                if (data.status === 'ok') {
                                    chrome.extension.sendRequest({ action : 'SURF_CLICK' });
                                } else if (data.status === 'error') {
                                    switch (data.error_code) {
                                        case 'notfound':
                                            //SB.showMessage(null, 'Домен ' + surfOpt['domain'] + '  не найден!', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Домен ' + name + '  не найден!' });
                                            break;
                                        case 'unknown':
                                            //SB.showMessage(null, 'Произошла ошибка, попробуйте позднее', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            },
                            error: function(data) {
                                chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                            }
                        });
                    }

                    // отправляем в черный список юзера
                    function addUserToBlacklist () {
                        var name = adderBtn.attr('rel');

                        $.ajax({
                            type: 'POST',
                            url: 'http://surfingbird.ru/ajax/user/add_blacklist',
                            dataType: 'json',
                            data: {
                                type: 'users',
                                login: name,
                                Magica: magica
                            },
                            success: function(data) {
                                magica = data.Magica;
                                if (data.status === 'ok') {
                                    chrome.extension.sendRequest({ action : 'SURF_CLICK' });
                                } else if (data.status === 'error') {
                                    switch (data.error_code) {
                                        case 'notfound':
                                            //SB.showMessage(null, 'Домен ' + surfOpt['domain'] + '  не найден!', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Пользователь не найден!' });
                                            break;
                                        case 'unknown':
                                            //SB.showMessage(null, 'Произошла ошибка, попробуйте позднее', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            },
                            error: function(data) {
                                chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                            }
                        });
                    }

                    // отправляем репорт о неверной категории
                    function wrongCategory () {
                        $.ajax({
                            type: 'POST',
                            url: 'http://surfingbird.ru/ajax/report_wrong_cat',
                            dataType: 'json',
                            data: {
                                url_id: response.shortUrl,
                                Magica: magica
                            },
                            success: function(data) {
                                magica = data.Magica;
                                if (data.type === 'success') {
                                    chrome.extension.sendRequest({ action : 'SURF_CLICK' });
                                } else if (data.type === 'error') {
                                    switch (data.code) {
                                        case 'notfound':
                                            //SB.showMessage(null, 'Cайт не найден!', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Cайт не найден!' });
                                            break;
                                        case 'unknow':
                                            //SB.showMessage(null, 'Произошла ошибка, попробуйте позднее', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                                            break;
                                        default:
                                            break;
                                   }
                                }
                            },
                            error: function(data) {
                                chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                            }
                        });
                    }

                    // отправляем репорт о неверной категории
                    function spam () {
                        $.ajax({
                            type: 'POST',
                            url: 'http://surfingbird.ru/ajax/report_spam',
                            dataType: 'json',
                            data: {
                                url_id: response.shortUrl,
                                Magica: magica
                            },
                            success: function(data) {
                                magica = data.Magica;
                                if (data.type === 'success') {
                                    chrome.extension.sendRequest({ action : 'SURF_CLICK' });
                                } else if (data.type === 'error') {
                                    switch (data.code) {
                                        case 'notfound':
                                            //SB.showMessage(null, 'Cайт не найден!', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Cайт не найден!' });
                                            break;
                                        case 'unknow':
                                            //SB.showMessage(null, 'Произошла ошибка, попробуйте позднее', 'error');
                                            chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            },
                            error: function(data) {
                                chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
                            }
                        });
                    }

                    domainBtn.bind('click', function (event) {
                        event.preventDefault();
                        addDomainToBlacklist();
                    });

                    adderBtn.bind('click', function (event) {
                        event.preventDefault();
                        addUserToBlacklist();
                    });

                    wrongBtn.bind('click', function (event) {
                        event.preventDefault();
                        wrongCategory();
                    });

                     spamBtn.bind('click', function (event) {
                        event.preventDefault();
                        spam();
                    });
                }
            });
        });

    // локализуем наш тулбар, получаем строку из файла локализации и подставляем в нужный тег
    function getLocalization(msg, tag) {
        var message = chrome.i18n.getMessage(msg);
        if ($(tag).is('span')) {
            $(tag).html(message);
        } else if($(tag).is('i') || $(tag).is('li')) {
            if ($(tag).hasClass('b-button__icon')) {
                $(tag).parent().attr('title', message);
            } else {
                $(tag).html(message);
            }
        } else if ($(tag).is('a')) {
            $(tag).html(message);
            $(tag).attr('title', message);
        } else if ($(tag).is('input')) {
            $(tag).attr('value', message);
        }
    }
