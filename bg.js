var SBTB = SBTB || {};

var sbDomain = 'http://surfingbird.ru',
	interval = 0,
	notification,
	showNotif,
	firstRun = (localStorage['firstRun'] == 'true'), // первый запуск? если да, тащим куки
	period = localStorage['notification-period'] ? localStorage['notification-period'] : '12', // показываем рекомендацию 2 раза в сутки
	localTime = new Date();
	
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-39987755-1']);
_gaq.push(['_trackPageview']);

var SBTB = {	
	plural_str: function(i, str1, str2, str3) {
		function plural(a) {
			if (a % 10 === 1 && a % 100 !== 11) {
				return 0;
			} else if (a % 10 >= 2 && a % 10 <= 4 && (a % 100 < 10 || a % 100 >= 20)) {
				return 1;
			} else {
				return 2;
			}
		}
		switch (plural(i)) {
			case 0: 
				return str1;
				brake;
				
			case 1: 
				return str2;
				brake;
				
			default: 
				return str3;
				brake;
		}
	},

	// если возникает ошибка отображаем ее на тулбаре
	warn: function(text) {
		console.log(text);
		/*chrome.tabs.getSelected(null, function (tab) {
			sendRequest(tab.id, { action: 'ERROR', text: text });
		});*/
	},

	// узнаем инфо о странице
	// tab - (Object) информация о вкладке
	// isFirstRun - (Boolean) первый запуск
	getInfoPage: function(tab, isFirstRun) {
		$.ajax ({
			url: sbDomain + '/ajax/site_info',
			type: 'GET',
			data: {
				url: tab.url
			},
			success: function(result) {
				var responseText = result;
				
				if (result.status === 'error') {
					SBTB.warn('site_info: ' + result.error_code);
				} else if (result.status === 'ok') {				
					responseText.tab_url = tab.url;
					responseText.title = tab.title;
				} else {
					SBTB.warn('site_info: Авторизуйся');
				}
				responseText.toolbar = 'on';
				
				SBTB.setStorage(tab.id, responseText);
				
				chrome.tabs.reload();
				SBTB.openToolbar(tab.id);
				
				SBTB.setStorage('toolbarStateSB', 'on');
				
				if (isFirstRun) {
					SBTB.setStorage('firstRun', 'false');
				}
			},
			error: function () {
				SBTB.warn('site_info: Произошла ошибка, попробуйте позднее');
			}
		});
	},

	// проверяем, авторизован ли юзер
	loggedIn: function() {
		SBTB.getCookies('http://surfingbird.ru', 'user_info', function (user_info) {
			SBTB.setStorage('user_info', user_info);
			
			if (user_info !== 0) {
				var interests = user_info.replace(/\\|"|\[|\]/g, '').split(','),
					userName = user_info.replace(/\\|"|\[|\]/g, '').split(',');

				interests.shift(); // тянем интересы из куки
				
				SBTB.setStorage('user_interests', interests);
				SBTB.setStorage('user_login', userName[0]);
				return true;
			} else {
				SBTB.setStorage('user_interests', '');
				SBTB.setStorage('user_login', '');
				return false;
			}
		});
	},

	// добавляем что то в локальное хранилище
	setStorage: function(key, value) {
		if (value === null) {
			delete localStorage[key];
		} else if (typeof(value) === 'object' && value !== null) {
			localStorage[key] = JSON.stringify(value);
		} else {
			localStorage[key] = value;
		}
	},

	// узнаем что то из локального хранилища
	getStorage: function(key) {
		var res = localStorage[key];
		
		if (typeof(res) === 'undefined' || res === null) {
			return null;
		} else if (typeof(res) === 'object') {
			return $.parseJSON(res);
		} else if (typeof(res) === 'string') {
			try {
				res = $.parseJSON(res);
			} catch (e) {
				return res;
			}
			
			if (typeof(res) === 'object') {
				return res;
			} else if (typeof(res) !== 'undefined' && typeof(res) !== 'string') {
				return res;
			} else {
				return res;
			}
		} else {
			return null;
		}
	},

	// получаем урл для пререндера
	getNextUrl: function(newtab) {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
			
			if (newtab || (tabInfo !== undefined && tabInfo.status === 'ok')) {
				var shortUrl = (newtab) ? '' : tabInfo.data.short_url,
					surfParams = SBTB.getStorage('surfCat');

				// серфим с параметрами? если да, то тащим их из хранилища или заносим новые туда же
				if (surfParams.cat) {
					filter = '&s=1&surf_cat=' + surfParams.cat + '&exclude=' + shortUrl;
					surfOn = { cat : surfParams.cat };
				} else if (surfParams.domain) {
					filter = '&filter_domain=' + surfParams.domain + '&exclude=' + shortUrl;
					surfOn = { domain : surfParams.domain };
				} else if (surfParams.user) {
					filter = '&filter_user=' + surfParams.user + '&exclude=' + shortUrl;
					surfOn = { user : surfParams.user };
				} else if (surfParams != 'all') {
					if (surfParams.cat) {
						filter = '&s=1&surf_cat=' + surfParams.cat + '&exclude=' + shortUrl;
						surfOn = { cat : surfParams.cat };
					} else if (surfParams.domain) {
						surfParams = '&filter_domain=' + surfParams.domain; + '&exclude=' + shortUrl
						surfOn = { domain : surfParams.domain };
					} else if (surfParams.user) {
						surfParams = '&filter_user=' + surfParams.user + '&exclude=' + shortUrl;
						surfOn = {  user : surfParams.user };
					} else {
						filter = '&exclude=' + shortUrl
						surfOn = 'all';
					}
				} else {
					filter = '&exclude=' + shortUrl
					surfOn = 'all';
				}

				$.ajax ({
					url: sbDomain + '/ajax/surf?stat_counter=google-toolbar' + filter,
					type: 'GET',
					data: {
						url: tab.url
					},
					success: function(result) {
						var responseText = result;
						
						responseText.toolbar = 'on';
						
						if (result.status === 'ok') {
							url = result.data.url;
							responseText.tab_url = url;
							
							SBTB.setStorage('surfCat', surfOn);
							
						} else if (result.status === 'error' && result.error_code === 'darth_vader') {
							SBTB.setStorage('surfCat', 'all');
							
							url = 'http://surfingbird.ru/vader.html';
						}
						
						SBTB.setStorage('next-surf', responseText);
					},
					error: function () {
						SBTB.warn('Произошла ошибка, попробуйте позднее');
					}
				});
			}
		});
	},

	// узнаем ID расширения
	getExtensionId: function() {
		var extensionId = SBTB.getStorage('extensionId');
		
		return extensionId;
	},

	// узнаем наши куки
	getCookies: function(domain, name, callback) {
		chrome.cookies.get(
			{ 
				'url': domain,
				'name': name
			}, 
			function (cookie) {
				if (callback) {
					callback(cookie.value);
				}
			}
		);
	},

	// передаем в попап юзернэйм
	getProfile: function(fnResponse) {
		var userName = SBTB.getStorage('user_login');
		
		if (userName !== '' && userName !== 0) {
			fnResponse(userName);
		}
	},

	// открываем тулбар по данным из хранилища
	openToolbar: function(tab, from) {
		var infoUrl = SBTB.getStorage(tab),
			toolbarStateSB = SBTB.getStorage('toolbarStateSB'),
			toolbarOnPage = infoUrl.toolbar,
			surfOn = SBTB.getStorage('surfCat'),		
			userInfo = SBTB.getStorage('user_info'),
			logIn = (userInfo === 0) ? false : true,
			nextPage = SBTB.getStorage('next-surf');
		
		SBTB.getCollections();
		
		if (nextPage !== null && nextPage.status !== 'error') {
			var nextPageData = nextPage.data,
				prerenderUrl = nextPageData.url;
		} else {
			var prerenderUrl = '';
		}

		if (surfOn.domain) {
			filter = surfOn.domain;
		} else if (surfOn.user) {
			filter = surfOn.user;
		} else if (surfOn.cat) {
			filter = surfOn.cat;
		} else if (surfOn === 'all') {
			filter = 'all';
		}

		if (infoUrl == undefined) {
			return null;
		} else if (toolbarStateSB !== 'off' && toolbarOnPage !== 'off') {
			var dataUrl = infoUrl.data,
				status = infoUrl.status;

			if (logIn === true && status === 'ok') {
				chrome.tabs.getSelected(null, function (tabb) {
					var shortUrl = dataUrl['short_url'],
						comments = dataUrl['comments_cnt'],
						vote = dataUrl['vote'],
						added = dataUrl['adder_login'],
						favorite = dataUrl['favorite'],
						sex = dataUrl['adder_sex'],
						cats = dataUrl['cat_ids'],
						url = infoUrl.tab_url,
						title = tabb.title;

					chrome.tabs.sendRequest(tab, { 
						action: 'PRERENDER_URL', 
						url: prerenderUrl 
					});
					
					chrome.tabs.sendRequest(tab, { 
						action: 'FORMING_TOOLBAR',
						status: 'ok',
						vote: vote,
						comments: comments,
						added: added,
						shortUrl: shortUrl,
						favorite: favorite,
						url: url,
						sex: sex,
						cats: cats,
						title: title,
						filter: filter
					});
				});
			} else if (logIn == true && status === 'error') {
				chrome.tabs.getSelected(null, function (tabb) {
					var url = tabb.url;
					
					chrome.tabs.sendRequest(tab, { 
						action: 'PRERENDER_URL', 
						url: prerenderUrl 
					});
					
					chrome.tabs.sendRequest(tab, { 
						action: 'FORMING_TOOLBAR',
						status: 'error',
						url: url,
						filter: filter
					});
				});
			} else {
				var url = tab.url;
				
				chrome.tabs.sendRequest(tab, { 
					action: 'FORMING_TOOLBAR',
					status: 'notlogged',
					url: url,
					filter: 'all'
				});
			}
		}
	},

	// закрываем тулбар
	closeToolbar: function() {
		var notification = SBTB.getStorage('notification'),
			notificationPeriod = SBTB.getStorage('notification-period'),
			notificationTime = SBTB.getStorage('notification-time')
		
		chrome.windows.getAll({ populate : true }, function (arrWindows) {
			// проверяем, в каких вкладках открыт тулбар
			for (var i = 0; i < arrWindows.length; i++) {
				var tabs = arrWindows[i].tabs;
					
				
				for (var iTab = 0; iTab < tabs.length; iTab++) {
					var tab = tabs[iTab],
						toolbarStateSB;
						
					chrome.tabs.sendRequest(tab.id, {
						action: 'CLOSE_TOOLBAR'
					});
					
					toolbarStateSB = SBTB.getStorage(tab.id);
				}
			}
		});
		
		SBTB.setStorage('toolbarStateSB', 'off');
		

		// чистим локальное хранилище и обнуляем все значения
		localStorage.clear();

		// устанавливаем пользовательские настройки
		SBTB.setStorage('firstRun', 'true');
		SBTB.setStorage('surfCat', 'all');
		SBTB.setStorage('surfStatus', 'off_surf');
		SBTB.setStorage('user_info', '0');
		SBTB.setStorage('notification', notification);
		SBTB.setStorage('notification-period', notificationPeriod);
		SBTB.setStorage('notification-time', notificationTime);
		
		SBTB.loggedIn();
	},

	// открываем профиль
	openProfile: function() {
		var userName = SBTB.getStorage('user_login');
		
		chrome.tabs.create({ url : 'http://surfingbird.ru/surfer/' + userName });
	},

	// состояние тулбара
	toolbarState: function(fnResponse) {
		var state = SBTB.getStorage('toolbarStateSB');
		
		if (state === 'on') {
			fnResponse(true);
		}
	},

	//функция, срабатывающая при открытии попапа
	onBrowserActionClicked: function(fnResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			var userName = SBTB.getStorage('user_login'),
				firstRun = SBTB.getStorage('firstRun'),
				firstTimeOnTab = SBTB.getStorage(tab.id),
				toolbarStateSB = SBTB.getStorage('toolbarStateSB');

			if (tab.url.search('surfingbird.') === -1 && tab.url.search('chrome://newtab/') !== 0) {
				if (toolbarStateSB === 'on' && toolbarStateSB === null) {
					return;
				}

				if (firstRun === true || firstTimeOnTab === null) {
					SBTB.setStorage('toolbarStateSB', 'on');
					SBTB.setStorage('firstRun', 'false');

					if (userName !== 0 && userName !== null) {
						SBTB.getInfoPage(tab, false);
					} else {
						var tabInfo = {
							tab_url: tab.url,
							toolbar: 'on',
							status: 'notlogged' 
						};
						
						SBTB.setStorage(tab.id, tabInfo);
						chrome.tabs.reload();
						SBTB.setStorage('toolbarStateSB', 'on');
					}
					fnResponse(true);
				}

				if (userName !== 0 && userName !== null) {
					chrome.tabs.sendRequest(tab.id, { action: 'TOOLBAR_IS_ON' }, function (response) {
						if (response === undefined || response.toolbarState !== 'on') {
							SBTB.getInfoPage(tab, false);
							fnResponse(true);
						}
					});
				} else {
					chrome.tabs.sendRequest(tab.id, { action: 'TOOLBAR_IS_ON' }, function (response) {
						if (response === undefined || response.toolbarState !== 'on') {
							var tabInfo = {
									tab_url: tab.url,
									toolbar: 'on'
								};
							
							SBTB.setStorage(tab.id, tabInfo);
							
							chrome.tabs.reload();
							chrome.tabs.sendRequest(tab.id, {
								action: 'FORMING_TOOLBAR', 
								status: 'notlogged'
							});
							fnResponse(true);
						}
					});
					SBTB.setStorage('toolbarStateSB', 'on');
				}
			} else if (tab.url.search('chrome://newtab/') != -1) {
				SBTB.setStorage('toolbarStateSB', 'on');
				fnResponse(true);
				
				chrome.tabs.getSelected(null, function(tab) {
					var nextUrl = SBTB.getStorage('next-surf');					
					
					SBTB.setStorage(tab.id, nextUrl);

					chrome.tabs.update(tab.id, {
						url: nextUrl.data.url
					})
					
					SBTB.seenUrl();
					SBTB.getNextUrl();
				});
			} else {
				chrome.tabs.create({
					url: 'http://surfingbird.ru/surf/'
				});
				
				fnResponse(true);
				
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.update(tab.id, {
						selected: true
					})
				});
			}
		});
	},

	// юзер кликнул по "Сёрф", шлем запрос на /ajax/surf, в ответе получаем необходимые данные, из них формируем новую страничку
	surfClick: function(sender, request) {
		chrome.tabs.getSelected(null, function (tab) {
			var surfVars = SBTB.getStorage('surfCat'),
				nextPage = SBTB.getStorage('next-surf'),
				surfOn = {},
				filter;
			
			if (nextPage !== null && nextPage.status !== 'error') {
				var nextPageData = nextPage.data,
					nextUrl = nextPageData.url;
			} else {
				var nextUrl = '';
			}

			SBTB.setStorage('surfStatus', 'on_surf');

			// серфим с параметрами? если да, то тащим их из хранилища или заносим новые туда же
			if (request.cat) {
				filter = '&s=1&surf_cat=' + request.cat;
				surfOn = { 
					cat: 
					request.cat
				};
			} else if (request.domain) {
				filter = '&filter_domain=' + request.domain;
				surfOn = {
					domain: request.domain
				};
			} else if (request.user) {
				filter = '&filter_user=' + request.user;
				surfOn = {
					user: request.user
				};
			} else if (surfVars != 'all') {
				if (surfVars.cat) {
					filter = '&s=1&surf_cat=' + surfVars.cat;
					surfOn = {
						cat: surfVars.cat
					};
				} else if (surfVars.domain) {
					filter = '&filter_domain=' + surfVars.domain;
					surfOn = {
						domain: surfVars.domain
					};
				} else if (surfVars.user) {
					filter = '&filter_user=' + surfVars.user;
					surfOn = {
						user: surfVars.user
					};
				} else {
					filter = ''
					surfOn = 'all';
				}
			} else {
				filter = ''
				surfOn = 'all';
			}
			SBTB.setStorage('surfCat', surfOn);

			// если условия серфа не менялись, берем линк из хранлища, если изменились отправляем запрос на ajax/surf с новыми параметрами
			if (JSON.stringify(surfVars) === JSON.stringify(surfOn) && nextUrl != '') {
				SBTB.setStorage(tab.id, nextPage);
				
				chrome.tabs.update(tab.id, {
					url: nextUrl
				});
				
				SBTB.getNextUrl();
				SBTB.seenUrl();
			} else {
				$.ajax ({
					url: sbDomain + '/ajax/surf?stat_counter=google-toolbar' + filter,
					type: 'GET',
					data: {
						url: tab.url
					},
					success: function(result) {				
						var responseText = result;
						
						if (result.status === 'ok') {
							url = result.data.url;
							
							responseText.tab_url = url;
							responseText.toolbar = 'on';
							
							SBTB.setStorage('surfCat', surfOn);
						} else if (result.status === 'error' && result.error_code === 'darth_vader') {
							SBTB.setStorage('surfCat', 'all');
							url = 'http://surfingbird.ru/vader.html';
						}
						
						responseText.toolbar = 'on';
								
						SBTB.setStorage(tab.id, result);
						
						SBTB.getNextUrl();
						SBTB.seenUrl();
						
						chrome.tabs.update(tab.id, ({ 
							url: url 
							})
						);
					},
					error: function () {
						SBTB.warn('Произошла ошибка, попробуйте позднее');
					}
				});
			}
		});
		SBTB.setStorage('surfStatus', 'off_surf');
	},

	// получаем список коллекций и заносим в локальное хранилище
	getCollections: function() {
		$.ajax ({
			url: sbDomain + '/ajax/chan/popup?as_json=1',
			type: 'GET',
			success: function(result) {
				if (typeof(result) === 'object') {
					SBTB.setStorage('user_collections', result);
				} else {
					SBTB.warn('getCollections: Авторизуйся');
				}
			},
			error: function () {
				SBTB.warn('getCollections: Произошла ошибка, попробуйте позднее');
			}
		});
	},

	// добавляем линк в коллекцию
	addToCollection: function(channel) {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
			
			if (tabInfo !== undefined && tabInfo.status === 'ok') {
				var magica = SBTB.getStorage('Magica'),
					shortUrl = tabInfo.data.short_url;				
					
				$.ajax ({
					url: sbDomain + '/ajax/site/add',
					type: 'POST',
					data: {
						Magica: magica,
						url: '/surf/' + shortUrl,
						channel: channel,
						surftochannel: 1
					},
					success: function(result) {
						console.log('Ссылка в коллекции))');
					},
					error: function () {
						SBTB.warn('Произошла ошибка, попробуйте позднее');
					}
				});
			}
		});
	},

	// получаем магию
	getMagica: function() {
		$.ajax ({
			url: sbDomain + '/ajax/magickey',
			type: 'GET',
			success: function(result) {
				if (result.match('^<') !== null) {
					SBTB.setStorage('Magica', result);
				} else {
					SBTB.warn('Magica: Авторизуйся');
				}
			},
			error: function () {
				SBTB.warn('Magica: Произошла ошибка, попробуйте позднее');
			}
		});
	},

	// вносим изменения в локальное хранилище при лайке\нелайке
	vote: function(tab, state) {
		var urlInfo = SBTB.getStorage(tab);
		
		urlInfo.data.vote = state;
		SBTB.setStorage(tab, urlInfo);
	},

	// вносим изменения в локальное хранилище при добавлении\удалении в избранное
	favorite: function(tab, state) {
		var urlInfo = SBTB.getStorage(tab);
		
		urlInfo.data.favorite = state;
		SBTB.setStorage(tab, urlInfo);
	},

	// узнаем урл
	toKnowUrl: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			sendResponse({
				url: tab.url
			});
		});
	},

	// узнаем состояние расширения
	toKnowState: function(sender, sendResponse) {
		var infoTab = SBTB.getStorage(sender),
			data;
		
		if (infoTab === null || infoTab.toolbar !== 'on') {
			data = {
				state: SBTB.getStorage('toolbarStateSB'),
				surfer: SBTB.getStorage('user_login'),
				stateOnPage: 'off'
			};
		} else {
			data = {
				state: SBTB.getStorage('toolbarStateSB'),
				surfer: SBTB.getStorage('user_login'),
				stateOnPage: 'on'
			};
		}
		sendResponse(data);
	},

	// логинимся на Surfingbird через ajax, в случае неудачи отправляем ошибку тулбару
	login: function(sendResponse) {	
		$.ajax ({
			url: sbDomain + '/ajax/login',
			type: 'POST',
			success: function(result) {
				if (result.status === 'error') {
					SBTB.warn('login: ' + result.status + ' - ' + result.error_code);
				} 
			},
			error: function () {
				SBTB.warn('login: Произошла ошибка, попробуйте позднее');
			}
		});
	},

	// разлогиниваемся на Surfingbird через ajax
	logout: function(sendResponse) {
		$.post(sbDomain + '/logout');
	},

	// отправляем странице запрос на открытие фрейма с интересами
	openInterests: function() {
		chrome.tabs.getSelected(null, function (tab) {
			chrome.tabs.sendRequest(tab.id, {
				action: 'OPEN_INTERESTS'
			});
		});
	},

	// закрываем все попапы
	closePopups: function() {
		chrome.tabs.getSelected(null, function (tab) {
			chrome.tabs.sendRequest(tab.id, {
				action: 'CLOSE_POPUPS'
			});
		});
	},

	// отправляем странице запрос на открытие фрейма с Лайеом
	openLike: function(cats) {
		chrome.tabs.getSelected(null, function (tab) {
			var filter = SBTB.getStorage('surfCat'),
				tabInfo = SBTB.getStorage(tab.id),
				domain = tabInfo.tab_url.match(/:\/\/(.[^/]+)/)[1];
				
			chrome.tabs.sendRequest(tab.id, { 
				action: 'OPEN_LIKE_FRAME',
				cats: cats,
				domain: domain,
				filter: filter
			});
		});
	},

	// отправляем странице запрос на открытие фрейма с неЛайком
	openUnlike: function() {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id),
				domain = tabInfo.tab_url.match(/:\/\/(.[^/]+)/)[1];
				
			chrome.tabs.sendRequest(tab.id, {
				action: 'OPEN_UNLIKE_FRAME',
				domain: domain
			});
		});
	},

	// отправляем странице запрос на открытие фрейма с коллекций
	openCollections: function() {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
			
			chrome.tabs.sendRequest(tab.id, {
				action: 'OPEN_COLLЕCTIONS_FRAME'
			});
		});
	},

	// отправляем странице запрос на открытие фрейма с комментами
	openComments: function() {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
			
			chrome.tabs.sendRequest(tab.id, {
				action: 'OPEN_COMMENTS_FRAME'
			});
		});
	},

	// формируем список интересов во фрейме
	listOfInterests: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			var interests = SBTB.getStorage('user_interests'),
				surfCat = SBTB.getStorage('surfCat');
			
			sendResponse({
				list: interests,
				surf_on: surfCat
			});
		});
	},

	// формируем список коллекций во фрейме
	listOfCollections: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			var collections = SBTB.getStorage('user_collections'),
				tabInfo = SBTB.getStorage(tab.id),
				shortUrl;
				
			shortUrl = (tabInfo !== null && tabInfo.data !== undefined) ? tabInfo.data.short_url : '';
			
			sendResponse({
				list: collections,
				shortUrl: shortUrl
			});
		});
	},

	// формируем список к во фрейме
	listOfComments: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			/*var tabInfo = SBTB.getStorage(tab.id);
			
			if (tabInfo != undefined && tabInfo.status == 'ok') {
				var xhr = new XMLHttpRequest(),
					magica = SBTB.getStorage('Magica'),
					shortUrl = tabInfo.data.short_url,
					url = sbDomain + '/page/'+ shortUrl +'/comm';

				xhr.onreadystatechange = function () {		
					if (xhr.readyState == 4) {
						if (xhr.status == 200) {
							if (xhr.responseText.match('^<') == null) {
								var responseText = JSON.parse(xhr.responseText);
								
								sendResponse({ list : responseText, shortUrl : shortUrl });
							}
						} else {
							error('Произошла ошибка, попробуйте позднее');
						}
					}
				};
				xhr.open("GET", url, true);
				xhr.send();	
			}*/
		});

	/*
		chrome.tabs.getSelected(null, function (tab) {
			var collections = SBTB.getStorage('user_collections'),
				tabInfo = SBTB.getStorage(tab.id),
				shortUrl = tabInfo.data.short_url;
			sendResponse({ list : collections, shortUrl : shortUrl });
		});
	*/
	},

	// формируем список like во фрейме
	likeMenu: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);

			if (tabInfo !== undefined && tabInfo !== null && tabInfo.status === 'ok') {
				var url = tabInfo.data.url,
					adder = tabInfo.data.adder_login,
					cats = tabInfo.data.cat_ids;
					
				sendResponse({
					url: url,
					adder: adder,
					cats: cats
				});
			}
		});
	},

	// формируем список unlike во фрейме
	unLikeMenu: function(sendResponse) {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
			
			if (tabInfo !== undefined && tabInfo !== null && tabInfo.status === 'ok') {
				var url = tabInfo.data.url,
					adder = tabInfo.data.adder_login,
					shortUrl = tabInfo.data.short_url;
					
				sendResponse({
					url: url,
					adder: adder,
					shortUrl: shortUrl
				});
			}
		});
	},

	// слушаем окно шары
	addUrl: function(tabInfo) {
		chrome.windows.getAll({ populate: true }, function (arrWindows) {
			for (var i = 0; i < arrWindows.length; i++) {
				var tabs = arrWindows[i].tabs;
				
				for (var iTab = 0; iTab < tabs.length; iTab++) {
					var tab = tabs[iTab],
						tabUrl = encodeURIComponent(tab.url);
						
					if (tabUrl.search(/surfingbird\.ru%2Fshare/) !== -1) {
						var uploadTab = SBTB.getStorage(tabInfo);
						
						SBTB.setStorage('share_url', arrWindows[i].id + ',' + tabInfo + ',' + uploadTab.tab_url);
					}
				}
			}
		});
	},

	// сообщаем на SB, что посмотрели этот линк, чтобы избежать дублирования выдачи
	seenUrl: function(url) {
		if (!url) {
			chrome.tabs.getSelected(null, function (tab) {
				var tabInfo = SBTB.getStorage(tab.id);
				
				
				if (tabInfo !== null && tabInfo.status === 'ok') {			
					$.get(sbDomain + '/ajax/seen/' + tabInfo.data.short_url);
				}
			});
		} else {
			$.get(sbDomain + '/ajax/seen/' + url);
		}
	},

	// показываем нотифаер
	showCountrec: function() {
		var ts = Math.round(new Date().getTime() / 1000),
			login = SBTB.getStorage('user_login');
		
		$.ajax({
			url: sbDomain + '/ajax/feed?after_id=1&journal=' + login + '&type=0&_=' + ts,
			dataType: 'json',
			success: function(response) {
				if (response.user_recommend_count && response.user_recommend_count !== 0 && response.user_recommend_count !== undefined && response.user_recommend_count !== null) {
					notification = webkitNotifications.createNotification(
						'files/i/favicon48.png',
						'У нас есть для тебя',
						response.user_recommend_count + ' ' + SBTB.plural_str(response.user_recommend_count, 'рекомендация','рекомендации','рекомендаций')
					);
					
					if (SBTB.getStorage('recommend_count') !== response.user_recommend_count) {
						SBTB.setStorage('recommend_count', response.user_recommend_count);
						
						notification.show();
						
						SBTB.closeNotification(notification);
					}
				}
			}
		});
	},

	// показываем нотифаер
	showNextrec: function() {
		$.ajax({
			url: sbDomain + '/ajax/surf?stat_counter=google-toolbar',
			success: function(response) {
				if (response.status === 'ok') {
					var title = response.data.title || 'Мы нашли кое что интересное для тебя',
						thumb = response.data.thumb || 'http://surfingbird.ru/img/logo-mail.jpg',
						notification = webkitNotifications.createNotification(
							thumb,
							title,
							''
						);
													
					SBTB.seenUrl(response.data.short_url);
					notification.onclick = function() {
						chrome.tabs.create({url: 'http://surfingbird.ru/surf/' + response.data.short_url + '?utm_source=chrome&utm_medium=message&utm_campaign=personal_message'});
					};

					notification.show();
					
					SBTB.closeNotification(notification);
				}
			}
		});
	},

	// устанавливаем частоту отображения нотифаеров
	changePeriod: function(newTime) {
		var nowTime = new Date(),
			nextTime = SBTB.getStorage('notification-time'),
			period = SBTB.getStorage('notification-period');
			
		if (SBTB.getStorage('notification') !== 1) {
			return;
		}

		// если изменилась частота показов в настройках расчитываем и устанавливаем время следующего показа
		if (newTime) {
			SBTB.setStorage('notification-time', new Date(nowTime.getTime() + period * 3600 * 1000));
		}

		if (nowTime >= new Date(nextTime) || nextTime === undefined || nextTime === null || nextTime === '') {
			if ((SBTB.getStorage('user_login') !== 0 || SBTB.getStorage('user_login') !== '') && SBTB.getStorage('toolbarStateSB') !== 'on' && SBTB.getStorage('notification') === 1) {
				SBTB.showNextrec();
			}
			SBTB.setStorage('notification-time', new Date(nowTime.setTime(nowTime.setTime(nowTime.getTime() + period * 3600 * 1000))));
		}
	},
	
	// отслеживаем в фоновом режиме урлы, чтобы избежать дублирования выдачи
	spyUrl: function() {
		chrome.tabs.getSelected(null, function (tab) {
			var url = tab.url,
				tabInfo = SBTB.getStorage(tab.id);
			
			if (url !== null && !tabInfo && url.search(/surfingbird\.ru/) === -1) {			
				$.get(sbDomain + '/ajax/seen_maybe?url=' + url);
			}
		}); 
	},
	
	// создаем коллекцию
	createCollection: function() {
		chrome.tabs.getSelected(null, function (tab) {
			var tabInfo = SBTB.getStorage(tab.id);
				
			chrome.tabs.create({url: 'http://surfingbird.ru'}, function (tab) {
				var data = { 
						tabId: tab.id, 
						url: tabInfo.data.short_url
					};
				SBTB.setStorage('create-collection', data);
			});
		});
	},

	// проверяем рассылки
	checkMail: function() {
		var lastMail = SBTB.getStorage('last-mail') || '';

        if (SBTB.getStorage('notification') !== 1) {
            return;
        }

		if (SBTB.getStorage('user_info') !== 0 && SBTB.getStorage('user_info') !== '' && SBTB.getStorage('user_info') !== undefined && SBTB.getStorage('user_info') !== null) {
			$.ajax({
				url: sbDomain + '/lastmail',
				success: function(response) {
					var data = {
							type: 'mail',
							num: response.data.id,
							title: response.data.title,
							img: response.data.image
						},						
						notification = webkitNotifications.createNotification(
							data.img,
							'Самое интересное за неделю',
							data.title
						);
						
					notification.onclick = function() {
						chrome.tabs.create({url: 'http://surfingbird.ru/mail/' + data.num + '?utm_source=chrome&utm_medium=message&utm_campaign=personal_message'});
					};
						
					if (parseInt(data.num) !== lastMail) {
						notification.show();
						SBTB.closeNotification(notification);
						SBTB.setStorage('last-mail', data.num);
					}
				}
			});
		}
		
	},
	
	closeNotification: function(notification) {
		setTimeout(function() {
			notification.cancel();
		}, 15000);
	},

	// здесь собраны экшены, которые выполняются в зависимости от запроса
	actions: function(request, sender, sendResponse) {
		switch (request.action) {
			case 'ADD_TO_COLLECTION':
				SBTB.addToCollection(request.channel);
				break;

			case 'ADD_URL':
				SBTB.addUrl(sender);
				break;				
			
			case 'CHANGE_PERIOD':
				SBTB.changePeriod(true);
				break;

			case 'CLOSE_POPUPS': // не используется
				SBTB.closePopups();
				break;

			case 'CLOSE_TOOLBAR':
				SBTB.closeToolbar();
				break;

			case 'CREATE_COLLECTION':
				SBTB.createCollection();
				break;

			case 'ERROR':
				SBTB.warn(request);
				break;

			case 'FAVORITE':
				SBTB.favorite(sender, request.favorite);
				break;

			case 'IS_LOGGED':
				SBTB.loggedIn;
				break;

			case 'LIKE_MENU':
				SBTB.likeMenu(sendResponse);
				break;

			case 'LIKE_UNLIKE':
				SBTB.vote(sender, request.vote);
				break;

			case 'LIST_OF_INTERESTS':
				SBTB.listOfInterests(sendResponse);
				break;

			case 'LIST_OF_COLLECTIONS':
				SBTB.listOfCollections(sendResponse);
				break;

			case 'LIST_OF_COMMENTS':
				SBTB.listOfComments(sendResponse);
				break;

			case 'LOGIN':
				SBTB.login(sendResponse);
				break;

			case 'MAGICA': // не используется
				SBTB.setStorage('magica', request.magica);
				break;
				
			case 'OPEN_COLLECTIONS':
				SBTB.openCollections();
				break;
				
			case 'OPEN_COMMENTS':
				SBTB.openComments();
				break;

			case 'OPEN_INTERESTS':
				SBTB.openInterests();
				break;

			case 'OPEN_LIKE':
				SBTB.openLike(request.cats);
				break;
				
			case 'OPEN_TOOLBAR':
				SBTB.openToolbar(sender, 'actions');
				break;

			case 'OPEN_UNLIKE':
				SBTB.openUnlike();
				break;

			case 'SPY_URL':
				SBTB.spyUrl();
				break;

			case 'SURF_CLICK':
				SBTB.surfClick(sender, request);
				break;

			case 'TO_KNOW_URL':
				SBTB.toKnowUrl(sendResponse);
				break;

			case 'TO_KNOW_STATE':
				SBTB.toKnowState(sender, sendResponse);
				break;

			case 'TOOLBAR_STATE':
				SBTB.toolbarState();
				break;

			case 'UNLIKE_MENU':
				SBTB.unLikeMenu(sendResponse);
				break;
		}
	},
	
	init: function() {
		// отпарвялем запрос к contentScripts.js, когда кликаем иконку расширения
		chrome.browserAction.onClicked.addListener(function (tab) {
			SBTB.setStorage(tab.id, { 'toolbar': 'on' });
			//шлем запрос на открытие тулбара
			chrome.tabs.sendRequest(tab.id, {
				action: 'FORMING_TOOLBAR'
				}
			);
		});

		// не создаем тулбар в новых вкладках
		chrome.tabs.onCreated.addListener(function (tab) {
			SBTB.setStorage(tab.id, { 'toolbar': 'off' });
		});

		// при обновлении вкладки надо опять подрубать к ней тулбар, так как при апдейте все наши фреймы чистятся
		chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
			var infoUrl = SBTB.getStorage(tab.id),
				toolbarStateSB = SBTB.getStorage('toolbarStateSB'),
				surfStatus = SBTB.getStorage('surfStatus'),
				collectionCreate = SBTB.getStorage('create-collection'),
				shortUrl;

			if (toolbarStateSB === 'on' && surfStatus !== 'on_surf' && tab.url && infoUrl !== undefined && infoUrl !== null) {
				if (infoUrl.toolbar === 'on') {

				SBTB.getCollections();
				// шлем запрос на Surfingbird с УРЛом, и получаем о нем информацию в ответ        
					$.ajax ({
						url: sbDomain + '/ajax/site_info',
						type: 'GET',
						data: {
							url: tab.url
						},
						success: function(result) {
							if (result.status === 'ok') {
								var responseText = result;
								
								responseText.tab_url = tab.url;
								responseText.toolbar = 'on';
								responseText.title = tab.title;

								SBTB.setStorage(tab.id, responseText);
							} else if (result.status === 'error' && result.error_code === 'no_site') {
								SBTB.setStorage(tab.id, { 'toolbar': 'on', 'status': 'error' });
							} else {
								SBTB.warn('tabs.onUpdated: Авторизуйся');
							}
							SBTB.setStorage('toolbarStateSB', 'on');
						},
						error: function () {
							SBTB.warn('tabs.onUpdated: Произошла ошибка, попробуйте позднее');
						}
					});
				}
			}
			SBTB.setStorage('surfStatus', 'off_surf');
			
			// создаем коллекцию
			if (collectionCreate && tab.url.search(/surfingbird.ru/) !== -1 && tab.status === 'complete') {
				var tabInfo = SBTB.getStorage('create-collection'),
					shortUrl = tabInfo.url;
				
				chrome.tabs.sendRequest(tab.id, {
					action: 'CREATE_COLLECTION',
					url: shortUrl
				});
				SBTB.setStorage('create-collection', '');
			}
		});

		// юзер логинится или разлогинивается, следим за этим, и вносим изменения в локальное хранилище
		chrome.cookies.onChanged.addListener(function (changeInfo) {
			if (changeInfo.cookie.domain == '.surfingbird.ru' && changeInfo.cookie.name == 'user_info' && changeInfo.cause == 'explicit') {
				SBTB.setStorage('user_info', changeInfo.cookie.value);
				
				chrome.windows.getAll({ populate : true }, function (arrWindows) {
					for (var i = 0; i < arrWindows.length; i++) {
						var tabs = arrWindows[i].tabs;
						
						for (var iTab = 0; iTab < tabs.length; iTab++) {
							var tab = tabs[iTab],
								actTab = SBTB.getStorage(tab.id);

							if (actTab !== null && actTab.toolbar === 'on' ) {
								$.ajax ({
									url: sbDomain + '/ajax/site_info',
									type: 'GET',
									data: {
										url: actTab.tab_url
									},
									success: function(result) {
										if (result.status === 'ok') {
											var responseText = result;
											
											if (result.data.url) {
												responseText.tab_url = result.data.url;
											} else {
												responseText.tab_url = actTab.url;
											}
											responseText.toolbar = 'on';
											SBTB.setStorage(actTab, responseText);
										} else if (result.status === 'error' && result.error_code === 'no_site') {
											SBTB.setStorage(actTab, { 'toolbar': 'on', 'status': 'error' });
										} else {
											SBTB.warn('site_info on cookies.onChanged: ' + result.error_code);
										}
									},
									error: function () {
										SBTB.warn('site_info on cookies.onChanged: Произошла ошибка, попробуйте позднее');
										SBTB.setStorage(actTab, { 'toolbar': 'on' });
									}
								});

								chrome.tabs.reload(tab.id);
								SBTB.seenUrl;
							}
						}
					}
				});
			}
		});

		// при закрытии вкладки удаляем данные о ней из хранилищаы
		chrome.tabs.onRemoved.addListener(function (tabId) {
			SBTB.setStorage(tabId, null);
		});

		// при закрытии окна очищаем инфу о всех вкладках в нем
		chrome.windows.onRemoved.addListener(function (windowId) {
			var shareUrlStor = SBTB.getStorage('share_url');

			if (shareUrlStor !== null) {
				var shareUrl = shareUrlStor.split(','),
					shareWindow = shareUrl[0],
					shareTab = shareUrl[1],
					sharedLink = shareUrl[2];

				if (windowId === shareWindow) {			
					$.ajax ({
						url: sbDomain + '/ajax/site_info',
						type: 'GET',
						data: {
							url: sharedLink
						},
						success: function(result) {
							if (result.data.url) {
								result.tab_url = result.data.url;
							} else {
								result.tab_url = sharedLink;
							}
							result.toolbar = 'on';

							SBTB.setStorage(shareTab, result);
							
							chrome.tabs.reload(parseInt(shareTab));
							
							SBTB.setStorage('share_url', null);
						},
						error: function () {
							SBTB.warn('site_info on windows.onRemoved: Произошла ошибка, попробуйте позднее');
						}
					});
				}
			}
		});

		// отслеживаем установку расширения и отправляем это в GA
		chrome.runtime.onInstalled.addListener(function(details) {
			if (details.reason === 'install') {
				(function() {
					var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
					ga.src = 'https://ssl.google-analytics.com/ga.js';
					var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
				})();
			}
		});

		// ловим запросы от табов
		chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
			var tabId = sender.tab.id;
			
			SBTB.actions(request, tabId, sendResponse);
		});

		// если это уже не первый запуск тулбара
		if (!firstRun) {
			SBTB.setStorage('firstRun', 'true');
			chrome.management.getAll(function (ExtensionInfo) {
				for (var i = 0; i < ExtensionInfo.length; i++) {
					var apps = ExtensionInfo[i];
					
					if (ExtensionInfo[i].name === 'Surfingbird.ru') {
						SBTB.setStorage('extensionId', ExtensionInfo[i].id);
					}
				}
			});
			SBTB.loggedIn;
			SBTB.getExtensionId();
		}

		// выставляем настройки по-умолчанию
		SBTB.setStorage('toolbarStateSB', 'off');
		SBTB.setStorage('firstRun', 'true');
		SBTB.setStorage('surfCat', 'all');
		SBTB.setStorage('surfStatus', 'off_surf');
		SBTB.setStorage('user_info', '0');

		// настройки нотифаеров по-умолчанию
		if (SBTB.getStorage('notification') === '' || SBTB.getStorage('notification') === undefined || SBTB.getStorage('notification') === null) {
			SBTB.setStorage('notification', '1');
		}
		
		if (SBTB.getStorage('notification-period') === '' || SBTB.getStorage('notification-period') === undefined || SBTB.getStorage('notification-period') === null || SBTB.getStorage('notification-period') == '0') {
			SBTB.setStorage('notification-period', '12');
		}
		
		if (SBTB.getStorage('last-mail') === '' || SBTB.getStorage('last-mail') === undefined || SBTB.getStorage('last-mail') === null) {
			SBTB.setStorage('last-mail', '0');
		}

		SBTB.changePeriod();
		SBTB.loggedIn();
		SBTB.getCollections();
		SBTB.getNextUrl(true);
	}
};

SBTB.init();

// запускаем таймер нотифаеров
setInterval(SBTB.changePeriod, 300000);
setInterval(SBTB.checkMail, 3600000);