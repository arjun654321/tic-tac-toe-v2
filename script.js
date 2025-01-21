const initializeGameBoard = () => {
    const gameGrid = $("#game-grid");
    gameGrid.find("t").remove();
    gameGrid
        .removeClass("active-grid")
        .addClass("active-grid")
        .append('<div id="timer"></div>');
    $("t").html(
        `<div id="top"></div>
        <div id="right"></div>
        <div id="bottom"></div>
        <div id="left"></div>`
    );
    gameGrid.find(".game-result").removeClass("player-two player-one white").hide();
    $(".game-container")
        .addClass("playable current")
        .html(
            `<div class="field">
                <div class="game-result">
                    <div class="info"></div>
                </div>
                ${'<div class="s"></div>'.repeat(9)}
            </div>`
        )
        .css({ outline: "none" });
    $(".s").html("<div></div>");
    setupField($(".game-container"));
};

let currentTurn = 0;
let turnDuration = 15;
let isPaused = false;
let players;
let randomIndex;
let activePlayer;
let activePlayerColor;
let opponentPlayer;
let opponentPlayerColor;
let timerStart;
let playerOneColor = "DodgerBlue";
let playerTwoColor = "Tomato";
let winningCombinations = [
            '1,2,3', '4,5,6', '7,8,9',
            '1,4,7', '2,5,8', '3,6,9',
            '1,5,9', '3,5,7'
        ];

let isGameActive = true;
let timerInterval;

function stopTimer() {
    clearInterval(timerInterval);
}

function resetGame() {
    isGameActive = true;
    activePlayer = players[Math.floor(Math.random() * players.length)];
    $("#timeup").remove();
    initializeGameBoard();
    startTimer();
}

let winningFieldIndex = null;
let winningSquareIndex = null;

const setupField = (container) => {
    currentTurn++;
    players = ["player-two", "player-one"];
    randomIndex = Math.floor(Math.random() * players.length);
    activePlayer = players[randomIndex];

    adjustSize();
    container.find(".game-result").css({ display: "none" });
    container.find(".s").css({ backgroundColor: "#f2f2f2" });
    container.find(".s").addClass("clickable rippled");
    container.find(".s").removeClass("player-two player-one");
    switchPlayer();
};

const switchPlayer = () => {
    if (activePlayer === "player-two") {
        activePlayer = "player-one";
        activePlayerColor = playerOneColor;
        opponentPlayer = "player-two";
        opponentPlayerColor = playerTwoColor;
    } else {
        activePlayer = "player-two";
        activePlayerColor = playerTwoColor;
        opponentPlayer = "player-one";
        opponentPlayerColor = playerOneColor;

        TweenMax.killDelayedCallsTo(botMakeRandomMove);
        TweenMax.delayedCall(1, botMakeRandomMove);
    }
    if ($("#game-grid").hasClass("active-grid")) {
        $("#game-grid.active-grid").css("outline", `1px solid ${activePlayerColor}`);
    } else {
        $(".game-container.current").css("outline", `1px solid ${activePlayerColor}`);
    }
    startTimer();
};

const botMakeRandomMove = () => {
    console.log("botMakeRandomMove");
    if ($("#game-grid > .game-result").hasClass(players[0]) || $("#game-grid > .game-result").hasClass(players[1])) {
        return;
    }

    simulateWinningMove();
    console.log('>>', winningFieldIndex, winningSquareIndex);
    if (winningFieldIndex !== null && winningSquareIndex !== null) {
        $("#game-grid .game-container")
            .eq(winningFieldIndex - 1)
            .find(".s")
            .eq(winningSquareIndex)
            .click();
        winningFieldIndex = null;
        winningSquareIndex = null;
        return;
    }

    console.log('Random move');
    let availableFields = [];
    $("#game-grid .game-container.playable.current").each(function () {
        availableFields.push($(this).index());
    });
    let randomFieldIndex = availableFields[Math.floor(Math.random() * availableFields.length)] - 1;

    let availableSquares = [];
    $("#game-grid .game-container")
        .eq(randomFieldIndex)
        .find(".s.clickable")
        .each(function () {
            availableSquares.push($(this).index());
        });
    let randomSquareIndex = availableSquares[Math.floor(Math.random() * availableSquares.length)] - 1;

    $("#game-grid .game-container")
        .eq(randomFieldIndex)
        .find(".s")
        .eq(randomSquareIndex)
        .click();
};


