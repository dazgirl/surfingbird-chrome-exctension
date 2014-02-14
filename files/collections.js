var sbDomain = 'http://surfingbird.ru',
    magica;

$(document).ready(function () {
	chrome.extension.sendRequest({ action : 'LIST_OF_COLLECTIONS' }, function (response) {
		formingCollectionList(response.list, response.shortUrl);
	});

	$('.surf-category__item_type_simple').live('click', function (event) {
            var channel = $(this).data('channel').replace('/surfer/', ''),
				shortUrl = $(this).data('url');
			
			$.ajax({
				type: 'POST',
				url: sbDomain + '/ajax/site/add',
				data: {
					Magica: magica,
					url: '/surf/' + shortUrl,
					surftochannel: 1,
					channel: channel
				},
				success:function (data) {
					if (data.message === 'Добавлено') {
						chrome.extension.sendRequest({ 
							action: 'CLOSE_POPUPS'
						});
					} else {
						chrome.extension.sendRequest({
							action: 'ERROR',
							text: 'Ты уже добавил эту страницу в коллецию'
						});
						chrome.extension.sendRequest({
							action: 'CLOSE_POPUPS'
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
        });
		
	$('.surf-category__item_type_create').live('click', function (event) {
		chrome.extension.sendRequest({
			action: 'CREATE_COLLECTION'
		});
	});

	getMagica();
});

// получаем магию
function getMagica () {
    $.ajax({
        url: sbDomain + '/ajax/magickey',
        success: function(data) {
            magica = data;
        }
    });
}

// формируем список коллекций
function formingCollectionList(collections, url) {
	if (collections.length !== 0) {
		for (var i = 0; i < collections.length; i++) {
			var collection = collections[i],
				avatar = collection.avatar || 'http://surfingbird.ru/img/no-photo-50.png?v=2';
			
			$('#surf-channels__list').append('<li class="surf-category__item surf-category__item_type_simple" data-channel="' + collection.url + '" data-url="' + url + '" title="' + collection.full_name + '">' +
												'<img class="surf-category__img surf-category__img_type_channel" src="' + avatar + '" />' +
												'<i class="surf-category__text surf-category__text_type_channel">' + collection.full_name + '</i>' +
											 '</li>');
		}

		// сортируем по алфавиту
		var list = $('#surf-channels__list');
		
		list.append(list.children().toArray().sort(function(a, b) {
				var at = $(a).text(),
					bt = $(b).text();
					
				return at < bt ? -1 : at > bt ? 1 : 0;
			})
		);
		$('#surf-channels__list').append('<li class="surf-category__item surf-category__item_type_create">' +
											'<i class="surf-category__text surf-category__text_type_create">Создать коллекцию</i>' +
										 '</li>');
	} else {
		$('#surf-channels__list').append('<li class="surf-category__item surf-category__item_type_create">' +
											'<i class="surf-category__text surf-category__text_type_create">Создать коллекцию</i>' +
										 '</li>');
	}
}
