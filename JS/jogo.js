"use strict";

let dificuldadeEscolhida;
let temaEscolhido;
let timerEscolhido;

let defaultGame = true; 
let defaultTheme = true;
let gardenTheme = false; 
let hardMode = false;
let countdownTimer = false;
let defaultTimer = true;
let gameCounter = 0;
let totalFlags;
let gameBoardDiv = document.getElementById("game");
let gameOverAudio = document.getElementById("gameOverAudio");
let tileClickAudio = document.getElementById("tileClickAudio");
let winAudio = document.getElementById("winAudio");
let flagsLeft = document.getElementById("flagsLeft");
let bandeirasDiv = document.getElementById("bandeiras");
let restartGameBtn = document.getElementById("restartGameBtn");
restartGameBtn.addEventListener('click', function() {
    location.reload();
});

function runGame() {
    document.addEventListener("DOMContentLoaded", function() {
        dificuldadeEscolhida = localStorage.getItem("dificuldadeEscolhida");
        temaEscolhido = localStorage.getItem("temaEscolhido");
        timerEscolhido = localStorage.getItem("timerEscolhido");
        if (dificuldadeEscolhida) {
            if (dificuldadeEscolhida === 'defaultGame') {
                defaultGame = true;
                hardMode = false;
                totalFlags = 10;
                gameBoardDiv.style.setProperty("grid-template-columns", 'repeat(9, 1fr)');
                gameBoardDiv.style.setProperty("grid-template-rows", 'repeat(9, 60px)');
                document.getElementById("modoDefault").checked = true;
            } else if (dificuldadeEscolhida === 'hardMode') {
                defaultGame = false;
                hardMode = true;
                totalFlags = 30;
                gameBoardDiv.style.setProperty("grid-template-columns", 'repeat(12, 1fr)');
                gameBoardDiv.style.setProperty("grid-template-rows", 'repeat(12, 60px)');
                document.getElementById("modoDificil").checked = true;
            }
        flagCounter = 0;
        flagsLeft.innerHTML = `${totalFlags - flagCounter}`;
        }
        if (temaEscolhido) {
            if (temaEscolhido === "gardenTheme") {
                gardenTheme = true;
                defaultTheme = false;
            } else {
                gardenTheme = false;
                defaultTheme = true;
            }
            changeTheme();
        }
        if (timerEscolhido) {
            if (timerEscolhido === "countdownTimer") {
                defaultTimer = false;
                countdownTimer = true;
            } else { 
                defaultTimer = true;
                countdownTimer = false;
        }}
        makeGrid();
        makeMines(); 
        flagInteraction();
    });
}

runGame();

function flagInteraction() {
    document.querySelectorAll("[id^='tile']").forEach(tile => {
        tile.addEventListener("click", function() {
            if (!this.classList.contains("flag") && !this.classList.contains("natureFlag")) { //impedir click esquerdo se tem flag
                mouseInteraction(this);
                tileClickAudio.play();
            }});
        tile.addEventListener("contextmenu", (e) => { //flags
            e.preventDefault();
            putFlag(e.target);
            tileClickAudio.play();
        });
    });
}

function makeGrid() {
    let sizeGrid;
    if (defaultGame) {
        sizeGrid = 9; //tamanho default
    }
    else if (hardMode) {
        sizeGrid = 12;
    }
    let numTile = 0;
    let count = 0;
    while (count < sizeGrid) {
        for (let i = 0; i < sizeGrid; i++) { //while i is <numTiles, create tiles
            gameBoardDiv.innerHTML += `<div class="tile naoRevelado" id="tileNum${numTile+1}"><span id="tileSpanNum${numTile+1}"></span></div>`;
            numTile++; //id para cada tile
        }
        count++; //fazer colunas
    }
}

function makeMines() {
    let numMines;
    let totalTiles;
    if (defaultGame) {
        numMines = 10; //tamanho default
        totalTiles = 81;
    }
    else if (hardMode) {
        numMines = 30;
        totalTiles = 144;
    }
    let minesArray = [];
    let finalMines = [];
    while (minesArray.length < numMines) {
        let randomNum = Math.floor(Math.random() * totalTiles) +1;
        if (!minesArray.includes(randomNum)) {
            minesArray.push(randomNum);
        }
    }
    minesArray.forEach((randomNum, index) => {
        //get ONE tile, change its id to mine(index), add class
        let tile = document.getElementById(`tileNum${randomNum}`);
        let tileSpan = document.getElementById(`tileSpanNum${randomNum}`);
        if (gardenTheme) {
            tile.classList.replace("tile", "natureMine");
        } else {
            tile.classList.replace("tile", "mine");
        }
        tileSpan.id = `mineNum${index + 1}`;
        finalMines.push(`tileNum${randomNum}`);
    });
    return finalMines;

}

