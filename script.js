//Base on a game name "Dalek" by Heiko Selber
const EMPTY = 0;
const TANK = 1;
const MISSILE = 2;
const EXPLOSION = 3;

var grid = document.getElementById("grid");
grid.onclick = function() {document.getElementById("HelpModal").style.display = "block";}
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {document.getElementById("HelpModal").style.display = "none";}

var scoreId = document.getElementById("scoreId");
var levelId = document.getElementById("levelId");
var hiscoreId = document.getElementById("hiscoreId");
var msg = document.getElementById("msg");

var COLS = 14;
var ROWS = 14;
var MAXNUMMISSILES = (COLS-2)*(ROWS-2);

var tankPlace = {x: -1,	y: -1};
var MissilePlace = {x: -1,	y: -1};
var Alive = true;
var Level=0;
var NumMissileLeft=0;
var HighestScore;
var BlowActive=true; // blow pressed
var Score=0;

var Board = new Array(ROWS);
for (var i = 0; i < Board.length; i++) { 
    Board[i] = new Array(COLS); 
} 
var PrevBoard = new Array(ROWS);
for (var i = 0; i < PrevBoard.length; i++) { 
    PrevBoard[i] = new Array(COLS); 
}
var Tcopy = new Array(ROWS);
for (var i = 0; i < Tcopy.length; i++) { 
    Tcopy[i] = new Array(COLS); 
}

StartGame();

function StartGame() {
	Alive = true;
	Level = 0;
	BlowActive=true;
	Score=0;
	ClearTable(Board);
	ClearTable(PrevBoard);
	ClearTable(Tcopy);

	HighestScore=ReadHighestScore();
	hiscoreId.innerHTML=HighestScore;
	scoreId.innerHTML=Score;
	StartLevel();
	msg.innerHTML="";
	document.getElementById("arrow").style.pointerEvents = "auto";
	document.getElementById("control").style.pointerEvents = "auto";
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
	if (Board[x][y]!=EMPTY) {
		return false
	}
	for (var i1=Math.max(0,x-1); i1<=Math.min(ROWS-1,x+1); i1++) {
		for (var j1=Math.max(0,y-1); j1<=Math.min(COLS-1,y+1); j1++) {
			if (Board[i1][j1]==TANK) {
				return false
			}
		}
	}
	return true	
}

function StartLevel() {
	console.log("StartLevel function");
	document.getElementById('playLevelEnd').play();
	Level=Level+1;
	ClearTable(Board);
	BlowActive=true;
	levelId.innerHTML=Level;
	
	tankPlace.x=Math.floor(Math.random() * ROWS);
	tankPlace.y=Math.floor(Math.random() * COLS);
	Board[tankPlace.x][tankPlace.y] = TANK;
	
	var i = 0;
	do {
		MissilePlace.x=Math.floor(Math.random() * ROWS);
		MissilePlace.y=Math.floor(Math.random() * COLS);
		if (emptyN(MissilePlace.x,MissilePlace.y)) {
			Board[MissilePlace.x][MissilePlace.y]=MISSILE;
			i=i+1;
		}
	} while ((i<4*Level)); // && (i<MAXNUMMISSILES));

	NumMissileLeft=i;
	DisplayBoard();
	TablePrint(Board);
}

function MoveMissiles() {
	console.log("MoveMissiles function");
	for (var i = 0; i < ROWS; i++) { 
		for (var j = 0; j < COLS; j++) { 
    	  if ((Board[i][j]==TANK) || (Board[i][j]==EXPLOSION)) {
	   	  	Tcopy[i][j]=Board[i][j];
		  }
	   	  else {
	   	  	Tcopy[i][j] = EMPTY;
		  }
		}
	}

	// MOVE MISSILE and check for end of game
	for (var i = 0; i < ROWS; i++) { 
		for (var j = 0; j < COLS; j++) { 
	   		var iNew=i;
	   		var jNew=j;
			if (Board[i][j]==MISSILE) { // MOVE MISSILE
				if (jNew != tankPlace.y) {
					if (jNew > tankPlace.y) {
						jNew=jNew-1;
					}
					else { 
						jNew=jNew+1;
					}
				}
				if (iNew != tankPlace.x) {
					if (iNew > tankPlace.x) {
						iNew=iNew-1;
					}
					else {
						iNew=iNew+1;
					}
				}
				// check if move on an explosion/missile/tank/empty
				// print("New position:",i,j,iNew, jNew, Tcopy[iNew][jNew])
				if (Tcopy[iNew][jNew]==EXPLOSION) {
					Score=Score+1;
					NumMissileLeft=NumMissileLeft-1;
				}
				if (Tcopy[iNew][jNew]==MISSILE) {
					Tcopy[iNew][jNew]=EXPLOSION;
					Score=Score+2;
					NumMissileLeft=NumMissileLeft-2;
				}
				if (Tcopy[iNew][jNew]==TANK) {
					Alive=false;
				}
				if (Tcopy[iNew][jNew]==EMPTY) {
					Tcopy[iNew][jNew]=MISSILE;
				}	 	
		   	}
	   	}
	}

	CopyTable(Board, PrevBoard);
	CopyTable(Tcopy, Board);
	scoreId.innerHTML=Score;
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
	grid.innerHTML="";
	for (var i=0; i<ROWS; i++) {
		row = grid.insertRow(i);
		for (var j=0; j<COLS; j++) {
			cell = row.insertCell(j);
			var vvv = document.createAttribute("CellValue");
			if (Board[i][j] == TANK) {
				console.log("tank: " + i + "," + j);
				vvv.value = TANK;
				cell.className="tank";
			}
			if (Board[i][j] == MISSILE) {
				vvv.value = MISSILE;
				var d = -Math.atan2(j-tankPlace.y, i-tankPlace.x) * 180 / Math.PI;
				cell.innerHTML="<img style=\"transform: rotate(" + d + "deg);\" src=\"image/missile.png\">";
				cell.className="missile";
			}
			if (Board[i][j] == EXPLOSION) {
				vvv.value = EXPLOSION;
				cell.className="explosion";
			}
			cell.setAttributeNode(vvv);
		}
	}
}