function startTimer() {
    timerStart = Math.floor(Date.now() / 1000);
    let totalTime = turnDuration;
    if (turnDuration === 4) {
        $("t").hide();
    } else {
        $("t").show();
        if (!$("#game-grid").hasClass("active-grid")) {
            $(".game-container.current").append($("t"));
        } else {
            $("#game-grid").append($("t"));
        }
        let lineColor = (activePlayer === "player-two") ? "player-one" : "player-two";
        TweenMax.killTweensOf(
            "t #top, t #right, t #bottom, t #left"
        );
        TweenMax.to($("t #top"), totalTime / 4, {
            width: "100%",
            startAt: {
                width: "0px"
            },
            immediateRender: true,
            ease: Linear.easeNone
        });
        TweenMax.to($("t #right"), totalTime / 4, {
            height: "100%",
            startAt: {
                height: "0px"
            },
            immediateRender: true,
            ease: Linear.easeNone,
            delay: totalTime / 4
        });
        TweenMax.to($("t #bottom"), totalTime / 4, {
            width: "100%",
            startAt: {
                width: "0px"
            },
            immediateRender: true,
            ease: Linear.easeNone,
            delay: (totalTime / 4) * 2
        });
        TweenMax.to($("t #left"), totalTime / 4, {
            height: "100%",
            startAt: {
                height: "0px"
            },
            immediateRender: true,
            ease: Linear.easeNone,
            delay: (totalTime / 4) * 3,
            onComplete: handleTimeUp
        });
    }
}

function handleTimeUp() {
    let currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - timerStart >= turnDuration) {
        $("#game-container").prepend(
            '<div id="timeup"><div class="content"><h1>Too late</h1><h3>Next up is player <font color="' +
            opponentPlayerColor +
            '">' +
            opponentPlayer +
            '</font></h3><div id="next-player">Continue</div></div></div>'
        );
    }
}

$("#game-container").on("click", "#next-player", function() {
    resetGame();
});

function simulateWinningMove() {
    console.log("simulateWinningMove");
    $(".game-container.playable.current").each(function () {
        let $field = $(this);
        let fieldIndex = $field.index();
        if (winningFieldIndex !== null && winningSquareIndex !== null) {
            return;
        }
        let currentPlayerSequence = [];
        let opponentPlayerSequence = [];

        if ($field.find(".s." + activePlayer).length < 2) {
            winningFieldIndex = null;
            winningSquareIndex = null;
            return;
        }

        $field.find(".s." + activePlayer).each(function () {
            currentPlayerSequence.push($(this).index());
        });

        $field.find(".s." + opponentPlayer).each(function () {
            opponentPlayerSequence.push($(this).index());
        });

        let availableWinningMoves = winningCombinations.slice();
        opponentPlayerSequence.forEach((element) => {
            availableWinningMoves = availableWinningMoves.filter((item) => !item.includes(element));
        });

        for (let i = 0; i < availableWinningMoves.length; i++) {
            let winningSequence = availableWinningMoves[i].split(",").join("");
            let currentPlayerCount = 0;
            let lastPlayableSquare;

            for (let j = 0; j < winningSequence.length; j++) {
                if (
                    $field
                        .find(".s")
                        .eq(winningSequence[j] - 1)
                        .hasClass(activePlayer)
                ) {
                    currentPlayerCount++;
                } else {
                    lastPlayableSquare = winningSequence[j] - 1;
                }
            }

            if (currentPlayerCount < 2) {
                availableWinningMoves.splice(i, 1);
                i--;
            }

            if (currentPlayerCount >= 2 && fieldIndex !== null && lastPlayableSquare !== null) {
                winningFieldIndex = fieldIndex;
                winningSquareIndex = lastPlayableSquare;
                return;
            } else {
                winningFieldIndex = null;
                winningSquareIndex = null;
            }
        }
    });
}

function validateGrid() {
    let winner = null;

    for (let i = 0; i < winningCombinations.length; i++) {
        let winningSequence = winningCombinations[i].split(",");
        let resultClasses = [];

        for (let j = 0; j < winningSequence.length; j++) {
            let targetField = $(".game-container").eq(winningSequence[j] - 1);
            let resultClass = targetField.find(".game-result").attr("class");
            if (resultClass) {
                resultClasses.push(resultClass.split(" ")[1]);
            }
        }

        if (resultClasses.length === 3 && resultClasses[0] === resultClasses[1] && resultClasses[1] === resultClasses[2]) {
            winner = resultClasses[0];
            break;
        }
    }

    if (winner) {
        stopTimer();
        let winnerText = winner === "player-one" ? "Player Blue" : "Player Red";
        let winnerColor = winner === "player-one" ? playerOneColor : playerTwoColor;

        $("#game-container").prepend(`
            <div id="timeup">
                <div class="content">
                    <h1>${winnerText} Wins!</h1>
                    <div id="next-player" style="width: 150px;">Play Again</div>
                </div>
            </div>
        `);

        $("#game-grid > .game-result").addClass(winner).css({
            display: "inherit",
            backgroundColor: winnerColor
        });

        isGameActive = false;
    } else if (!$(".game-container").hasClass("playable")) {
        stopTimer();
        $("#game-container").prepend(`
            <div id="timeup">
                <div class="content">
                    <h1>It's a Tie!</h1>
                    <div id="next-player" style="width: 150px;">Play Again</div>
                </div>
            </div>
        `);
        isGameActive = false;
    }
}