function mouseInteraction(clickedTile) {
    clickedTile.classList.remove("naoRevelado");
    clickedTile.classList.add("revelado");
    if (clickedTile.classList.contains("mine") || clickedTile.classList.contains("natureMine")) {
        console.log("You lose!");
        gameOver();
        clearInterval(temporizador);
        jogoAtivo = false;
        gameCounter = localStorage.getItem("numJogos") //obtém valor atualizado
        gameCounter++;
        localStorage.setItem("numJogos", gameCounter);
    } else {
        getMinesNum(clickedTile);
    }
    winGame();
}

let gameClicked = false;
gameBoardDiv.addEventListener("click", function() {
    if (!gameClicked) {
        gameClicked = true;
        iniciarTimer();
    }
});
gameBoardDiv.addEventListener("contextmenu", function() {
    if (!gameClicked) {
        gameClicked = true;
        iniciarTimer();
    }
});

function winGame() {
    let allTilesArray = [];
    let allTilesNode = document.querySelectorAll(".tile");
    allTilesNode.forEach(tile => allTilesArray.push(tile));
    let flagsList = document.querySelectorAll(".flag");
    flagsList.forEach(flag => allTilesArray.push(flag));
    let natureFlagsList = document.querySelectorAll(".natureFlag");
    natureFlagsList.forEach(flag => allTilesArray.push(flag));
    let allTilesRevealed = true;
    allTilesArray.forEach(selection => {
        if (!selection.classList.contains("mine") && !selection.classList.contains("natureMine")) { //verifica tiles + flags
            if (!selection.classList.contains("revelado")) {
                allTilesRevealed = false; //ganha se revelar tudo menos as minas (com flags ou não)
            }
        }
    });
    if (allTilesRevealed) {
        console.log("You win!");
        winAudio.play();
        atualizarEstatisticas();
        if (gardenTheme) {
            restartGameBtn.src = "../media/canva-happy-bee-emoticon.png";
        } else {
            restartGameBtn.src = "../media/yay.png";
        }
    }
    totalTimePlayed += timeCounter; 
    localStorage.setItem("totalTimePlayed", totalTimePlayed);
}

function gameOver() {
    jogoAtivo = false;
    gameOverAudio.play();
    //mostrar todas as bombas
    let minesList;
    if (gardenTheme) {
        minesList = document.querySelectorAll(".natureMine");
    } else {
        minesList = document.querySelectorAll(".mine");
    }
    minesList.forEach(mine => {
        if (mine.classList.contains("naoRevelado")) {
            mine.classList.remove("naoRevelado");
            mine.classList.add("revelado");
        }
    });
    let tilesList = document.querySelectorAll(".tile");
    tilesList.forEach(tile => {
        if (tile.classList.contains("naoRevelado")) {
            tile.classList.add("gameOver"); //impedir de clicar no jogo depois de acabar
        }
    });
    //falta mostrar stats (outra função?)
    if (gardenTheme) {
        restartGameBtn.src = "../media/canva-cry-bee-emoticon.png";
    } else {
        restartGameBtn.src = "../media/perder.png";
    }   
    totalTimePlayed += timeCounter; 
    localStorage.setItem("totalTimePlayed", totalTimePlayed);
    atualizarEstatisticas();
}

let flagCounter = 0;
function putFlag(clickedTile) {
    if (clickedTile.classList.contains("flag") || clickedTile.classList.contains("natureFlag") ) {
        clickedTile.classList.remove("flag") || clickedTile.classList.remove("natureFlag");
        flagCounter--;
    } else if (flagCounter < totalFlags) {
        clickedTile.classList.add("flag");
        if (gardenTheme) {
        clickedTile.classList.replace("flag", "natureFlag");
        }
        flagCounter++;
    }
    flagsLeft.innerHTML = `${totalFlags-flagCounter}`;
}

document.addEventListener("click", () => {
    let selectedTiles = [];
    let revealedTiles = document.querySelectorAll(".revelado");
    revealedTiles.forEach(tile => selectedTiles.push(tile.id));
});

