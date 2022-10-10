var stompClient = null;
var notificationCount = 0;

$(document).ready(function () {
	console.log("Index page is ready");
	connect();

//  send global message
	$("#send").click(function () {
		sendMessage();
	});

//  send private message
	$("#send-private").click(function () {
		sendPrivateMessage();
	});

// reset notifications(notification 숫자 클릭시 reset 됨)
	$("#notifications").click(function () {
		resetNotificationCount();
	});
});

function connect() {
	var socket = new SockJS("/our-websocket");
	stompClient = Stomp.over(socket);
	stompClient.connect({}, function (frame) {
		console.log("Connected: " + frame);

// notification 표시하기(notificationCount == 0이므로 hide 상태)
		updateNotificationDisplay();

// global messaging
		stompClient.subscribe("/topic/messages", function (message) {
			showMessage(JSON.parse(message.body).content);
		});

// private messaging
		stompClient.subscribe("/user/topic/private-messages", function (message) {
			showMessage(JSON.parse(message.body).content);
		});

// global message에 대한 notification 표시
// notificationCount > 0 이므로 show 상태
		stompClient.subscribe("/topic/global-notifications", function (message) {
			notificationCount += 1;
			updateNotificationDisplay();
		});

// private message에 대한 notification 표시
// notificationCount > 0 이므로 show 상태
		stompClient.subscribe(
			"/user/topic/private-notifications",
			function (message) {
				notificationCount += 1;
				updateNotificationDisplay();
			}
		);
	});
}

function showMessage(message) {
	$("#messages").append("<tr><td>" + message + "</td></tr>");
}

// global messaging
function sendMessage() {
	console.log("sending message");
	stompClient.send(
		"/ws/message",
		{},
		JSON.stringify({ messageContent: $("#message").val() })
	);
}

// private messaging
function sendPrivateMessage() {
	console.log("sending private message");
	stompClient.send(
		"/ws/private-message",
		{},
		JSON.stringify({ messageContent: $("#private-message").val() })
	);
}

// Notification 표시하기
function updateNotificationDisplay() {
	if (notificationCount == 0) {
		$("#notifications").hide();
	} else {
		$("#notifications").show();
		$("#notifications").text(notificationCount);
	}
}

// Notification 숫자 리셋하기
function resetNotificationCount() {
	notificationCount = 0;
	updateNotificationDisplay();
}