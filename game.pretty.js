
//  10x10 game board filled with 0's
var board = Array.from({ length: 10 }, () => Array(10).fill("0"));
// Variables to track clicked cell, game status, player scores, and monster score
var clickedx = null, clickedy = null; 
var theEvent = null;;

var turn = 1, round = 1, hScore = 0, mScore = 0, treasure_count = 0;
var playMode = false;

var hAdded = false;
var mAdded = false;
var hunterX = null, hunterY = null;      //tacks hunter's position along the game
var MonstersX = [], MonstersY =[];        // array of monster locations
var end = false;
var killed = false;

var current_monster = null;              //stores the indexcurrent monster to be moved,
var treasure_cell = [0,0];                //stores the cell of highest value adjacent treasure       
var monstTo_t = null;                   // stores the index of the moster next to the treasure ^
var bestT = 0;                         // stores the value of the treasure
var noObstac = null;                    // global array to store  cells without obstacles next to each monster

let directions1 = [   [-1,-1],[0,-1],[1,-1],
                      [-1, 0],       [1, 0],
                      [-1, 1],[0, 1],[1, 1]   ]

function init(){
    h1.innerHTML = "Setup";
    d1.innerHTML = "Click a cell, then press 1-9 for treasure, 'h' for hunter, 'm' for monster, 'o' for obstacle"
    d2.innerHTML = "press play when ready"
    for (x=0; x<board.length; x++) {
        var tr = document.createElement("tr");
        table.appendChild(tr);                                             //table is initiallised with board content (empty)
        for (y=0; y<board[x].length; y++) {
           var td  = document.createElement("td");
           var txt = document.createTextNode(keyToImage(board[x][y]));
           td.appendChild(txt);
           td.addEventListener("click",keyPress.bind(null,x,y),false);     //attach a click event listener to each cell
           tr.appendChild(td);
        }}}

function keyToImage(key) {  
    if (key >= '1' && key <= '9') return '🪙';
    switch (key) {
       case 'm': return "👹"                               //enum to convert keys to mage
       case 'h': return "🤠"                             // emoji icons copied from emojidb.com (free);
       case 'o': return "🧱"
       default: return ""
    }}
// function to check if grid position is empty - if it is store the event and x,y values , otherwise notify player thegrid position is taken
function keyPress(x,y,event){
    dw.style.display ="none"
    if (board[x][y] !== '0') {
        dw.innerHTML = "Grid position ["+x+","+y+"] already occupied"
        dw.style.display = "block"
    }
    else{
        clickedx = x
        clickedy = y
        theEvent = event
    }}
// event listener for key presses
document.addEventListener("keydown",(event2) => {
    let key = event2.key.toLowerCase();
    if (!playMode){                                   //if not playmode, then key entries are for setting up the game
        if (clickedx === null || clickedy === null) return;
        let validKeys = ['h', 'm', 'o'];                                        // ensures atleast one of the game objects are placed
        if ((key >= '1' && key <= '9') || validKeys.includes(key)) {            // on the grid , and only one hunter.
            if (key >= '1' && key <= '9'){ treasure_count++; }
            if (key === 'h'){
                if (hAdded){
                    dw.innerHTML = "Only one hunter can be added to the game";
                    dw.style.display = "block";
                    return; }
                else{
                    hAdded = true;
                    hunterX = clickedx;
                    hunterY = clickedy; 
                }
            }
            if (key === 'm'){                                   
                mAdded = true;
                MonstersX.push(clickedx);
                MonstersY.push(clickedy);
            }
            if ( key === 'o'){
                oAdded = true;
            }
            dw.style.display = "none";
            board[clickedx][clickedy] = key;
            theEvent.target.innerHTML = keyToImage(key);

            clickedx = null;
            clickedy = null; 
        }
        else{
            dw.innerHTML = "Enter a valid key";
            dw.style.display = "block";
        }
    }
    else{
        if (turn === 1){                    //player turn is 1
           player_movement(key)
    }
    }
})

