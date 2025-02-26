const CONTRACT_ADDRESS = 0x29499c5603B2604d1d34487EfC0e2D9c504534de; 

const CONTRACT_ABI = [
    {
        "inputs": [
            { "internalType": "uint256", "name": "points", "type": "uint256" },
            { "internalType": "uint256", "name": "moves", "type": "uint256" },
            { "internalType": "uint256", "name": "level", "type": "uint256" }
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
            { "internalType": "uint256", "name": "points", "type": "uint256" },
            { "internalType": "uint256", "name": "moves", "type": "uint256" },
            { "internalType": "uint256", "name": "level", "type": "uint256" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
}

async function recordGameResult(points, moves, level) {
    const signer = await connectWallet();
    if (!signer) return;
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    try {
        const tx = await contract.recordScore(points, moves, level);
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
        alert(`Last Game - Points: ${result[0]}, Moves: ${result[1]}, Level: ${result[2]}`);
    } catch (error) {
        console.error("Error fetching game result:", error);
        alert("Error retrieving game data from blockchain");
    }
}
