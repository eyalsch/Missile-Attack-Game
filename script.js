// Base on a game name "Dalek" by Heiko Selber
// Written by: Eyal Schachner
const EMPTY = 0;
const TANK = 1;
const MISSILE = 2;
const EXPLOSION = 3;

var grid = document.getElementById("grid");
grid.onclick = function() {
    document.getElementById("HelpModal").style.display = "block";
};
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    document.getElementById("HelpModal").style.display = "none";
};

var scoreId = document.getElementById("scoreId");
var levelId = document.getElementById("levelId");
var hiscoreId = document.getElementById("hiscoreId");
var msg = document.getElementById("msg");

var COLS = 14;
var ROWS = 14;
var MAXNUMMISSILES = (COLS - 2) * (ROWS - 2);

var tankPlace = {
    x: -1,
    y: -1
};
var MissilePlace = {
    x: -1,
    y: -1
};
var Alive = true;
var Level = 0;
var NumMissileLeft = 0;
var HighestScore;
var BlowActive = true; // blow pressed
var Score = 0;

var Board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
var PrevBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
var Tcopy = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

StartGame();

function StartGame() {
    Alive = true;
    Level = 0;
    BlowActive = true;
    Score = 0;
    ClearTable(Board);
    ClearTable(PrevBoard);
    ClearTable(Tcopy);

    HighestScore = ReadHighestScore();
    hiscoreId.innerHTML = HighestScore;
    scoreId.innerHTML = Score;
    StartLevel();
    msg.innerHTML = "";
    document.getElementById("arrow").style.pointerEvents = "auto";
    document.getElementById("control").style.pointerEvents = "auto";
	bindKey();
}

function ClearTable(t) {
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            t[i][j] = EMPTY;
        }
    }
}

function CopyTable(a, b) { // copy a to b
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            b[i][j] = a[i][j];
        }
    }
}

function emptyN(x, y) { // empty Neighborhood when placing missiles
    console.log("emptyN function");
    if (Board[x][y] != EMPTY) {
        return false;
    }
    for (var i = Math.max(0, x - 1); i <= Math.min(ROWS - 1, x + 1); i++) {
        for (var j = Math.max(0, y - 1); j <= Math.min(COLS - 1, y + 1); j++) {
            if (Board[i][j] == TANK) {
                return false;
            }
        }
    }
    return true;
}

function StartLevel() {
    console.log("StartLevel function");
    document.getElementById("playLevelEnd").play();
    Level = Level + 1;
    ClearTable(Board);
    BlowActive = true;
    levelId.innerHTML = Level;

    tankPlace.x = Math.floor(Math.random() * ROWS);
    tankPlace.y = Math.floor(Math.random() * COLS);
    Board[tankPlace.x][tankPlace.y] = TANK;

    var i = 0;
    do {
        MissilePlace.x = Math.floor(Math.random() * ROWS);
        MissilePlace.y = Math.floor(Math.random() * COLS);
        if (emptyN(MissilePlace.x, MissilePlace.y)) {
            Board[MissilePlace.x][MissilePlace.y] = MISSILE;
            i = i + 1;
        }
    } while ((i < 4 * Level) && (i < MAXNUMMISSILES));

    NumMissileLeft = i;
    DisplayBoard();
    TablePrint(Board);
}