function player_movement(key){
    updateStatus();
    let dx = 0, dy = 0;
    if (key === 'w') dx = -1;
    else if (key === 's') dx = 1;
    else if (key === 'a') dy = -1;
    else if (key === 'd') dy = 1;
    else{
        dw.innerHTML = "Invalid key. Use W, A, S, or D";
        dw.style.display = "block";
        return;
    }
    let newX = hunterX + dx;
    let newY = hunterY + dy;

    if (newX < 0 || newX > 9 || newY < 0 || newY > 9) {         //checks for out of bounds and warns the player
        dw.innerHTML = "Move blocked! You can not go outside the grid";
        dw.style.display = "block";
        return;
    }

    let cellValue = board[newX][newY];
    if (cellValue === 'm') {                                
        board[hunterX][hunterY] = '0';
        updateCell(hunterX, hunterY, '');
        updateCell(newX, newY, keyToImage('m'));                   // ends the game if hunter moves on the same grid with monster
        dw.innerHTML = "Game Over! You have been eating by a monster!";
        dw.style.display = "block";
        killed = true;
        endGame();
        return;
    }
    if (cellValue === 'o') {
        dw.innerHTML = "Obstacle! move has been blocked";
        dw.style.display = "block";
        turn = 2;                                            //ends players turn if they move into an obtacle
        setTimeout(moveMonsters, 1250)
        return;
    }
    if (cellValue >= '1' && cellValue <= '9') {
        hScore += parseInt(cellValue);
        treasure_count--;                               // add the score to player score if they take a treasure
        updateStatus();
        if (treasure_count == 0){   // ends the game if treasure count = 0
            end = true;
        }
    }
    board[hunterX][hunterY] = '0';
    board[newX][newY] = 'h';
    updateCell(hunterX, hunterY, '');
    updateCell(newX, newY, keyToImage('h'));
    hunterX = newX;
    hunterY = newY;
    dw.style.display ='none';
    turn = 2;
    if (end){
        dw.innerHTML = "Game Over! There are no treasures left";
        dw.style.display = "block";
        endGame();
        return;
    }
    moveMonsters();
}


function updateStatus (){                                             //helper function to update the scores and round displays
    document.getElementById("p1").innerHTML = "Round - "+round;
    document.getElementById('p2').innerHTML = "Your Score - "+hScore;
    document.getElementById('p3').innerHTML = "Monster Score - "+mScore;
    document.getElementById('p4').innerHTML = "Remaining Treasure - "+treasure_count;
    return;
}

function updateCell(x, y, value) {                  //helper function to handle board movement;
    let cell = table.rows[x].cells[y];
    cell.innerHTML = value;
    return;
}

function moveMonsters() {
    if(!mAdded){ return;}
    if (turn === 2){
        dw.style.display = 'none';
        setTimeout(() => {             // time delay (setTimeout)found in  -https://stackoverflow.com/questions/17883692/how-to-set-time-delay-in-javascript
            round++;
            updateStatus();
            dw.style.display = 'none';
            treasure_cell = [0,0];                     
            monstTo_t = null;                        //initialise values again for each monster movement
            bestT = 0;
            noObstac = Array.from({ length: MonstersX.length }, () =>
                Array.from({ length: 8 }, () => [0, 0])
            );
            for (let i = 0; i < MonstersX.length; i++){
                let x = MonstersX[i];
                let y = MonstersY[i];
                c = 0;
                for (let [DX, DY] of directions1) {                //check for hunter in direcly adjacent grids
                    let nX = x + DX;
                    let nY = y + DY;
                    if (nX >= 0 && nX <= 9 && nY >= 0 && nY <= 9) {
                        let cell = board[nX][nY];
                        if (cell === 'h') {
                            board[x][y] = '0';                      //if found game over
                            updateCell(x, y, '');
                            updateCell(nX, nY, keyToImage('m'));
                            dw.innerHTML = "Game Over! You have been eating by a monster!";
                            dw.style.display = "block";
                            killed = true;
                            endGame()
                            return;
                        }
                        if(cell >= '1' && cell <= '9') {
                            if (cell > bestT){
                                bestT = cell;                        //if hunter is not found in directly adjacent grids
                                treasure_cell = [nX,nY];             // check for treasure in adjacent grids and record the direction,
                                monstTo_t = i;                       // value of best one found, as well as the monster close to it index
                            }}
                        if (cell !== 'o'){
                            noObstac[i][c] = [DX,DY];                   //records adjacent cells with no obstacle for each monster
                            c++;
                        } }
                    else{
                        c++;
                    }}}
            moveMonsters2();
            turn = 1;
            return;
        }, 500);
    }}