function EndOfGame() {
	console.log("EndOfGame function");
	document.getElementById('playEndOfGame').play();
	DisplayBoard();
	document.getElementById("arrow").style.pointerEvents = "none";
	document.getElementById("control").style.pointerEvents = "none";
	//grid.innerHTML="";
	if (Score > HighestScore) {
		msg.innerHTML="Game Over<br>Final Score: " + Score + "<br>NEW HIGH SCORE!!!";
		SaveHighestScore();
	}
	else {
		msg.innerHTML="Game Over<br>Final Score: " + Score;
	}
}

function move(key) {
	console.log("move function: " + key);
	var ok=false;
	document.getElementById('playButton').play();
	switch (key) {
		case 1: // Up Left
			if ((tankPlace.x>0) && (tankPlace.y>0)) {
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x-1;
				tankPlace.y = tankPlace.y-1;
				ok=true;
			}
		break;
		case 2: // Up
			if (tankPlace.x>0) { 
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x-1;
				ok=true;
			}
		break;
		case 3: // Up Right
			if ((tankPlace.x>0) && (tankPlace.y<COLS-1)) { 
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x-1;
				tankPlace.y = tankPlace.y+1;
				ok=true;
			}		
		break;
		case 4: // Left
			if (tankPlace.y>0) {
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.y = tankPlace.y-1
				ok=true;
			}		
		break;
		case 6: // Right
			if (tankPlace.y<COLS-1) {
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.y = tankPlace.y+1
				ok=true;
			}
		break;
		case 7: // Down Left
			if ((tankPlace.x<ROWS-1) && (tankPlace.y>0)) {
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x+1;
				tankPlace.y = tankPlace.y-1;
				ok=true;
			}
		break;
		case 8: // Down
			if (tankPlace.x<ROWS-1) { 
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x+1;
				ok=true;
			}		
		break;
		case 9: // Down Right
			if ((tankPlace.x<ROWS-1) && (tankPlace.y<COLS-1)) {
				Board[tankPlace.x][tankPlace.y]=EMPTY;
				tankPlace.x = tankPlace.x+1;
				tankPlace.y = tankPlace.y+1;
				ok=true;
			}
		break;
	}	
	if (ok) {
		if (Board[tankPlace.x][tankPlace.y]!=EMPTY) {
			Alive=false;
		}
		Board[tankPlace.x][tankPlace.y]=TANK;
		MoveMissiles();
		if (Alive==true) {
			if (NumMissileLeft==0) {
				StartLevel();
			}
			else {
				DisplayBoard();
			}
		}
		else {
			EndOfGame();
		}
	} //ok
}

function stay() {
	console.log("stay function");
	document.getElementById('playButton').play();
	MoveMissiles();
	if (Alive==true) {
		if (NumMissileLeft==0) {
			StartLevel();
		}
		else {
			DisplayBoard();
		}
	}
	else {
		EndOfGame();
	}
}

function jump() {
	console.log("jump function");
	document.getElementById('playJump').play();
	Board[tankPlace.x][tankPlace.y]=EMPTY;
	do {
		tankPlace.x=Math.floor(Math.random() * ROWS);
		tankPlace.y=Math.floor(Math.random() * COLS);
	} while (Board[tankPlace.x][tankPlace.y]!=EMPTY);

	Board[tankPlace.x][tankPlace.y]=TANK;
	MoveMissiles();
	if (Alive==true) {
		if (NumMissileLeft==0) {
			StartLevel();
		}
		else {
			DisplayBoard();
		}
	}
	else {
		EndOfGame();
	}
}

function blow() {
	console.log("blow function");
	if (BlowActive) {
		document.getElementById('playBlow').play();
		BlowActive=false;
		for (var i=-1; i<=1; i++) {
			for (var j=-1; j<=1 ;j++) {
				if ((i!=0) || (j!=0)) { // not center
					// console.log(i + "," + j);
					if (((tankPlace.x+i)>=0) && ((tankPlace.x+i)<=ROWS-1) && ((tankPlace.y+j)>=0) && ((tankPlace.y+j)<=COLS-1)) {
						if (Board[tankPlace.x+i][tankPlace.y+j]==MISSILE) {
							Board[tankPlace.x+i][tankPlace.y+j]=EMPTY;
							Score=Score+1;
							NumMissileLeft=NumMissileLeft-1;
							if (NumMissileLeft==0) {
								StartLevel();
							}
						}							
					}
				}
			}
		}
		scoreId.innerHTML=Score;
		DisplayBoard();
	}
}

function TablePrint(t) {
	var line;
	for (i=0; i<ROWS; i++) {
		line = (i % 10) + " ";
	   	for (j=0; j<COLS; j++) {
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