function MoveMissiles() {
    console.log("MoveMissiles function");
    var i, j;
    for (i = 0; i < ROWS; i++) {
        for (j = 0; j < COLS; j++) {
            if ((Board[i][j] == TANK) || (Board[i][j] == EXPLOSION)) {
                Tcopy[i][j] = Board[i][j];
            } else {
                Tcopy[i][j] = EMPTY;
            }
        }
    }

    // MOVE MISSILE and check for end of game
    for (i = 0; i < ROWS; i++) {
        for (j = 0; j < COLS; j++) {
            var iNew = i;
            var jNew = j;
            if (Board[i][j] == MISSILE) { // MOVE MISSILE
                if (jNew != tankPlace.y) {
                    if (jNew > tankPlace.y) {
                        jNew = jNew - 1;
                    } else {
                        jNew = jNew + 1;
                    }
                }
                if (iNew != tankPlace.x) {
                    if (iNew > tankPlace.x) {
                        iNew = iNew - 1;
                    } else {
                        iNew = iNew + 1;
                    }
                }
                // check if move on an explosion/missile/tank/empty
                // print("New position:",i,j,iNew, jNew, Tcopy[iNew][jNew])
                if (Tcopy[iNew][jNew] == EXPLOSION) {
                    Score = Score + 1;
                    NumMissileLeft = NumMissileLeft - 1;
                }
                if (Tcopy[iNew][jNew] == MISSILE) {
                    Tcopy[iNew][jNew] = EXPLOSION;
                    Score = Score + 2;
                    NumMissileLeft = NumMissileLeft - 2;
                }
                if (Tcopy[iNew][jNew] == TANK) {
                    Alive = false;
                }
                if (Tcopy[iNew][jNew] == EMPTY) {
                    Tcopy[iNew][jNew] = MISSILE;
                }
            }
        }
    }

    CopyTable(Board, PrevBoard);
    CopyTable(Tcopy, Board);
    scoreId.innerHTML = Score;
}

function ReadHighestScore() {
    console.log("ReadHighestScore function");
    return localStorage.getItem("MAHighestScore");
}

function SaveHighestScore() {
    console.log("SaveHighestScore function");
    localStorage.setItem("MAHighestScore", Score);
}

function DisplayBoard() {
    console.log("DisplayBoard function");
    grid.innerHTML = "";
    for (var i = 0; i < ROWS; i++) {
        var row = grid.insertRow(i);
        for (var j = 0; j < COLS; j++) {
            var cell = row.insertCell(j);
            var vvv = document.createAttribute("CellValue");
            if (Board[i][j] == TANK) {
                console.log("tank: " + i + "," + j);
                vvv.value = TANK;
                cell.className = "tank";
            }
            if (Board[i][j] == MISSILE) {
                vvv.value = MISSILE;
                var angle = -Math.atan2(j - tankPlace.y, i - tankPlace.x) * 180 / Math.PI;
                cell.innerHTML = "<img style=\"transform: rotate(" + angle + "deg);\" src=\"image/missile.png\">";
                cell.className = "missile";
            }
            if (Board[i][j] == EXPLOSION) {
                vvv.value = EXPLOSION;
                cell.className = "explosion";
            }
            cell.setAttributeNode(vvv);
        }
    }
}

function EndOfGame() {
    console.log("EndOfGame function");
    document.getElementById("playEndOfGame").play();
    DisplayBoard();
    document.getElementById("arrow").style.pointerEvents = "none";
    document.getElementById("control").style.pointerEvents = "none";
	unbindKey();
    if (Score > HighestScore) {
        msg.innerHTML = "Game Over<br>Final Score: " + Score + "<br>NEW HIGH SCORE!!!";
        SaveHighestScore();
    } else {
        msg.innerHTML = "Game Over<br>Final Score: " + Score;
    }
}

function move(key) {
    console.log("move function: " + key);

    // Play movement sound
    document.getElementById("playButton").play();

    // Define direction offsets for movement
    const directionOffsets = {
        1: [-1, -1], // Up Left
        2: [-1, 0],  // Up
        3: [-1, 1],  // Up Right
        4: [0, -1],  // Left
        6: [0, 1],   // Right
        7: [1, -1],  // Down Left
        8: [1, 0],   // Down
        9: [1, 1],   // Down Right
    };

    // Helper function to check boundaries
    function isWithinBounds(x, y) {
        return x >= 0 && x < ROWS && y >= 0 && y < COLS;
    }

    // Process movement if the key corresponds to a valid direction
    if (directionOffsets[key]) {
        const [dx, dy] = directionOffsets[key];
        const newX = tankPlace.x + dx;
        const newY = tankPlace.y + dy;

        // Check if the new position is within bounds
        if (isWithinBounds(newX, newY)) {
            // Update the board and tank position
            Board[tankPlace.x][tankPlace.y] = EMPTY;
            tankPlace.x = newX;
            tankPlace.y = newY;

            // Check for collision
            if (Board[tankPlace.x][tankPlace.y] !== EMPTY) {
                Alive = false;
            }

            // Update the board with the new tank position
            Board[tankPlace.x][tankPlace.y] = TANK;

            // Handle missiles and game state
            MoveMissiles();
            if (Alive) {
                if (NumMissileLeft === 0) {
                    StartLevel();
                } else {
                    DisplayBoard();
                }
            } else {
                EndOfGame();
            }
        } else {
            console.log("Move out of bounds: " + newX + ", " + newY);
        }
    } else {
        console.log("Invalid key: " + key);
    }
}

