$(document).ready(function() {
	var notifChbx = $('input[name="notification"]'),
		notifState = localStorage['notification'],
		periodRadio = $('input[name="period"]'),
		optionsSave = $('#save'),
		optionsReset = $('#reset'),
		period = localStorage['notification-period'];
	
	if (notifState == '1') {
		notifChbx.attr('checked', true);
		$('.b-options__sub').removeClass('hide');
	}

	if (period) {
		$('input[value="'+ period +'"]').attr('checked', true);
	}
	
	notifChbx.on('change', function() {
		if (notifChbx.prop("checked")) {
			$('.b-options__sub').removeClass('hide');
		} else {
			$('.b-options__sub').addClass('hide');
		}
	});
	
	optionsSave.on('click', function() {
		localStorage['notification-period'] = $('input[name="period"]:checked').val();
		
		chrome.extension.sendRequest({ action: 'CHANGE_PERIOD' });
		
		if (notifChbx.prop("checked")) {
			localStorage['notification'] = 1;
		} else {
			localStorage['notification'] = 0;
		}
		window.close();
	});
	optionsReset.on('click', function() {
		window.close();
	});
});