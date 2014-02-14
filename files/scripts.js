$(document).ready(function () {
var sbDomain = 'http://surfingbird.ru',
    errorDiv = $('#tb-surfingbird #b-error'),
    toolbar = $('.b-toolbar'),
    magica,
    isBlock = false,
    isVote = false,
	elemCss = document.createElement('link'),
	pathCSS = chrome.extension.getURL('files/toolbar.css'),
	loginForm = $('#b-login-form'),
	invalidAuth = chrome.i18n.getMessage('msgInvalid'),
	pageUrl,
	
	categories = {
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
	
    elemCss.setAttribute('rel', 'stylesheet');
    elemCss.setAttribute('href', pathCSS);
	
    document.body.appendChild(elemCss);

    chrome.extension.sendRequest({ action: 'TO_KNOW_URL' }, function (response) {
        var pageUrl = response.url;
		
        return pageUrl;
    });

    chrome.extension.sendRequest({
		action: 'OPEN_TOOLBAR'
	});

    getMagica();
	
	
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

	// получаем магию
	function getMagica () {
		$.ajax({
			url: sbDomain + '/ajax/magickey',
			success: function(data) {
				magica = data;
			}
		});
	}

	// функция создания и открытия тулбара
	function formingToolbar(request) {
		var loginPlease = chrome.i18n.getMessage('msgAutorize');

		getLocalization('msgSurf', '#surf-btn .b-button__text');
		getLocalization('msgLike', '#like .b-button__text');
		getLocalization('msgUnlike', '#dontlike .b-button__text');
		getLocalization('msgAdded', '#dontlike .b-button__text');
		getLocalization('msgUnlike', '#dontlike .b-button__text');
		getLocalization('Registration', '.surf-auth .surf-auth__reg');
		getLocalization('Login', '#login');
		getLocalization('Password', '#pass');
		getLocalization('Enter', '#enter-btn .b-button__text');
		getLocalization('msgHome', '#home-btn .b-button__icon');
		getLocalization('msgClose', '#close-btn .b-button__icon');
		getLocalization('msgComments', '#surf-comm .b-button__icon');
		getLocalization('msgFavorites', '#soc-fav .b-button__icon');
		getLocalization('msgShareFB', '#soc-fb .b-button__icon');
		getLocalization('msgShareTW', '#soc-tw .b-button__icon');
		getLocalization('msgShareVK', '#soc-vk .b-button__icon');

		if (request.status === 'ok') {
			var socNetwork = {
					twUrl:'http://twitter.com/share?text=' + encodeURIComponent(request.title) + '&url=',
					fbUrl:'http://www.facebook.com/sharer.php?u=',
					vkUrl:'http://vk.com/share.php?title=' + encodeURIComponent(request.title) + '&description=&image=' + encodeURIComponent('/thumb/' + request.shortUrl) + '&url='
				},
				arrList = $('#soc-tw, #soc-vk, #soc-fb'),
				lang = chrome.i18n.getMessage('lang'),
				sex;

			if (lang === 'ru') {
				sex = (request.sex === 0) ? 'добавила: ' : 'добавил: ';
			} else if (lang === 'en') {
				sex = 'added: ';
			}

			$('.soc, .liker, #fav, #surf-category, #home, #adder, #comm, .chan').removeClass('hide');
			//$('#comment-cnt').text(request.comments);
			$('#comment-cnt, #surf-comm').attr('href', 'http://surfingbird.ru/page/' + request.shortUrl);
			$('#adder-name').html('<a id="b-toolbar__username" class="b-toolbar__username" href="' + sbDomain + '/surfer/' + request.added + '" target="_blank">' + request.added + '</a>');

			$('#like, #dontlike').attr('href', request.url);

			if (categories[request.filter]) {
				$('#surf-category__input').html(categories[request.filter]);
			} else if (request.filter === 'all') {
				$('#surf-category__input').html(chrome.i18n.getMessage('msgAllInterests'));
			} else {
				$('#surf-category__input').html(request.filter);
			}

			if (request.vote === 1) {
				$('#like').addClass('b-button_state_active').attr('href');
			} else if (request.vote === '-1') {
				$('#dontlike').addClass('b-button_state_active');
			}

			if (request.favorite !== 0) {
				$('#soc-fav').addClass('b-button_state_active').attr('href', '/unfav');
			} else {
				$('#soc-fav').attr('href', '/fav');
			}

			// биндим события на наши батоны
			toolbar.on('click', '#surf-btn', function (event) {
				event.preventDefault();
				$('#surf-btn').addClass('b-button_type_ajax').find('.b-button__icon').removeClass('hide');
				//$('#surf-btn').find('.b-button__text').addClass('hide');
				surfClick(request.filter);
			});


			// шарим в социальные сети
			toolbar.on('click', '#soc-fb', function (event) {
				share('fb');
			});

			toolbar.on('click', '#soc-vk', function (event) {
				share('vk');
			});

			toolbar.on('click', '#soc-tw', function (event) {
				share('tw');
			});

			// функция шары
			function share(type) {
				var screenSize = {
						height: 800,
						width: 1000
					},
					heightWind = 500, widthWind = 600,
					leftCoor = Math.round((screenSize.width / 2) - (widthWind / 2)),
					topCoor = screenSize.height > heightWind ? Math.round((screenSize.height / 2) - (heightWind / 2)) : 0;

				event.preventDefault();
				switch (type) {
					case 'tw':
						window.open(socNetwork.twUrl + encodeURIComponent('http://surfingbird.ru/surf/' + request.shortUrl), 'twittWin', "left=" + leftCoor + "px, top=" + topCoor + "px, width=" + widthWind + "px, height=" + heightWind + "px, personalbar=0, toolbar=0, scrollbars=1, resizable=1");
						break;
					case 'fb':
						window.open(socNetwork.fbUrl + encodeURIComponent('http://surfingbird.ru/surf/' + request.shortUrl), 'facebookWin', "left=" + leftCoor + "px, top=" + topCoor + "px, width=" + widthWind + "px, height=" + heightWind + "px, personalbar=0, toolbar=0, scrollbars=1, resizable=1");
						break;
					case 'vk':
						window.open(socNetwork.vkUrl + encodeURIComponent('http://surfingbird.ru/surf/' + request.shortUrl), 'vkontakteWin', "left=" + leftCoor + "px, top=" + topCoor + "px, width=" + widthWind + "px, height=" + heightWind + "px, personalbar=0, toolbar=0, scrollbars=1, resizable=1");
						break;
					default:
						break;
				}
			}
			
			// открываем фрейм с комментариями
			/*$('#surf-comm').on('click', function (event) {
				event.preventDefault();
				chrome.extension.sendRequest({ action : 'OPEN_COMMENTS' });
			});*/
			
			// открываем фрейм с нелайком
			toolbar.on('click', '#dontlike-opt', function (event) {
				chrome.extension.sendRequest({ action : 'OPEN_UNLIKE' });
			});

			// открываем фрейм с лайком
			toolbar.on('click', '#like-opt', function (event) {
				chrome.extension.sendRequest({ action : 'OPEN_LIKE', cats : request.cats.length });
			});

			// открываем фрейм с интересами
			toolbar.on('click', '#surf-category', function (event) {
				chrome.extension.sendRequest({ action : 'OPEN_INTERESTS' });
			});

			// открываем фрейм с коллекциями
			toolbar.on('click', '#surf-chan', function (event) {
				chrome.extension.sendRequest({ action : 'OPEN_COLLECTIONS' });
			});

			// биндим события на лайк\нелайк
			toolbar.on('click', '#like, #dontlike', function (event) {
				var self = $(this),
					vote = self.hasClass('b-button_state_active') ? 0 : ( (this.id == 'like') ? 1 : -1 ),
					other = (this.id == 'like') ? $('#dontlike') : $('#like');
					
				event.preventDefault();

				if (request.status == 'notlogged' || request.status == 'error') {
					$('#tb-surfingbird #b-error').html(loginPlease);
					$('#tb-surfingbird #b-error').removeClass('hide');
					setTimeout($('#tb-surfingbird #b-error').removeClass('hide'), 5000);
				} else {
					if (isBlock || isVote) {
						return;
					}
					// таймаут для лайк/нелайк
					isBlock = true;

					setTimeout(function () {
						isBlock = false;
					}, 1000);

					$.ajax({
						type : 'POST',
						url  : sbDomain + '/ajax/site/vote',
						data : {
							vote : vote,
							url : request.url,
							Magica : magica
						},
						beforeSend:function () {
							isVote = true;
						},
						success:function (data) {
							isBlock = false;
							isVote = false;
						},
						error:function (data) {
							chrome.extension.sendRequest({ action : 'ERROR', text : 'Произошла ошибка, попробуйте позднее' });
						}
					});
					self.addClass('b-button_state_active');
					other.removeClass('b-button_state_active');
					chrome.extension.sendRequest({ action : 'LIKE_UNLIKE', vote : vote }); // отправляем запрос на изменение данных в локальном хранилище
				}
			});

			toolbar.on('click', '#soc-fav', function (event) {
				var self = $(this),
					type = self.attr('href');
					
				event.preventDefault();

				if (type === '/unfav') {
					$.post(sbDomain + '/ajax/site/fav', {
						url : request.url,
						do : 'unfav',
						Magica : magica
					}, function (data) {
						magica = data.Magica;
						if (data.result == 'unfav') {
							var span = $('#count-sel');
							
							self.parent().find('.b-tooltip').html("<i></i>В избранное");
							self.removeClass('b-button_state_active').attr('href', '/fav');
							chrome.extension.sendRequest({
								action: 'FAVORITE',
								favorite : 0
							});
						}
					});
				} else {
					$.ajax({
						type : 'POST',
						url  : sbDomain + '/ajax/site/fav',
						data : {
							url : request.url,
							do : 'fav',
							Magica : magica
						},
						success:function (data) {
							magica = data.Magica;
							
							if (data.result == 'fav') {
								var span = $('#count-sel');
								
								self.parent().find('.b-tooltip').html("<i></i>Удалить из избранного");
								self.addClass('b-button_state_active').attr('href', '/unfav');
								chrome.extension.sendRequest({
									action: 'FAVORITE',
									favorite: 1
								});
							}
						},
						error:function (data) {
							chrome.extension.sendRequest({
								action: 'ERROR',
								text: 'Произошла ошибка, попробуйте позднее'
							});
						}
					});
				}
			});
		} else if (request.status === 'notlogged') {
			getLocalization('msgSurf', '#surf-btn .b-button__text');
			getLocalization('msgLike', '#like .b-button__text');
			getLocalization('msgUnlike', '#dontlike .b-button__text');
			getLocalization('msgAdded', '#dontlike .b-button__text');
			getLocalization('msgUnlike', '#dontlike .b-button__text');

			$('#home, .surf-auth').removeClass('hide');
			$('#b-login-form').removeClass('hide');
			$('#adder').html('');
			
			toolbar.on('click', '#surf-btn', function (event) {
				event.preventDefault();
				$('#tb-surfingbird #b-error').css('display', 'inline-block').text(loginPlease);
				setTimeout(hideError, 3000);
			});
			
			toolbar.on('click', '#enter-btn input', function (event) {
				var login = $('input[name="login"]').val(),
					pass = $('input[name="pass"]').val();

				event.preventDefault();
				$.ajax({
					type: 'POST',
					url: sbDomain + '/ajax/login',
					data: {
						'login': login,
						'pass': pass,
						'remember': '1'
					},
					timeout: 6000,
					success: function(data) {
						if (data.status == 'error') {
							$('#tb-surfingbird #b-error').html(invalidAuth);
							$('#tb-surfingbird #b-error').removeClass('hide');
							setTimeout($('#tb-surfingbird #b-error').removeClass('hide'), 3000);
						}
					},
					error: function() {
						$('#tb-surfingbird #b-error').html(invalidAuth);
						$('#tb-surfingbird #b-error').removeClass('hide');
						setTimeout($('#tb-surfingbird #b-error').removeClass('hide'), 3000);
					}
				});
			});
		} else if (request.status === 'error') {
			getLocalization('msgSurf', '#surf-btn .b-button__text');
			getLocalization('msgAddThisPage', '#surf-add .b-button__text');
			getLocalization('msgBeFirst', '.surf-text');

			$('#home, #surf-add, .surf-text').removeClass('hide');

			toolbar.on('click', '#surf-add', function (event) {
				event.preventDefault();
				add();
			});

			// функция шары
			function add() {
				var screenSize = {
						height : 800,
						width  : 1000
					},
					heightWind = 500,
					widthWind = 700,
					leftCoor = Math.round((screenSize.width / 2) - (widthWind / 2)),
					topCoor = screenSize.height > heightWind ? Math.round((screenSize.height / 2) - (heightWind / 2)) : 0,
					url = window.location.hash.replace(/^#/, '');

				event.preventDefault();
				window.open('http://surfingbird.ru/share?c=1&url=' + encodeURIComponent(url), "", "left=" + leftCoor + "px, top=" + topCoor + "px, width=" + widthWind + "px, height=" + heightWind + "px, personalbar=0, toolbar=0, scrollbars=1, resizable=1");
			   
				chrome.extension.sendRequest({ action : 'ADD_URL' });
			}

			// биндим события на наши батоны
			toolbar.on('click', '#surf-btn', function (event) {
				event.preventDefault();
				$('#surf-btn').addClass('b-button_type_ajax').find('.b-button__icon').addClass('b-button__icon_type_ajax');
				surfClick();
			});

			toolbar.on('click', '#like, #dontlike, #soc-fav, #surf-comm, #like-opt, #dontlike-opt', function (event) {
				event.preventDefault();
				$('#tb-surfingbird #b-error').text('У нас еще нет этой страницы. Хочешь добавить?');
				setTimeout(hideError, 1500);
			});

			// открываем фрейм с интересами
			toolbar.on('click', '#surf-category', function (event) {
				chrome.extension.sendRequest({ action : 'OPEN_INTERESTS' });
			});

			// биндим события на наши батоны
			toolbar.on('click', '#surf-btn', function (event) {
				event.preventDefault();
				$('#surf-btn').addClass('b-button_type_ajax').find('.b-button__icon').addClass('b-button__icon_type_ajax');
				surfClick();
			});
		}
		// закрываем тулбар
		toolbar.on('click', '#close-btn', function (event) {
			event.preventDefault();
			chrome.extension.sendRequest({
				action: 'CLOSE_TOOLBAR'
			});
		});
	}

	function hideError() {
		$('#tb-surfingbird #b-error').fadeOut(1500);
	}

	// при клике по нашим батонам отправляем запрос к bg.js, и там творим чудо
	function surfClick(filter) {
		chrome.extension.sendRequest({
			action: 'SURF_CLICK', 
			filter: filter
		});
	}

	// здесь собраны экшены, которые выполняются в зависимости от запроса
	function actions (request, sender, sendResponse) {
		switch (request.action) {
			case 'FORMING_TOOLBAR' :
				formingToolbar(request);
				break;
				
			default:
				break;
		}
	}

	// ловим запросы от бэкграунда
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		actions(request, sender, sendResponse);
	});
});