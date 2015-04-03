//ons.bootstrap();
angular.module('app', ['onsen']);


$(document).ready(function() {
	refresh();
	prepare();
});


var prepare = function () {
	//console.log('Prepared.');
	$(document).on('click', '.list-item', function(e){
		console.log(e.target.id);
		nav.pushPage('modul.html',
			{
				animation : 'lift',
				id: e.target.id
			});
	});
	$(document).on('click', '#active', function(){
		$.getJSON($("#active").attr('name'), function () {
			wait.show();
			renderModulPage(nav.getCurrentPage());
		});
	});
	$(document).on('click', '#firstTime', function(){
		console.log('klinul jsi')
		$("#regPass").toggle();
		$("#regMail").toggle();
	});
}

var renderModulPage = function (page) {
	var renderFor = nav.getCurrentPage().options.id;
	$("#modulID").html(renderFor);

	$.getJSON('http://pospile.ddns.net/status/module/' + renderFor, function (data) {
		console.log(data);
		$('#active').attr('name', data.url);
		$(".modulName").html(data.name);
		$("#name").html(data.name);

		if(data.active == false)
		{
			$("#status").html('vypnuto');
			$("#active").prop('checked', false);
		}
		else
		{
			$("#status").html('zapnuto');
			$("#active").prop('checked', true);
		}

		$("#desc").html(data.description);

		setTimeout(function () {
			wait.hide();
		}, 500);


	}).error(function() { $("#loader").html("Chyba: Zkuste to prosím znovu."); });

}




var refresh = function () {
	$("#loadingIcon").show();
	$("#doneIcon").hide();

	$("#appendList").children().each(function (index, element) {
		$(element).delay(index * 2 * 150 + 300).slideUp('slow', function () {
			$(element).remove();
		});
	});
	refreshREST();
}

var refreshREST = function () {
	$.getJSON('http://pospile.ddns.net/status/module', function (data) {
		//console.log(data);
		for (var i = 0; i < data.length; i++) {
			var object = data[i];
			//console.log(object);
			$("#appendList").append('<li class="list-item" name="' + object.name + '" id="'+ object.id +'">'+ object.name.split('_').join(' ') + '</li>');
		}
		$("#loader").slideUp('slow', function () {
			$("#loader").remove();
		});
		setTimeout(function () {
			$("#loadingIcon").hide();
			$("#doneIcon").show();
		}, 2000);
	}).error(function() { $("#loader").html("Chyba: Zkuste to prosím znovu."); });
}

var returnHome = function () {
	menu.setMainPage('main.html', {closeMenu: true});
	setTimeout(function () {
		refresh();
	}, 1000);
}

var gotoStats = function () {
	menu.close();
	nav.pushPage('stats.html',
		{
			animation : 'lift',
			id: 'stats',
			urlTemp: 'http://pospile.ddns.net/status/temperature',
			urlLight: 'http://pospile.ddns.net/status/light',
			urlStatus: 'http://pospile.ddns.net/status'
		});
}

var renderStats = function () {
	$("#nonrefreshIcon").hide();
	$("#refreshIcon").show();
	$.getJSON(nav.getCurrentPage().options.urlTemp, function (data) {
		$("#temp").html(data.temperature + '° ');
		$.getJSON(nav.getCurrentPage().options.urlLight, function (data) {
			//console.log(data)
			$("#light").html(parseInt(data.light) / 100  + '° ');
			$.getJSON(nav.getCurrentPage().options.urlStatus, function (data){
				//console.log(data);
				$("#stat").html(data.system + ' ');
				setTimeout(function () {
					$("#refreshIcon").hide();
					$("#nonrefreshIcon").show();
				}, 1000);
				setTimeout(function () {
					console.log('live reload');
					renderStats();
				}, 5000);
			});
		});
	});
}