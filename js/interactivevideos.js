var player;

function placeInputField(fieldid, targetValue, offsetTop, offsetLeft) {
    $("#wrapper").append(createInputField(fieldid));
    $("#"+fieldid).css({
        position: "absolute",
        top: offsetTop + "px", 
        left: offsetLeft + "px"
    });

    var button = $("#" + fieldid + " button");
    button.tooltip();
    button.click(function(e) {
        var val = $("#" + fieldid + " input").val();
        var symbol = $("#" + fieldid + " i");
        symbol.removeClass("glyphicon-pencil glyphicon-remove glyphicon-ok");
        button.removeClass("btn-default btn-danger btn-success");
        
        if (targetValue(val)) {
            symbol.addClass("glyphicon-ok");
            button.addClass("btn-success");
        } else {
            symbol.addClass("glyphicon-remove");
            button.addClass("btn-danger");
        }
    }); 
}

function readyFunction() {
    console.log("In readyFunction");

    player = Popcorn.smart("#player", "http://www.youtube.com/watch?v=" + youtubeVideoId + "&controls=1");
    player.on("timeupdate", handleTimeUpdate);
    player.on("seeked", handleSeeked);
    player.on("play", function() { removeAllQuestions(); }); // Remove all questions when we continue playing

    //player.play();
}

function removeAllQuestions() {
    console.log("Remove questions")
    $(".question").remove();
}

function handleTimeUpdate() {
    var timestamp = player.currentTime();
    for (var i = questions.length - 1; i >= 0; i--) {
        var q = questions[i];
        if (q.timecode === Math.round(timestamp)  && !q.shown) {
            // Will cause a seek event, which in turn will reset everything
            player.pause();
            q.shown = true;
            console.log("Adding input fields");
            for(var k = 0; k < q.questions.length; k++) {
                var question = q.questions[k];
                placeInputField(
                    question.name, 
                    question.answer, 
                    question.topoffset, 
                    question.leftoffset);
            }
        }
    };
}

function handleSeeked() {
    for (var i = questions.length - 1; i >= 0; i--) {
        questions[i].shown = false;
    };
    removeAllQuestions();
}

function createInputField(id) {
    return '<div class="input-group question" style="width: 100px; padding-bottom: 10px;" id="' + id + '">' +
        '<input type="text" class="form-control" placeholder="">' +
        '<span class="input-group-btn">' +
          '<button class="btn btn-default" type="button" data-toggle="tooltip" data-placement="right" title="Tjek svar">' +
            '<i class="glyphicon glyphicon-pencil"></i>' + 
          '</button>' +
        '</span>' +
    '</div>'
}

$(document).ready(readyFunction);