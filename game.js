// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GameScores {
    struct Score {
        uint256 points;
        uint256 moves;
        uint256 level;
    }

    mapping(address => Score[]) public playerScores;
    event ScoreRecorded(address indexed player, uint256 points, uint256 moves, uint256 level);

    function recordScore(uint256 points, uint256 moves, uint256 level) public {
        Score memory newScore = Score(points, moves, level);
        playerScores[msg.sender].push(newScore);
        emit ScoreRecorded(msg.sender, points, moves, level);
    }

    function getLastScore(address player) public view returns (uint256 points, uint256 moves, uint256 level) {
        require(playerScores[player].length > 0, "No score recorded");
        Score memory last = playerScores[player][playerScores[player].length - 1];
        return (last.points, last.moves, last.level);
    }
}

// JavaScript frontend integration
const CONTRACT_ADDRESS = "0x29499c5603B2604d1d34487EfC0e2D9c504534de";
const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "score", "type": "uint256" }
        ],
        "name": "recordScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
        "name": "getLastScore",
        "outputs": [
            { "internalType": "uint256", "name": "score", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let circles = [];
let score = 0;

class Circle {
    constructor(x, y, radius, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = dx;
        this.dy = dy;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }
    }
}

function init() {
    circles = [];
    for (let i = 0; i < 10; i++) {
        let radius = 30;
        let x = Math.random() * (canvas.width - radius * 2) + radius;
        let y = Math.random() * (canvas.height - radius * 2) + radius;
        let dx = (Math.random() - 0.5) * 4;
        let dy = (Math.random() - 0.5) * 4;
        circles.push(new Circle(x, y, radius, dx, dy));
    }
}

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(circle => {
        circle.update();
        circle.draw();
    });
}

document.addEventListener("click", function (event) {
    circles.forEach((circle, index) => {
        let distance = Math.hypot(event.clientX - circle.x, event.clientY - circle.y);
        if (distance < circle.radius) {
            circles.splice(index, 1);
            score += 10;
        }
    });
    if (circles.length === 0) {
        endGame();
    }
});

async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
}

async function recordGameResult(finalScore) {
    const signer = await connectWallet();
    if (!signer) return;
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
        const tx = await contract.recordScore(finalScore);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Result recorded in blockchain");
        alert("Result saved in the blockchain!");
    } catch (error) {
        console.error("Error sending data:", error);
        alert("Error writing to the blockchain");
    }
}

async function getLastGameResult() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    const signer = provider.getSigner();
    const playerAddress = await signer.getAddress();
    
    try {
        const result = await contract.getLastScore(playerAddress);
        console.log("Last game result:", result);
        alert(`Last Game - Score: ${result}`);
    } catch (error) {
        console.error("Error fetching game result:", error);
        alert("Error retrieving game data from blockchain");
    }
}

function endGame() {
    console.log("Game Over! Final Score:", score);
    recordGameResult(score);
    score = 0;
    init();
}

init();
animate();