const validateField = (field) => {
    if (
        (field.find(".s").eq(0).hasClass("player-one") &&
            field.find(".s").eq(1).hasClass("player-one") &&
            field.find(".s").eq(2).hasClass("player-one")) ||
        (field.find(".s").eq(3).hasClass("player-one") &&
            field.find(".s").eq(4).hasClass("player-one") &&
            field.find(".s").eq(5).hasClass("player-one")) ||
        (field.find(".s").eq(6).hasClass("player-one") &&
            field.find(".s").eq(7).hasClass("player-one") &&
            field.find(".s").eq(8).hasClass("player-one")) ||
        (field.find(".s").eq(0).hasClass("player-one") &&
            field.find(".s").eq(3).hasClass("player-one") &&
            field.find(".s").eq(6).hasClass("player-one")) ||
        (field.find(".s").eq(1).hasClass("player-one") &&
            field.find(".s").eq(4).hasClass("player-one") &&
            field.find(".s").eq(7).hasClass("player-one")) ||
        (field.find(".s").eq(2).hasClass("player-one") &&
            field.find(".s").eq(5).hasClass("player-one") &&
            field.find(".s").eq(8).hasClass("player-one")) ||
        (field.find(".s").eq(0).hasClass("player-one") &&
            field.find(".s").eq(4).hasClass("player-one") &&
            field.find(".s").eq(8).hasClass("player-one")) ||
        (field.find(".s").eq(2).hasClass("player-one") &&
            field.find(".s").eq(4).hasClass("player-one") &&
            field.find(".s").eq(6).hasClass("player-one"))
    ) {
        field.find(".game-result").addClass("player-one").css({
            display: "inherit",
            backgroundColor: playerOneColor
        });
        field.removeClass("playable");
        validateGrid();
    } else if (
        (field.find(".s").eq(0).hasClass("player-two") &&
            field.find(".s").eq(1).hasClass("player-two") &&
            field.find(".s").eq(2).hasClass("player-two")) ||
        (field.find(".s").eq(3).hasClass("player-two") &&
            field.find(".s").eq(4).hasClass("player-two") &&
            field.find(".s").eq(5).hasClass("player-two")) ||
        (field.find(".s").eq(6).hasClass("player-two") &&
            field.find(".s").eq(7).hasClass("player-two") &&
            field.find(".s").eq(8).hasClass("player-two")) ||
        (field.find(".s").eq(0).hasClass("player-two") &&
            field.find(".s").eq(3).hasClass("player-two") &&
            field.find(".s").eq(6).hasClass("player-two")) ||
        (field.find(".s").eq(1).hasClass("player-two") &&
            field.find(".s").eq(4).hasClass("player-two") &&
            field.find(".s").eq(7).hasClass("player-two")) ||
        (field.find(".s").eq(2).hasClass("player-two") &&
            field.find(".s").eq(5).hasClass("player-two") &&
            field.find(".s").eq(8).hasClass("player-two")) ||
        (field.find(".s").eq(0).hasClass("player-two") &&
            field.find(".s").eq(4).hasClass("player-two") &&
            field.find(".s").eq(8).hasClass("player-two")) ||
        (field.find(".s").eq(2).hasClass("player-two") &&
            field.find(".s").eq(4).hasClass("player-two") &&
            field.find(".s").eq(6).hasClass("player-two"))
    ) {
        field.find(".game-result").addClass("player-two").css({
            display: "inherit",
            backgroundColor: playerTwoColor
        });
        field.removeClass("playable");
        validateGrid();
    } else if (!field.find(".s").hasClass("clickable")) {
        field
            .find(".game-result .info")
            .html(
                `<h1>It's a tie!</h1><h3><a href="#" id="retry-link">Retry</a></h3>`
            );
        field
            .find(".game-result")
            .css({
                display: "inherit"
            })
            .addClass("white");
        field.removeClass("playable");
        validateGrid();
    }
    switchPlayer();
};


