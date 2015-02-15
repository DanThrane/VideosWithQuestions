var player;
var questions = [];

/**
 * @brief               Places a single input field used in questions.
 * @details             
 * 
 * @param fieldId       Type: String. The ID of the field.
 * @param evalFunction  Type: (string) => boolean. The function used to evaluate answers.
 * @param offsetTop     Type: Integer. Y offset relative to top-left corner of player.
 * @param offsetLeft    Type: Integer. X offset relative to top-left corner of player.
 */
function placeInputField(fieldId, evalFunction, offsetTop, offsetLeft) {
    $("#wrapper").append(createInputField(fieldId));
    $("#" + fieldId).css({
        position: "absolute",
        top: offsetTop + "px", 
        left: offsetLeft + "px"
    });

    var button = $("#" + fieldId + " button");
    button.tooltip();
    button.click(function(e) {
        var val = $("#" + fieldId + " input").val();
        var symbol = $("#" + fieldId + " i");
        symbol.removeClass("glyphicon-pencil glyphicon-remove glyphicon-ok");
        button.removeClass("btn-default btn-danger btn-success");
        
        if (evalFunction(val)) {
            symbol.addClass("glyphicon-ok");
            button.addClass("btn-success");
        } else {
            symbol.addClass("glyphicon-remove");
            button.addClass("btn-danger");
        }
    }); 
}

function initQuestions() {
    for (var i = timeline.length - 1; i >= 0; i--) {
        var item = timeline[i];
        questions = questions.concat(item.questions);
    };
}

function buildNavigation() {
    var nav = $("#videoNavigation");
    for (var i = 0; i < timeline.length; i++) {
        var item = timeline[i];
        var nodeId = "navitem" + String(i);
        var node = $(createNavItem(item, nodeId));

        nav.append(node);
        $("#" + nodeId).click(handleNavigationClick(item));

        if (item.questions.length > 0) {
            var list = $("<ul></ul>");
            nav.append(list);
            for (var j = 0; j < item.questions.length; j++) {
                var question = item.questions[j];
                var questionId = "navitem" + String(i) + String(j)
                var questionNode = $(createNavItem(question, questionId));
                
                list.append(questionNode);
                $("#" + questionId).click(handleNavigationClick(question));
            };
        }
    };
}

function handleNavigationClick(item) {
    return function(e) {
        e.preventDefault();
        player.currentTime(item.timecode); 
        player.play();
    };
}

function readyFunction() {
    console.log("In readyFunction");

    initQuestions();
    buildNavigation();

    player = Popcorn.smart("#player", "http://www.youtube.com/watch?v=" + youtubeVideoId + "&controls=1");
    player.on("timeupdate", handleTimeUpdate);
    player.on("seeked", handleSeeked);
    player.on("play", function() { removeAllQuestions(); }); // Remove all questions when we continue playing

    //player.play();
}

function removeAllQuestions() {
    console.log("Remove questions")
    $(".question").remove();
    hideAllFields();
}

function handleTimeUpdate() {
    var timestamp = player.currentTime();
    for (var i = questions.length - 1; i >= 0; i--) {
        var q = questions[i];
        if (q.timecode !== Math.round(timestamp) && q.visible) {
            removeAllQuestions();
            q.visible = false;
        } else if (q.timecode === Math.round(timestamp) && !q.visible && !q.shown) {
            // Will cause a seek event, which in turn will reset everything
            player.pause();
            q.visible = true;
            q.shown = true;
            console.log("Adding input fields");
            for(var k = 0; k < q.fields.length; k++) {
                var field = q.fields[k];
                placeInputField(
                    field.name, 
                    field.answer, 
                    field.topoffset, 
                    field.leftoffset);
            }
        }
    };
}

function hideAllFields() {
    for (var i = questions.length - 1; i >= 0; i--) {
        questions[i].visible = false;
    };
}

function handleSeeked() {
    for (var i = questions.length - 1; i >= 0; i--) {
        questions[i].visible = false;
        questions[i].shown = false;
    };
    hideAllFields();
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

function createNavItem(item, id) {
    return '<li><a href="#" id="' + id + '">' + formatTime(item.timecode) +  ' - ' +  item.title + '</a></li>';
}

function formatTimeUnit(unit) {
    if (unit < 10) return "0" + Math.floor(unit);
    return unit;
}

/**
 * @brief       Formats time into a human readable string.
 * @details     The returned string will be in the format [DD:][HH:]MM:SS
 * 
 * @param time  Type: Integer. Time in seconds.
 * @return      The time as a string
 */
function formatTime (time) {
    var totalSecs = time;
    var totalMins = totalSecs / 60;
    var totalHours = totalMins / 60;
    var totalDays = totalHours / 24;
    
    var secs = totalSecs % 60;
    var mins = totalMins % 60;
    var hours = totalHours % 24;
    var result = "";
    
    if (totalDays >= 1) result += formatTimeUnit(totalDays) + ":";
    if (hours >= 1) result += formatTimeUnit(hours) + ":";
    result += formatTimeUnit(mins) + ":";
    result += formatTimeUnit(secs);
    return result;
}

$(document).ready(readyFunction);