(function() {
  // Create and add CSS styles
  const css = `
    body {
      background-color: #eee;
      font-family: sans-serif;
      text-align: center;
      user-select: none;
    }
    h1 {
      margin-top: 20px;
    }
    #score {
      font-size: 20px;
      margin: 10px;
    }
    /* Game board container */
    #board {
      position: relative;
      margin: 20px auto;
      background-color: #fff;
      border: 20px solid #fff;
      border-radius: 24px;
      width: 350px;
      height: 310px;
    }
    .cell {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 1px dashed #aaa;
      border-radius: 50%;
      box-sizing: border-box;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .cell:hover {
      background-color: rgba(0,0,0,0.05);
    }
    .token {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      color: white;
      font-size: 18px;
    }
    #gameOver {
      font-size: 24px;
      color: red;
      margin-top: 20px;
    }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  // Create HTML structure
  document.body.innerHTML = `
    <h1>Blockchain Game</h1>
    <button id="connectWallet">Connect Wallet</button>
    <div id="walletStatus">Not Connected</div>
    <div id="score">Score: 0</div>
    <div id="lastScore">Last Recorded Score: -</div>
    <div id="board"></div>
    <div id="gameOver"></div>
  `;

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
      if (!window.ethereum) return alert("Wallet not connected!");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
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
      if (!window.ethereum) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      try {
          const playerAddress = await signer.getAddress();
          const lastScore = await contract.getLastScore(playerAddress);
          document.getElementById("lastScore").innerText = "Last Recorded Score: " + lastScore;
      } catch (error) {
          console.error("Error fetching last score:", error);
          document.getElementById("lastScore").innerText = "Last Recorded Score: No record found";
      }
  }

  function endGame(finalScore) {
      console.log("Game Over! Score:", finalScore);
      document.getElementById("gameOver").innerText = "Game Over!";
      recordGameResult(finalScore);
  }
})();
