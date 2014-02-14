var sbDomain = 'http://surfingbird.ru',
    lang = chrome.i18n.getMessage('lang'),
    pageUrl = window.location.href,
    toolbarPath = chrome.extension.getURL('files/toolbar.html'),
    interestsPath = chrome.extension.getURL('files/interests.html'),
    likePath = chrome.extension.getURL('files/like.html'),
    unlikesPath = chrome.extension.getURL('files/unlike.html'),
    collectionsPath = chrome.extension.getURL('files/collections.html'),
    commentsPath = chrome.extension.getURL('files/comments.html'),
    toolbarHeight = 40,
    interestsPos = '370px',
    likePos = '110px',
    unLikePos = '170px',
    collectionsPos = '235px',
    commentsPos = ((lang == 'en') ? '583px' : '613px'),
    toolBar = '<iframe id="tb-surfingbird" src="'+ toolbarPath + '#' + window.location.href + '" style="background: #fff; border: none; display: block; height: 43px; left: 0; margin: 0; min-width: 1030px; position: fixed; padding: 0; top: 0; width: 100%; z-index: 10000100;">',  // html нашего тулбара
    interests = '<iframe id="tb-surfingbird-interests" src="'+ interestsPath +'" style="border: none; height: 431px; left: '+ interestsPos +'; margin: 0px; overflow: hidden; position: fixed; padding: 0px; top: 42px; width: 282px; z-index: 10000101; display: none;">',  // html интересов
    likeMenu = '<iframe id="tb-surfingbird-like" src="'+ likePath +'" style="border: none; height: 89px; left: '+ likePos +'; margin: 0px; overflow: hidden; position: fixed; padding: 0px; top: 42px; width: 180px; z-index: 10000101; display: none;">',  // html Like
    unLikeMenu = '<iframe id="tb-surfingbird-unlike" src="'+ unlikesPath +'" style="border: none; height: 118px; left: '+ unLikePos +'; margin: 0px; overflow: hidden; position: fixed; padding: 0px; top: 42px; width: 230px; z-index: 10000101; display: none;">',  // html unLike
    collections = '<iframe id="tb-surfingbird-collections" src="'+ collectionsPath +'" style="border: none; height: 431px; left: '+ collectionsPos +'; margin: 0px; overflow: hidden; position: fixed; padding: 0px; top: 42px; width: 282px; z-index: 10000101; display: none;">',  // html коллекций
    comments = '<iframe id="tb-surfingbird-comments" src="'+ commentsPath +'" style="border: none; height: 190px; left: '+ commentsPos +'; margin: 0px; overflow: hidden; position: fixed; padding: 0px; top: 42px; width: 302px; z-index: 10000101; display: none;">';  // html комментариев

$(document).ready(function () {
    chrome.extension.sendRequest({ action: 'TO_KNOW_STATE' }, function (response) {
        if (response.state === "on" && response.stateOnPage === "on") {
            openToolbar(response.surfer);
        }
    });
	
	// отмечаем URL как просмотренный
	chrome.extension.sendRequest({ action: 'SPY_URL' });
});

// собираем список всех дочерних элементов
function getElements(arrTagNames) {
    var all = [];
	
    for (var nTagName = 0; nTagName < arrTagNames.length; nTagName++) {
        var els = document.getElementsByTagName(arrTagNames[nTagName]);
        for (var nElement = 0; nElement < els.length; nElement++) {
            all.push(els[nElement]);
        }
    }
    return all;
}

// функция создания и открытия тулбара (предполагаем, что юзеру он надоел, поэтому скрываем его на всех страницах)
function openToolbar(surfer) {
    // если это ссылка на ютуб, задаем элементу #player высоту в размер окна - 50пк, иначе он станет нулевым
    if (document.location.href.search(/youtube.com\/embed|youtube.ru\/embed/) == -1) {
        var els = window.getElements(["div", "header"]);
		
        // двигаем на 40пк вниз все элементы с position = fixed, чтобы все красиво было
        $('body').css({ 'margin-top' : '43px', 'position' : 'relative', 'top' : '0' });
		
        for (var i = 0; i < els.length; i++) {
            var div = els[i];
			
            if (!div.suMoved) {
                var style = window.getComputedStyle(div);
				
                if (style.position == "fixed") {
                    var top = style.top,
                        nOldSpot = top ? parseInt(top) : 0,
                        nNewSpot = nOldSpot + toolbarHeight;
						
                    div.style.top = nNewSpot + 'px';
                    div.suMoved = true;
                }
            }
        }
    } else {
        // для ютуба
        $('body').css({'margin-top' : '0', 'top' : '0'});
    }

    if (surfer !== '0' && surfer !== null && surfer !== undefined) {
        $(interests).prependTo('body');
        $(likeMenu).prependTo('body');
        $(unLikeMenu).prependTo('body');
        $(collections).prependTo('body');
        $(comments).prependTo('body');
    }

    $(toolBar).prependTo('body');
}