$("#game-grid").on("click", ".s", function () {
    if (!isGameActive) return;
    if (
        $(this).hasClass("clickable") &&
        $(this).parent().parent().hasClass("current")
    ) {
        if (!$(this).hasClass("player-two") && !$(this).hasClass("player-one")) {
            $(this).removeClass("clickable");
            TweenLite.set($(this), {
                css: {
                    className: "+=" + activePlayer
                }
            });
            validateField($(this).parent().parent());
        }
        let clickedIndex = $(this).index();
        if (
            $(".game-container")
                .eq(clickedIndex - 1)
                .hasClass("playable")
        ) {
            $("#game-grid").removeClass("active-grid").css({
                outline: "none"
            });
            $(".game-container").removeClass("current").css({
                outline: "none",
                "z-index": 1
            });
            $(".game-container")
                .eq(clickedIndex - 1)
                .addClass("current")
                .css({
                    outline: "1px solid " + activePlayerColor,
                    "z-index": 9
                });
        } else {
            $("#game-grid")
                .addClass("active-grid")
                .css({
                    outline: "1px solid " + activePlayerColor
                });
            $(".game-container").removeClass("current").addClass("current").css({
                outline: "none",
                "z-index": 1
            });
        }
        startTimer();
    }
});

$("#game-grid > .game-result").on("click", () => {
    currentTurn = 0;
    initializeGameBoard();
    return false;
});


function adjustSize() {
    let gridMargin = "30px";
    let fieldMargin = "0px";
    if ($(window).width() < $(window).height()) {
        let target = $("#game-grid");
        target.css({
            left: gridMargin,
            right: gridMargin
        });
        let newMargin = (target.parent().height() - target.width()) / 2 + "px";
        target.css({
            top: newMargin,
            bottom: newMargin
        });
        let targetField = $(".field");
        targetField.css({
            left: fieldMargin,
            right: fieldMargin
        });
        let newFieldMargin =
            ($(".game-container").height() - targetField.width()) / 2 + "px";
        targetField.css({
            top: newFieldMargin,
            bottom: newFieldMargin
        });
    } else {
        let target2 = $("#game-grid");
        target2.css({
            top: gridMargin,
            bottom: gridMargin
        });
        let newMargin2 = (target2.parent().width() - target2.height()) / 2 + "px";
        target2.css({
            left: newMargin2,
            right: newMargin2
        });
        let targetField2 = $(".field");
        targetField2.css({
            top: fieldMargin,
            bottom: fieldMargin
        });
        let newFieldMargin2 =
            ($(".game-container").width() - targetField2.height()) / 2 + "px";
        targetField2.css({
            left: newFieldMargin2,
            right: newFieldMargin2
        });
    }
}

$(".knob").knob({
    change: function (value) {
        turnDuration = value;
        let displayValue = (turnDuration === 4) ? "&infin;" : value;
        $("#timer-value").html(displayValue);
    }
});
$("#timer-value").html(turnDuration);

const toggleMenu = (action) => {
    if (action === "show") {
        TweenMax.to($("#game-setup"), 0.4, {
            css: {
                left: 0
            }
        });
        TweenMax.to($("#game-playfield"), 0.4, {
            css: {
                left: "100%"
            }
        });
    } else {
        TweenMax.to($("#game-setup"), 0.4, {
            css: {
                left: "-100%"
            }
        });
        TweenMax.to($("#game-playfield"), 0.4, {
            css: {
                left: 0
            }
        });
    }
};


$("#start-button").on("click", function () {
    initializeGameBoard();
    toggleMenu("hide");
});
$("#back-to-menu").on("click", function () {
    isPaused = true;
    TweenMax.pauseAll();
    $("#menu-toggle").show();
    toggleMenu("show");
});
$("#menu-toggle").on("click", function () {
    isPaused = false;
    TweenMax.resumeAll();
    toggleMenu("hide");
});


$("body").on("click", ".rippled", (e) => {
    if (!$(e.currentTarget).hasClass("disabled")) {
        if ("vibrate" in navigator) {
            window.navigator.vibrate(10);
        }
        $(".s.last").removeClass("last");
        $(e.currentTarget)
            .addClass("last")
            .append('<div class="ripple ripple-animate"></div>');
        const source = $(e.currentTarget);
        const ripple = source.find(".ripple").last();
        ripple.removeClass("ripple-animate");
        ripple.addClass("ripple-animate");
        setTimeout(() => {
            source.removeClass("rippled");
            ripple.remove();
        }, 400);
    }
});

$(window).resize(() => {
    adjustSize();
});
