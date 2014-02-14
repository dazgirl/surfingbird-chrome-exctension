$(document).ready(function () {
	var sbDomain = 'http://surfingbird.ru',
		form = $('#comment-form'),
		Magica = getMagica();
	
	chrome.extension.sendRequest({ action : 'LIST_OF_COMMENTS' }, function (response) {
		listComments(response.list, response.shortUrl);
	});
	
	form.on('submit', function(event) {
		var shortUrl = $('input[name="url"]').val(),
			Magica = $('input[name="Magica"]').val(),
			comment = $('#post-text').val(),
			userPost = $('input[name="userpost"]').val();
			
		event.preventDefault();
		
		$.ajax({
			url: sbDomain + '/page/' + shortUrl,
			type: 'POST',
			data: {
				Magica: Magica,
				url: shortUrl,
				comment: comment,
				userpost: userPost
			},
			success: function(result) {
			
			},
			error: function() {
			
			}
		});
	});
});

function listComments(data, url) {
	var comm = data.row,
		list = $(comm).find('.b-comments__list');
		
	$(list).insertAfter('.b-comments__container');
	$('input[name="url"]').val(url);
	$('input[name="Magica"]').val(Magica);
}

// получаем магию
function getMagica () {
    $.ajax({
        url: 'http://surfingbird.ru/ajax/magickey',
        success: function(data) {
            Magica = data;
			return Magica;
        }
    });
}