// функция скрытия тулбара (предполагаем, что юзеру он надоел, поэтому скрываем его на всех страницах)
function closeToolbar() {
    if ($('iframe').is('#tb-surfingbird')) {
        $('body').css({ 'margin-top' : '0', 'position' : '', 'top' : '' });

            // возвращаем на место все элементы с position = fixed, чтобы все было, как было))
            var els = this.getElements(["div", "header"]);
            for (var i = 0; i < els.length; i++) {
                var div = els[i],
					style = window.getComputedStyle(div);
				
                if (style.position == 'fixed') {
                    var top = style.top,
                        nOldSpot = top ? parseInt(top) : 0,
                        nNewSpot = nOldSpot - toolbarHeight;
                        els[i].style.top = nNewSpot + 'px';
                        els[i].suMoved = false;
                }
            }
        $('#tb-surfingbird').remove();
        $('#tb-surfingbird-interests').remove();
        $('#tb-surfingbird-like').remove();
        $('#tb-surfingbird-unlike').remove();
        $('#tb-surfingbird-collections').remove();
        $('#tb-surfingbird-comments').remove();
		
        localStorage['toolbarState'] = 'off';
    }
}

// функция проверки наличия тулбара
function toolbarIsOn(sendResponse) {// получаем ID вкладки
    if (!$('iframe').is('#tb-surfingbird')) {
        sendResponse({
			toolbarState: 'off'
		});
    } else {
        sendResponse({
			toolbarState: 'on',
			tabUrl: pageUrl
		});
    }
}

// открываем интересы
function openInterests() {
    $('#tb-surfingbird-interests').toggle();
    $('#tb-surfingbird-like').css('display', 'none');
    $('#tb-surfingbird-unlike').css('display', 'none');
	$('#tb-surfingbird-collections').css('display', 'none');
    $('#tb-surfingbird-comments').css('display', 'none');
}

// открываем лайк
function openLike(cats, domain) {
    var height = cats * 29 + 60,
        width = ((domain.length * 7 + 100) < 190) ? 190 : (domain.length * 7 + 100);

    $('#tb-surfingbird-like').css('height', height + 'px'); // меняем высоту в зависимости от числа пунктов
    $('#tb-surfingbird-like').css('width', width + 'px'); // меняем ширину в зависимости от длины домена
    $('#tb-surfingbird-like').toggle();
    $('#tb-surfingbird-interests').css('display', 'none');
    $('#tb-surfingbird-unlike').css('display', 'none');
	$('#tb-surfingbird-collections').css('display', 'none');
    $('#tb-surfingbird-comments').css('display', 'none');
}

// открываем нелайк
function openUnlike(domain) {
    var width = ((domain.length * 7 + 150) < 200) ? 200 : (domain.length * 7 + 150);
	
    $('#tb-surfingbird-unlike').toggle();
    $('#tb-surfingbird-unlike').css('width', width + 'px'); // меняем ширину в зависимости от длины домена
    $('#tb-surfingbird-interests').css('display', 'none');
    $('#tb-surfingbird-like').css('display', 'none');
	$('#tb-surfingbird-collections').css('display', 'none');
    $('#tb-surfingbird-comments').css('display', 'none');
}

// открываем список коллекций
function openCollections() {
    $('#tb-surfingbird-collections').toggle();
    $('#tb-surfingbird-interests').css('display', 'none');
    $('#tb-surfingbird-like').css('display', 'none');
    $('#tb-surfingbird-unlike').css('display', 'none');
    $('#tb-surfingbird-comments').css('display', 'none');
}

// открываем комментарии
function openComments() {
    var height;
	
    $('#tb-surfingbird-collections').css('display', 'none');
    $('#tb-surfingbird-interests').css('display', 'none');
    $('#tb-surfingbird-like').css('display', 'none');
    $('#tb-surfingbird-unlike').css('display', 'none');
    $('#tb-surfingbird-comments').toggle();
}

// пререндер следующей страницы
function prerenderUrl(url) {
    $("<link />", { rel: "prerender", href: url }).appendTo("head");
}

// открываем интересы
function closePopups() {
    $('#tb-surfingbird-interests').css('display', 'none');
    $('#tb-surfingbird-like').css('display', 'none');
    $('#tb-surfingbird-unlike').css('display', 'none');
	$('#tb-surfingbird-collections').css('display', 'none');
    $('#tb-surfingbird-comments').css('display', 'none');
}

//
function createCollection(url) {
	if (location.href.search(/surfingbird.ru/) !== -1) {
		var expires_in = Math.floor(10000 * 24 * 60 * 60), // в секундах
            d = new Date(); d.setTime(d.getTime() + expires_in);
			
		document.cookie = "create-collection=" + url + ";expires=" + d + ";path='/';domain=";
	}
}

// здесь собраны экшены, которые выполняются в зависимости от запроса
function actions(request, sender, sendResponse) {
    switch (request.action) {
        case 'CLOSE_POPUPS':
            closePopups();
            break;
			
        case 'CLOSE_TOOLBAR':
            closeToolbar();
            break;

        case 'CREATE_COLLECTION':
            createCollection(request.url);
            break;

        case 'OPEN_COLLЕCTIONS_FRAME':
            openCollections();
            break;

        case 'OPEN_COMMENTS_FRAME':
            openComments();
            break;

        case 'OPEN_INTERESTS':
            openInterests();
            break;

        case 'OPEN_LIKE_FRAME':
            openLike(request.cats, request.domain);
            break;

        case 'OPEN_UNLIKE_FRAME':
            openUnlike(request.domain);
            break;

        case 'PRERENDER_URL':
            prerenderUrl(request.url);
            break;

        case 'TOOLBAR_IS_ON':
            toolbarIsOn(sendResponse);
            break;
    }
}

// ловим запросы от бэкграунда
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        actions(request, sender, sendResponse);
    });