function getMinesNum(clickedTile) {
    let tileId = Number(clickedTile.id.replace("tileNum", ""));
    let mineCount;
    if (defaultGame) {
        mineCount = checkAdjacentTiles(tileId, 9);
    } else {
        mineCount = checkAdjacentTiles(tileId, 12);
    }
    let tileSpan = document.getElementById(`tileSpanNum${tileId}`);
    if (mineCount > 0) {
        tileSpan.innerText = mineCount;
    } else {
        tileSpan.innerText = ""; 
    }
    /* cores dos tiles */
    if (mineCount === 1) {
        tileSpan.style.color = "#4920CF"; //blue
    } else if (mineCount === 2) {
        tileSpan.style.color = "#0BD050"; //green
    } else if (mineCount === 3) {
        tileSpan.style.color = "#F45757";  //red/orange
    } else if (mineCount === 4) {
        tileSpan.style.color = "#217D91"; //deep blue
    } else if (mineCount === 5) {
        tileSpan.style.color = "#ED4043";  //deep red
    } else if (mineCount === 6) {
        tileSpan.style.color = "#F9A57B"; //salmon
    } else if (mineCount === 7) {
        tileSpan.style.color = "#D68BFE"; //purple
    } else if (mineCount === 8) {
        tileSpan.style.color = "#DCC7FF"; //grey TODO há aqui duas cores que são demasiado parecidas
    }
}

function checkAdjacentTiles(selectedTile, gridSize) {
    const CIMA = -gridSize;
    const BAIXO = +gridSize;
    const DIR = +1;
    const ESQ = -1;
    const CIMA_DIR = (-gridSize) +1;
    const CIMA_ESQ = (-gridSize) -1;
    const BAIXO_DIR = (+gridSize) +1;
    const BAIXO_ESQ = (+gridSize) -1;

    const tilesToCheck = [CIMA, BAIXO, DIR, ESQ, CIMA_DIR, CIMA_ESQ, BAIXO_DIR, BAIXO_ESQ];

    let mineCount = 0;
    tilesToCheck.forEach(tile => {
        let adjacentTileNum = selectedTile + tile;
        let adjacentTile = document.getElementById(`tileNum${adjacentTileNum}`);
            if (adjacentTile && adjacentTile.classList.contains("mine")) {
                mineCount++;
            } else if (adjacentTile && adjacentTile.classList.contains("natureMine")) {
                mineCount++;
            }
    });
    return mineCount;
}

/* toggle menus */
let mobileBtn = document.getElementById("mobileMenuBtn");
let mobileMenu = document.getElementById("menuOculto");

mobileBtn.addEventListener("click", function() {
    if (mobileMenu.style.display === "block") {
        mobileMenu.style.display = "none";  
        mobileBtn.innerText = "☰";
    } else {
        mobileMenu.style.display = "block";
        mobileBtn.innerText = "×"; 
    }
});

/* DEFINIÇÕES DE JOGO  */
let gameSettingsBtn = document.getElementById("gameSettings");
let setDefinicoes = document.getElementById("setDefinicoes");

gameSettingsBtn.addEventListener("click", function() {
    if (setDefinicoes.style.display === "block") {
        setDefinicoes.style.display = "none";  
    } else {
        setDefinicoes.style.display = "block";
    }
});

let submitDefinicoes = document.getElementById("submitDefinicoes");
submitDefinicoes.addEventListener("click", function() {
    changeDifficulty();
    changeTheme();
    changeTimer();
    gameBoardDiv.innerHTML = ""; //reset ao jogo sem reload (...ainda é necessário??)
    makeGrid();
    makeMines();
    flagCounter = 0;
    flagsLeft.innerHTML = `${totalFlags - flagCounter}`;
    flagInteraction();
    location.reload(); //reload para não dar nada errado
});

function changeTimer() {
    let countdownTimerBtn = document.getElementById("contratempo");
    if (countdownTimerBtn.checked == true) {
        if (defaultTimer == false) {
            defaultTimer = true;
            countdownTimer = false;
            localStorage.setItem("timerEscolhido", "defaultTimer");
        } else {  
            localStorage.setItem("timerEscolhido", "countdownTimer");
            defaultTimer = false;
            countdownTimer = true;
        }
    }
}