function moveMonsters2(){                                        //function to check for hunter  2 grids away in all directions
    let found = two_cells_adjacent('h');                       // calls function two cells adjacent to carry out the check the check
    if (!found){
        if (monstTo_t !== null){
            let x = MonstersX[monstTo_t];           //if hunter is not found 2 grids away, monster goes for earlier recorded treasure --
            let y = MonstersY[monstTo_t];           // if  one if found
            let nx = treasure_cell[0];
            let ny = treasure_cell[1];
            board[x][y] = '0';
            updateCell(x, y, '');
            board[nx][ny] = 'm';
            updateCell(nx, ny, keyToImage('m'));
            MonstersX[monstTo_t] = nx;
            MonstersY[monstTo_t] = ny;
            mScore += parseInt(bestT);
            treasure_count--;
            updateStatus();
            if (treasure_count == 0){                             // if the treasure is the last, game over
                dw.innerHTML = "Game Over! There are no treasures left";
                dw.style.display = "block";
                end = true;
                endGame();
                return;
            }}
        else{
            found = two_cells_adjacent('t');     // if no treasure was recorded one grid away, check for treasure two grids away.
            if (!found){
                choose_monster();                 // if no treasure is found two grids away, call function to choose the next monster to move
            }}}
    return;
}

function two_cells_adjacent (s){               //function to check if huneter is in 2 grids away and if so, move one grid closer
    let diagon1 = [ [-2,-2],[-1,-2],[-2,-1]  ]
    let diagon2 = [ [1,-2],[2,-2],[2,-1]  ]
    let diagon3 = [ [-2,1],[-2,2],[-1,2]  ]
    let diagon4 = [ [2,1],[2,2],[1,2]   ]

    let found = checkRegion([[-2,0]],[-1,0],s)
    if (!found){ found = checkRegion([[2,0]],[1,0],s)} else{ return true; }       
    if (!found){ found = checkRegion([[0,-2]],[0,-1],s)} else{ return true; }
    if (!found){ found = checkRegion([[0,2]],[0,1],s)} else{ return true; }
    if (!found){ found = checkRegion(diagon1,[-1,-1],s)} else{ return true; }
    if (!found){ found = checkRegion(diagon2,[1,-1],s)} else{ return true; }
    if (!found){ found = checkRegion(diagon3,[-1,1],s)} else{ return true; }
    if (!found){ found = checkRegion(diagon4,[1,1],s)} else{ return true; }
    if(!found){ return false; } else{ return true; }
}

function checkRegion(region,move,s){                 //helper function, that receives 2 grid directions to check and the best move to get
    for (let i = 0; i < MonstersX.length; i++){      //closer to it.
        let x = MonstersX[i];
        let y = MonstersY[i];
        for (let [DX, DY] of region) {
            let nX = x + DX;
            let nY = y + DY;
            if (nX < 0 || nX > 9 || nY < 0 || nY > 9) continue;   //check for out of bounds
            let cell = board[nX][nY];
            if ((s === 'h' && cell === 'h') || (s ==='t' && (cell >= '1' && cell <= '9'))) {  
                let dx = move[0];
                let dy = move[1];
                let ax = x + dx;
                let ay = y + dy;
                let cell2 = board[ax][ay];
                if ( cell2 !== 'o'){                    //check for obstacle befor moving.
                    board[x][y] = '0';
                    updateCell(x, y, '');
                    board[ax][ay] = 'm';
                    updateCell(ax, ay, keyToImage('m'));
                    MonstersX[i] = ax;
                    MonstersY[i] = ay;
                    return true;
                }}}}
    return false;
}

function choose_monster(){                     //function to choose the next monster
    i = current_monster
    let moved = false
    shuffle(noObstac[i]);                  //fisher-yates shuffle found on https://www.geeksforgeeks.org/how-to-shuffle-an-array-using-javascript/ 
    for (let [DX, DY] of noObstac[i]){                       // shuffle the adjacent directions to move at random
        if (DX === 0 && DY === 0) continue;
        moveMonsters3(i,DX,DY);
        moved = true
        break; 
    }                                                //if the monster is unable to move
    if (!moved){                                     //loop thorugh the monsters and choose the first one that is able to move
        for (let j = 0; j < noObstac.length; j++) {
            if (j === i) continue;
            shuffle(noObstac[j]);
            for (let [DX, DY] of noObstac[j]){
                if (DX === 0 && DY === 0) continue;
                moveMonsters3(j,DX,DY);
                moved = true;
                break;
            }
            if (moved){
                break;
            }}}
    current_monster++
    if (current_monster >= MonstersX.length){
        current_monster = 0;
    }
    return;     
}
function shuffle(directions) {                            //fisher-yates shuffle
    for (let i = directions.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }}

