var username = window.location.search.split('=')[1];
var roomFilter = '';
var updateRoomList = true;
var friends = {};

var message = {
  username: username,
  text: '<script>alert(\'hi\')</script>',
  roomname: 'testingroom'
};


var sanitize = function(str) {
  if(str === undefined || str === null) {
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
  var rooms = {};
  var results = data.results;
  var $feed = $(".feed");
  $feed.empty();
  console.log(data);
  for( var i = 0; i < results.length; i++) {
    var message = sanitize(results[i].text);
    var username = sanitize(results[i].username);
    
    if (results[i].roomname !== undefined){
      rooms[results[i].roomname] = results[i].roomname;
    }
    //console.log(message);
    var friendClass = '';
    if (friends[username] !== undefined){
      friendClass = 'friend';
    }
    $feed.append("<div><span class='username " + friendClass +"'>"+username+"</span>: <span class='message " + friendClass + " '>"+message+"</span></div>");
  }
  if(updateRoomList) {
    updateRoomDropdown(rooms);
  }
};

// url + order + where
var baseURL = 'https://api.parse.com/1/classes/chatterbox?order=-createdAt'; 
var getMessages = {
  // This is the url you should use to communicate with the parse API server.
  url: baseURL,
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

var submitMessage = function(){
  message.text = $('.message').val();
  sendMessage.data = JSON.stringify(message);
  //set updateRoomList to false so room menu doesn't clear when running getMessages
  updateRoomList = false;
  $.ajax(sendMessage).success(function(){
    $.ajax(getMessages).success(function(){
      updateRoomList = true;
    });
  });
  $('.message').val("");
};

var updateRoomDropdown = function(rooms){
  $('.dropdown-menu').empty();
  $('.dropdown-menu').append('<li class ="drop-link">All Rooms</li>');
  $('.dropdown-menu').append('<li role="separator" class="divider"></li>');
  for (var room in rooms){
    //append li elements for each room
    $('.dropdown-menu').append('<li class="drop-link">'+ room +'</li>');
  }
};

var selectRoom = function(room){
  roomFilter = '';
  if (room !== "All Rooms"){
    roomFilter = '&where={"roomname":' + '"' + room + '"' + '}';
  }
  message.roomname = room;
  getMessages.url = baseURL + roomFilter;
  $.ajax(getMessages).success(function(){
    updateRoomList = true;
  });
};

//$.ajax(sendMessage);
$.ajax(getMessages);

$(document).ready(function() {
  
  $('.update-btn').click(function(){
    $.ajax(getMessages);
  });

  $('.send-btn').click(function(){
    submitMessage();
  });

  $('.message').bind('keypress', function(e){
    if (e.which === 13) { 
      event.preventDefault();
      submitMessage();
    }
  });

  $(document).on("click", '.drop-link', function() {
    console.log($(this).text());
    $(".dropdown-toggle").text($(this).text());
    updateRoomList = false;
    selectRoom($(this).text());
  });

  $(document).on("click", '.username', function() {
    console.log($(this).text());
    var $friend = $(this).text();
    friends[$friend] = $friend;
    updateRoomList = false;
    $.ajax(getMessages).success(function(){
      updateRoomList = true;
    });
  });


});