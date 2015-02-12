function placeInputField(fieldid, targetValue, offsetTop, offsetLeft)
{
	console.log(fieldid, offsetTop, offsetLeft);
	$("#wrapper").append("<input class=\"question\" type=\"text\" id=\"" + fieldid + "\"/>");
	$("#"+fieldid).offset({top: offsetTop, left: offsetLeft});
	$("#"+fieldid).keyup(function(event) {checkInputWithEvaluatingFunction(event, fieldid, targetValue)});
}

checkInputWithEvaluatingFunction = function(event, fieldid, evaluationFunction) {
	// console.log(event);
	var value = event.target.value;
	if(evaluationFunction(value))
	{
		$("#"+fieldid).css({"background-color": "#7f7"});
	}
	else
	{
		$("#"+fieldid).css({"background-color": "#f77"});
	}
}

function readyFunction() {
	console.log("In readyFunction");

	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	timerInterval = setInterval(showTimeStamp, 1000);

	$("#removeQuestions").click(removeQuestions);
	$("#frameOverlay").mousemove(function( event ) {
		var msg = "Handler for .mousemove() called at ";
		msg += event.pageX + ", " + event.pageY;
		$("#cursorPosition").text(msg);
	});
}

var player;
var timerInterval;

function onYouTubeIframeAPIReady() {
	console.log("in onYouTubeIframeAPIReady");
	player = new YT.Player('player', {
		height: 600, 
		width: 800,
		videoId: youtubeVideoId, 
		events: {
			'onReady': insertVideo
		}
	});
}

function insertVideo() {
	player.playVideo();
}

function removeQuestions() {
	console.log("Remove questions")
	$(".question").remove();
	player.playVideo();
	questions.shift();
	timerInterval = setInterval(showTimeStamp, 1000);
}

function showTimeStamp() {
	timestamp = player.getCurrentTime();
	console.log(timestamp);
	if(questions.length > 0 && questions[0].timecode < timestamp)
	{
		player.seekTo(questions[0].timecode);
		player.pauseVideo();
		console.log("Adding input fields");
		for(var k = 0; k < questions[0].questions.length; k++)
		{
			var question = questions[0].questions[k];
			placeInputField(
				question.name, 
				question.answer, 
				question.topoffset, 
				question.leftoffset);
		}
		clearInterval(timerInterval);
	}
}


$(document).ready(readyFunction);

