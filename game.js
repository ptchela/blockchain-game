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

document.addEventListener("DOMContentLoaded", async function () {
    if (typeof window.ethereum !== "undefined") {
        console.log("MetaMask is installed!");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        window.signer = provider.getSigner();
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
    }
});

document.getElementById("connectWallet").addEventListener("click", async () => {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        document.getElementById("walletStatus").innerText = "Wallet Connected";
        updateLastScore();
    } catch (err) {
        console.error("Connection failed", err);
    }
});

async function recordGameResult(finalScore) {
    if (!window.signer) return alert("Wallet not connected!");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, window.signer);
    try {
        const tx = await contract.recordScore(finalScore);
        console.log("Score saved:", tx.hash);
        alert("Score recorded on blockchain!");
        await updateLastScore();
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

async function updateLastScore() {
    if (!window.signer) return;
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, window.signer);
    try {
        const playerAddress = await window.signer.getAddress();
        const lastScore = await contract.getLastScore(playerAddress);
        document.getElementById("lastScore").innerText = "Last Recorded Score: " + lastScore;
    } catch (error) {
        console.error("Error fetching last score:", error);
    }
}

function endGame(finalScore) {
    console.log("Game Over! Score:", finalScore);
    document.getElementById("gameOver").innerText = "Game Over!";
    recordGameResult(finalScore);
}
