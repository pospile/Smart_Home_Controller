var initializeLocalData = function ()
{

}

var loadChat = function (from)
{
    var me = localStorage.getItem("name");
    var token = localStorage.getItem("token");
    console.log(token + from + me);
    $.post("http://pospile.ddns.net/user/chat", { 'token': token, 'from': from, 'to': me })
		.done(function (data) {
		    console.log(data);
		    for (var i = 0; i < data.length; i++) {
		        if (data[i].from == me) {
		            AddMessageToChat("right", data[i].message, data[i].from);
		        }
		        else
		        {
		            AddMessageToChat("left", data[i].message, data[i].from);
		        }
		    }
		    $(".spinner").hide();
		});
}