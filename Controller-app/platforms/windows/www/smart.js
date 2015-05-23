//ons..bootstrap();
angular.module('app', ['onsen']);

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (PushbotsPlugin.isAndroid()) {
        PushbotsPlugin.initializeAndroid("555110991779599e3a8b456a", "388849099928");
    }
}


$(document).ready(function () {
	refresh();
	prepare();
});


var prepare = function () {

	var register = false;
    //console.log('Prepared.');

	$('#message').on('input propertychange paste', function () {
	    console.log("změna");
	});

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
		register = !register;
		$("#regPass").toggle();
		$("#regMail").toggle();
	});
	$(document).on('click', '.contactCard', function (e) {
	    console.log();
	    nav.pushPage('chat.html', { animation: 'slide', id: 'chat', user: e.currentTarget.id });
	});
	$(document).on('click', '#logOutBtn', function () {
	    console.log("Odpojuji účet");
	    $('.namePlace').html("odpojen");
	    $('.content').html("Účet odpojen")
	    localStorage.setItem("login", false);
	});

	$(document).on('click', '#send', function () {
	    if ($("#message").val() == "")
	    {
	        return;
	    }
	    console.log("Odesílám zprávu.");
	    var from = localStorage.getItem("name");
	    var to = $('#sendTo').html();
	    socket.emit('message', { 'from': from, 'to': to, 'message': $("#message").val() });
	    AddMessageToChat("right", $("#message").val(), "self");
	    $("#message").val("");
	});
	

	$(document).on('click', '.notificator', function () {
	    removeBar();
	});

	$(document).on('click', '#openChat', function () {
	    var from = $('#valueHolder').html();
	    nav.pushPage('chat.html', { animation: 'slide', id: 'chat', user: from });
	});
	

	$(document).on('click', '.message', function () {
	    console.log($("#dataHolderFrom").html());
	    console.log($("#dataHolderMessage").html());
	    openMessage($("#dataHolderFrom").html(), $("#dataHolderMessage").html());
	});

	$(document).on('click', '#loginBtn', function(e){

		if (register)
		{
			console.log('Register handler');
			var name    = $('#logName').val();
			var mail    = $('#regMail').val();
			var pass    = $('#logPass').val();
			var regPass = $('#regPass').val();

			if (pass == regPass)
			{
				$('.msgBox').html('<b class="blue">Registrace probíhá, prosím vyčkejte.</b>');
				$('#loginBtn').attr('disabled','disabled');
				$('#logIcon').show();
				/*$.post( "http://pospile.ddns.net/status/module/", function( data ) {
				  $('.msgBox').html('<b class="blue">' + data + '</b>');
				});*/
			}
			else
			{
				$('.msgBox').html('<b class="red">Chyba: Hesla se neschodují.</b>');
			}
		}
		else
		{
			console.log('Login handler');
			var nameVar    = $('#logName').val();
			var passVar    = $('#logPass').val();

			if (nameVar != '' || passVar != '')
			{
			    $('.msgBox').html('<b class="blue">Přihlášení probíhá, prosím vyčkejte.</b>');
			    $('#loginBtn').attr('disabled','disabled');
			    $('#logIcon').show();
			    console.log(nameVar + " " + passVar);
				$.post( "http://pospile.ddns.net/user/login", { name: nameVar, pass: passVar })
				  .done(function (data) {
				      /*
                        USER IS LOGGED IN
                      */
				      AfterLoggedIn(data);
				});
			}
			else
			{
				$('.msgBox').html('<b class="red">Chyba: Jméno i heslo musí být vyplněno.</b>');
			}

		}

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

    if (localStorage.getItem("login") == "true") {
        LoginSave(localStorage.getItem("name"), localStorage.getItem("email"), localStorage.getItem("token"));
    }

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


var renderContactList = function () {
    if (localStorage.getItem("login") == "true")
    {
        var token = localStorage.getItem("token");
        $.post("http://pospile.ddns.net/user/list", { 'token': token })
		.done(function (data) {
		    var myname = localStorage.getItem("name");
		    console.log(data);
		    for (var i = 0; i < data.length; i++) {
		        if (data[i].username != myname)
		        {
		            $('.contactList').append('<div class="wrapper-card contactCard" id="' + data[i].username + '"><div class="card"><div class="content msgBox"><div style="margin: 5%;"><span class="username blue">' + data[i].username + '</span><div style="float: right;"><i class="icon ion-ios-chatbubble red"></i></div></div></div></div></div>');
		        }
		    }
		});
    }
    else
    {
        $('.contactList').html('<div class="red center" style="margin: 10%;">PROSÍM PŘIHLAŠTE SE PRO PŘÍSTUP KE KONTAKTŮM</div>');
    }
}

var renderChat = function (username) {
    $('#sendTo').html(username);
    loadChat(username);
}

    var AfterLoggedIn = function (data) {

        localStorage.setItem("login", "true");
        localStorage.setItem("name", data.username);
        localStorage.setItem("email", data.email);
        localStorage.setItem("token", data.token);

        $('#logIcon').hide();
        $('.login-form').hide();
        $('.msgArea').hide();
        $('.namePlace').html(data.username);
        $('#mailPlace').html(data.email);
        var token = data.token.slice(0, 10) + "...";
        $('#tokenPlace').html(token);
        $('.loggedIn').show();

    }

    var LoginSave = function (name, mail, token) {

        $('#logIcon').hide();
        $('.login-form').hide();
        $('.msgArea').hide();
        $('.namePlace').html(name);
        $('#mailPlace').html(mail);
        var token = token.slice(0, 10) + "...";
        $('#tokenPlace').html(token);
        $('.loggedIn').show();

    }

    var AddMessageToChat = function (side, message, from) {

        if (side == "left")
        {
            $(".chatWindow").append('<div class="message left"><div class="message-text"><span class="red">' + from + ': </span>' + message + '</div></div>');
            $(".chatWindow").scrollTop = $(".chatWindow").scrollHeight;
        }
        else
        {
            $(".chatWindow").append('<div class="message right"><div class="message-text">' + message + '</div></div>');
            $(".chatWindow").scrollTop = $(".chatWindow").scrollHeight;
        }

        $(".chatWindow").animate({ scrollTop: $(document).height() }, "slow");


    }

    var removeBar = function ()
    {
        $(".messageBar").slideUp('slow', function () {
            $(".messageBar").remove();
        });
    }

    var openMessage = function (from, message)
    {
        removeBar();
        nav.pushPage('chat.html', { animation: 'slide', id: 'chat', user: from });
        setTimeout(function () {
            AddMessageToChat("left", message, from);
        }, 100);
    }

