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

    $(document).ready(function () {
        var domainBtn = $('#domain'),
            adderBtn  = $('#adder'),
            catBtn    = $('.b-button__link_cat'),
            moreFrom = chrome.i18n.getMessage('MoreFrom');

        chrome.extension.sendRequest({ action : 'LIKE_MENU' }, function (response) {
            if (response.url) {
                var url = response.url.match(/:\/\/(.[^/]+)/)[1],
                    adder  = response.adder,
                    cats   = response.cats,
                    domain = url.replace('www.', '');

                domainBtn.html(moreFrom + ' www.' + domain);
                adderBtn.html(moreFrom + ' ' + adder);

                for (var i = 0; i < cats.length; i++) {
                    if (cats[i] in categories) {
                        var num = cats[i];
                        $('.b-button__list').append('<li class="b-button__item"><a id="cat' + num + '" class="b-button__link b-button__link_cat">' + categories[num] + '</a></li>');
                    }
                }

                domainBtn.live('click', function (event) {
                    event.preventDefault();
                    chrome.extension.sendRequest({ action : 'SURF_CLICK', domain : domain });
                });

                adderBtn.live('click', function (event) {
                    event.preventDefault();
                    chrome.extension.sendRequest({ action : 'SURF_CLICK', user : adder });
                });

                catBtn.live('click', function (event) {
                    var num = $(this).attr('id').replace('cat', '');
                    chrome.extension.sendRequest({ action : 'SURF_CLICK', cat : num });
                });
            }
        });
    });