function changeDifficulty() {
    let modoDefault = document.getElementById("modoDefault");
    let modoDificil = document.getElementById("modoDificil"); 
    if (modoDefault.checked == true) {
        console.log("default");
        localStorage.setItem("dificuldadeEscolhida", "defaultGame");
        defaultGame = true;
        hardMode = false;
        gameBoardDiv.style.setProperty("grid-template-columns", 'repeat(' + 9 + ', 1fr)');
        gameBoardDiv.style.setProperty("grid-template-rows", 'repeat(' + 9 + ', 60px)');
        totalFlags = 10;
    } else if (modoDificil.checked == true) {
        console.log("dificil");
        localStorage.setItem("dificuldadeEscolhida", "hardMode");
        defaultGame = false;
        hardMode = true;
        gameBoardDiv.style.setProperty("grid-template-columns", 'repeat(' + 12 + ', 1fr)');
        gameBoardDiv.style.setProperty("grid-template-rows", 'repeat(' + 12 + ', 60px)');
        totalFlags = 30;
    }
}

function changeTheme() {
    let mudarTema = document.getElementById("mudarTema");
    if (mudarTema.checked == true) {
        if (gardenTheme == false) {
            gardenTheme = true;
            defaultTheme = false;
            localStorage.setItem("temaEscolhido", "gardenTheme");
        } else {  
            defaultTheme = true;
            gardenTheme = false;
            localStorage.setItem("temaEscolhido", "defaultTheme");
        }
    }
    if (gardenTheme) {
        let flagEmoji = document.getElementById("flagsLeftTitle");
        flagEmoji.innerHTML = `<span class="material-symbols-outlined flagsLeftTitle" id="flagNatureIcon">emoji_nature</span>`; 
        restartGameBtn.src = "../media/canva-smiling-bee-emoticon.png";
        bandeirasDiv.style.top = "15pt";
        winAudio.src = "../media/mixkit-sparkling-fairy-glow-870.wav";
    }
}

/* TIMERS */
let gameTiming = document.getElementById("gameTiming");
let jogoAtivo = false;
let inicio; 
let temporizador;
const tempoCountdown = 300; //5 minutos
let tempoDecorrido;

function iniciarTimer() {
    inicio = Math.floor(Date.now() / 1000); //tempo ao iniciar o timer (converter em segundos em vez de ms)
    jogoAtivo = true; 
    displayTimer(); //atualiza imediatamente
    temporizador = setInterval(displayTimer, 1000);
}

let timeCounter = 0;
let totalTimePlayed = Number(localStorage.getItem("totalTimePlayed")) || 0;
function displayTimer() {
    if (jogoAtivo) {
        if (defaultTimer) {
            tempoDecorrido = Math.floor(Date.now() / 1000) - inicio; //elapsed time
            timeCounter = tempoDecorrido;
        } else if (countdownTimer) {
            tempoDecorrido = tempoCountdown - (Math.floor(Date.now() / 1000) - inicio);
            if (tempoDecorrido <= 0) { //termina o jogo se chegar ao 0
                clearInterval(temporizador);
                jogoAtivo = false;
                gameOver();
                alert("Acabou-se o tempo!");
                gameCounter = localStorage.getItem("numJogos") //obtém valor atualizado
                gameCounter++;
                localStorage.setItem("numJogos", gameCounter);
            }
        }
        const minutos = Math.floor(tempoDecorrido / 60);
        const segundos = tempoDecorrido % 60;
        let segundosDisplay = segundos.toString();
        if (segundos < 10) {
            segundosDisplay = "0" + segundosDisplay;
        }
        let minutosDisplay = minutos.toString();
        if (minutos < 10) {
            minutosDisplay = "0" + minutosDisplay;
        }
        gameTiming.textContent = minutosDisplay + ":" + segundosDisplay;
    }
}

//MOSTRAR ESTATÍSTICAS
function atualizarEstatisticas() {
    let numeroJogos = Number(localStorage.getItem("numJogos"));
    let tempoTotal = Number(localStorage.getItem("totalTimePlayed"));
    tempoTotal = Math.floor(tempoTotal / 60); //transformar segundos em minutos -- está arredondado!!
    mostrarEstatisticas(numeroJogos, tempoTotal);
}

//mostra as estatísticas na tabela do HTML
let gameStats = document.getElementById("gameStats");
function mostrarEstatisticas(numeroJogos, tempoTotal) {
    const tbody = document.querySelector('#tableStats tbody');
    tbody.innerHTML = `
        <tr class="row1"><th>Número de jogos</th><td>${numeroJogos}</td></tr>
        <tr class="row2"><th>Tempo total jogado</th><td>${tempoTotal} minutos</td></tr>
    `;
    gameStats.classList.remove("hidden");
}