function moveMonsters3(i, DX, DY){               // function to handle the random movement of the monster
    let x = MonstersX[i];
    let y = MonstersY[i];
    let nX = x + DX;
    let nY = y + DY;
    if (nX < 0 || nX > 9 || nY < 0 || nY > 9) return;
    board[x][y] = '0';
    updateCell(x, y, '');
    board[nX][nY] = 'm';
    updateCell(nX, nY, keyToImage('m'));
    MonstersX[i] = nX;
    MonstersY[i] = nY;
    return;
}

function play(){                 //function called to set up playmode
    if (!hAdded){
        dw.innerHTML = "Please add an hunter to a cell before continuing";
        dw.style.display = "block"
        return
    }
    else{ 
        playMode = true;
        if (mAdded){  current_monster = 0; }
        h1.style.display = "none"
        d1.style.display = "none"
        d2.style.display = "none"
        dw.style.display = "none"
        document.getElementById("Play").style.display = "none";
        document.getElementById("end").style.display = "block";
        updateStatus()
        if (treasure_count == 0){
            endGame()
            return;
        }
    }}
    
function endGame(){                                  //function to set up game over scene
    playMode = false;
    setTimeout(() => {
        dw.style.display = 'none';
        table.innerHTML = '';
        table.style.display = 'none';
        h1.innerHTML = "Game Over";
        h1.style.display = 'block';
        if (killed){
            document.getElementById('e1').innerHTML = "You lose";
        }
        if (end){
            if (hScore > mScore){
                document.getElementById('e1').innerHTML = "YOU WIN!!!";
            }
            else if (hScore < mScore){
                document.getElementById('e1').innerHTML = "You lose";
            }
            else{ document.getElementById('e1').innerHTML = "Draw";}
        }
        document.getElementById('e1').style.display = 'block';

        document.getElementById('e2').innerHTML = "Rounds - "+round;
        document.getElementById('e2').style.display = 'block';
        document.getElementById('e3').innerHTML = "Your Scrore - "+hScore;
        document.getElementById('e3').style.display = 'block';
        document.getElementById('e4').innerHTML = "Monster's Score - "+mScore;
        document.getElementById('e4').style.display = 'block';
        document.getElementById('end').style.display = 'none';
        document.getElementById('newGame').style.display = 'block';
        document.getElementById('p1').innerHTML = '';
        document.getElementById('p2').innerHTML = '';
        document.getElementById('p3').innerHTML = '';
        document.getElementById('p4').innerHTML = '';
    }, 3000);
}

function resetGame(){                                // function to set up up new game and initialise variable;
    board = Array.from({ length: 10 }, () => Array(10).fill("0"));
    clickedx = null;
    clickedy = null;
    theEvent = null;
    turn = 1;
    round = 1;
    hScore = 0;
    mScore = 0;
    treasure_count = 0;
    playMode = false;
    hAdded = false;
    mAdded = false;
    hunterX = null;
    hunterY = null;
    MonstersX = [];
    MonstersY = [];
    current_monster = null;
    treasure_cell = [0, 0];
    monstTo_t = null;
    bestT = 0;
    noObstac = null;
    end = false;
    killed = false;
    document.getElementById('e1').innerHTML = '';
    document.getElementById('e2').innerHTML = '';
    document.getElementById('e3').innerHTML = '';
    document.getElementById('e4').innerHTML = '';
    document.getElementById('e1').style.display = 'none';
    document.getElementById('e2').style.display = 'none';
    document.getElementById('e3').style.display = 'none';
    document.getElementById('e4').innerHTML = '';
    document.getElementById("Play").style.display = "block";
    document.getElementById("end").style.display = "none";
    document.getElementById("newGame").style.display = "none";
    table.style.display = 'block';
    init()
}

let h1 = document.getElementById("h1");
let d1 = document.getElementById("d1");
let d2 =document.getElementById('d2');
let dw =document.getElementById('dw');
let table = document.getElementById("t1");
init();

