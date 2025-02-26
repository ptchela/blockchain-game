const CONTRACT_ADDRESS = "0x29499c5603B2604d1d34487EfC0e2D9c504534de";
const CONTRACT_ABI = [
    {
        "inputs": [{ "internalType": "uint256", "name": "score", "type": "uint256" }],
        "name": "recordScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
        "name": "getLastScore",
        "outputs": [{ "internalType": "uint256", "name": "score", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

let board = {};
let cells = [];
let queue = [];
let score = 0;
let gameOver = false;

const boardDiv = document.getElementById("board");
const queueDiv = document.getElementById("queue");
const scoreDiv = document.getElementById("score");
const gameOverDiv = document.getElementById("gameOver");
const lastScoreDiv = document.getElementById("lastScore");

document.addEventListener("DOMContentLoaded", initGame);

async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }
    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        document.getElementById("walletStatus").innerText = "Wallet Connected";
        await updateLastScore(signer);
        return signer;
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);

function initGame() {
    createBoard();
    initQueue();
    updateScore();
    renderQueue();
}

function createBoard() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let q = -3; q <= 3; q++) {
        const r1 = Math.max(-3, -q - 3);
        const r2 = Math.min(3, -q + 3);
        for (let r = r1; r <= r2; r++) {
            const x = 30 * Math.sqrt(3) * (q + r / 2);
            const y = 30 * 3/2 * r;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);

            const cell = { q, r, x, y, token: null, element: null };
            cells.push(cell);
            board[`${q},${r}`] = cell;
        }
    }

    cells.forEach(cell => {
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        cellDiv.style.left = `${cell.x - minX + 20 - 20}px`;
        cellDiv.style.top = `${cell.y - minY + 20 - 20}px`;
        cellDiv.addEventListener("click", () => {
            if (!gameOver && cell.token === null) placeToken(cell);
        });
        boardDiv.appendChild(cellDiv);
        cell.element = cellDiv;
    });
}

function initQueue() {
    queue = [];
    for (let i = 0; i < 3; i++) queue.push(getRandomToken());
}

function getRandomToken() {
    return { color: Math.random() < 0.5 ? "red" : "blue", level: Math.ceil(Math.random() * 4) };
}

function renderQueue() {
    queueDiv.innerHTML = "";
    queue.forEach(token => {
        const tokenDiv = document.createElement("div");
        tokenDiv.classList.add("queue-token");
        tokenDiv.style.backgroundColor = token.color;
        tokenDiv.innerText = token.level;
        queueDiv.appendChild(tokenDiv);
    });
}

function updateScore() {
    scoreDiv.innerText = "Score: " + score;
}

async function endGame() {
    console.log("Game Over! Score:", score);
    gameOverDiv.innerText = "Game Over!";
    await recordGameResult(score);
}

async function recordGameResult(finalScore) {
    const signer = await connectWallet();
    if (!signer) return;
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
        const tx = await contract.recordScore(finalScore);
        console.log("Score saved:", tx.hash);
        alert("Score recorded on blockchain!");
        await updateLastScore(signer);
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

async function updateLastScore(signer) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
        const lastScore = await contract.methods.getLastScore(await signer.getAddress()).call();
        lastScoreDiv.innerText = "Last Recorded Score: " + lastScore;
    } catch (error) {
        console.error("Error fetching last score:", error);
    }
}
