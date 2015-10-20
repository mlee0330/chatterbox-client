var username = window.location.search.split('=')[1];
var rooms = {};

var message = {
  username: username,
  text: '<script>alert(\'hi\')</script>',
  roomname: 'hr10'
};



var sanitize = function(str) {
  if(str === undefined) {
    return;
  }
  var stringArr = str.split('');
  var msg = [];
  for(var i = 0; i < stringArr.length; i++) {
    if(stringArr[i] === "<" ) {
      stringArr[i] = '&lt';
    }
    if(stringArr[i] === ">") {
      stringArr[i] = '&gt';
    }
    msg.push(stringArr[i]);
  }
  return msg.join("");
};

var messageParser = function(data) {
  var results = data.results;
  var $feed = $(".feed");
  console.log(data);
  for( var i = 0; i < results.length; i++) {
    var message = sanitize(results[i].text);
    var username = sanitize(results[i].username);
    
    if (results[i].roomname !== undefined){
      rooms[results[i].roomname] = results[i].roomname;
    }
    console.log(message);
    $feed.append("<p>"+username+": "+message+"</p>");
  }
};

var getMessages = {
  // This is the url you should use to communicate with the parse API server.
  url: 'https://api.parse.com/1/classes/chatterbox?order=-createdAt',
  type: 'GET',
  contentType: 'application/json',
  success: messageParser,
  error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to recieve message. Error: ', data);
  }
};

var sendMessage = {
  // This is the url you should use to communicate with the parse API server.
  url: 'https://api.parse.com/1/classes/chatterbox',
  type: 'POST',
  data: JSON.stringify(message),
  contentType: 'application/json',
  success: function (data) {
    console.log('chatterbox: Message sent. Data: ', data);
  },
  error: function (data) {
    // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to send message. Error: ', data);
  }
};


//$.ajax(sendMessage);
$.ajax(getMessages);

$(document).ready(function() {
  $('.update-btn').click(function(){
    $('.feed p').remove();
    $.ajax(getMessages);
  });

  $('.send-btn').click(function(){
    message.text = $('.message').val();
    sendMessage.data = JSON.stringify(message);
    $.ajax(sendMessage);
    $('.feed p').remove();
    $.ajax(getMessages);
    $('.message').val("");
  });

  });