function stay() {
    console.log("stay function");
    document.getElementById("playButton").play();
    MoveMissiles();
    if (Alive) {
        if (NumMissileLeft == 0) {
            StartLevel();
        } else {
            DisplayBoard();
        }
    } else {
        EndOfGame();
    }
}

function jump() {
    console.log("jump function");
    document.getElementById("playJump").play();
    Board[tankPlace.x][tankPlace.y] = EMPTY;
    do {
        tankPlace.x = Math.floor(Math.random() * ROWS);
        tankPlace.y = Math.floor(Math.random() * COLS);
    } while (Board[tankPlace.x][tankPlace.y] != EMPTY);
	console.log("jump to: " + tankPlace.x + "," + tankPlace.y);
    Board[tankPlace.x][tankPlace.y] = TANK;
    MoveMissiles();
    if (Alive) {
        if (NumMissileLeft == 0) {
            StartLevel();
        } else {
            DisplayBoard();
        }
    } else {
        EndOfGame();
    }
}

function blow() {
    console.log("blow function");
    if (BlowActive) {
        document.getElementById("playBlow").play();
        BlowActive = false;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if ((i != 0) || (j != 0)) { // not center
                    // console.log(i + "," + j);
                    if (((tankPlace.x + i) >= 0) && ((tankPlace.x + i) <= ROWS - 1) && ((tankPlace.y + j) >= 0) && ((tankPlace.y + j) <= COLS - 1)) {
                        if (Board[tankPlace.x + i][tankPlace.y + j] == MISSILE) {
                            Board[tankPlace.x + i][tankPlace.y + j] = EMPTY;
                            Score = Score + 1;
                            NumMissileLeft = NumMissileLeft - 1;
                            if (NumMissileLeft == 0) {
                                StartLevel();
                            }
                        }
                    }
                }
            }
        }
        scoreId.innerHTML = Score;
        DisplayBoard();
    }
}

function TablePrint(t) {
    var line;
    for (var i = 0; i < ROWS; i++) {
        line = (i % 10) + " ";
        for (var j = 0; j < COLS; j++) {
            switch (t[i][j]) {
                case EMPTY:
                    line = line + ".";
                    break;
                case TANK:
                    line = line + "T";
                    break;
                case MISSILE:
                    line = line + "M";
                    break;
                case EXPLOSION:
                    line = line + "E";
                    break;
            }
        }
        console.log(line);
    }
}

function unbindKey() {
	document.onkeydown = function() {};
}

function bindKey() {
	document.onkeydown = function(event) {
		console.log("onkeydown function: " + event.key);
		switch (event.key) {
			case '7': case 'Home':
				move(1);
				break;
			case '8': case 'ArrowUp':
				move(2);
				break;
			case '9': case 'PageUp':
				move(3);
				break;
			case '4': case 'ArrowLeft':
				move(4);
				break;
			case '5': case 'Clear':
				stay();
				break;
			case '6': case 'ArrowRight':
				move(6);
				break;
			case '1': case 'End':
				move(7);
				break;
			case '2': case 'ArrowDown':
				move(8);
				break;
			case '3': case 'PageDown':
				move(9);
				break;
			case '0': case 'Insert':
				blow();
				break;
			case '.': case 'Delete':
				jump();
				break;
		}
	};
}