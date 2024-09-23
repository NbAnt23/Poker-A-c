// DOM Elements
const playerForm = document.getElementById("playerForm");
const playerNameInput = document.getElementById("playerName");
const buyInInput = document.getElementById("buyIn");
const playerTable = document.getElementById("playerTable");
const settlementTable = document.getElementById("settlementTable");

// Player data
let players = [];

// Add player function
function addPlayer(name, buyIn) {
    const newPlayer = {
        name: name,
        buyIn: parseFloat(buyIn),
        chipsLeft: parseFloat(buyIn)
    };
    players.push(newPlayer);
    updateTable();
    saveToLocalStorage();
}

// Update table function
function updateTable() {
    const tbody = playerTable.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows
    
    players.forEach((player, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${player.name}</td>
            <td>₹${player.buyIn.toFixed(2)}</td>
            <td>₹${player.chipsLeft.toFixed(2)}</td>
            <td>
                <button onclick="editChipsLeft(${index})" class="action-btn">Edit</button>
                <button onclick="removePlayer(${index})" class="action-btn">Remove</button>
            </td>
        `;
    });
}

// Edit chips left function
function editChipsLeft(index) {
    const newChipsLeft = prompt("Enter new chips left amount:", players[index].chipsLeft);
    if (newChipsLeft !== null) {
        players[index].chipsLeft = parseFloat(newChipsLeft);
        updateTable();
        saveToLocalStorage();
    }
}

// Remove player function
function removePlayer(index) {
    players.splice(index, 1);
    updateTable();
    saveToLocalStorage();
}

// Calculate settlements
function calculateSettlements() {
    const settlements = [];
    const totalBuyIn = players.reduce((sum, player) => sum + player.buyIn, 0);
    const totalChipsLeft = players.reduce((sum, player) => sum + player.chipsLeft, 0);

    players.forEach(player => {
        const netResult = player.chipsLeft - player.buyIn;
        settlements.push({
            name: player.name,
            amount: netResult
        });
    });

    settlements.sort((a, b) => b.amount - a.amount);

    const finalSettlements = [];
    let i = 0;
    let j = settlements.length - 1;

    while (i < j) {
        const payment = Math.min(Math.abs(settlements[i].amount), Math.abs(settlements[j].amount));
        if (payment > 0) {
            finalSettlements.push({
                from: settlements[j].name,
                to: settlements[i].name,
                amount: payment
            });
        }
        settlements[i].amount -= payment;
        settlements[j].amount += payment;
        if (settlements[i].amount === 0) i++;
        if (settlements[j].amount === 0) j--;
    }

    updateSettlementTable(finalSettlements);
}

// Update settlement table
function updateSettlementTable(settlements) {
    const tbody = settlementTable.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing rows

    settlements.forEach(settlement => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${settlement.from}</td>
            <td>${settlement.to}</td>
            <td>₹${settlement.amount.toFixed(2)}</td>
        `;
    });

    settlementTable.style.display = "table";
}

// Local storage functions
function saveToLocalStorage() {
    localStorage.setItem("pokerPlayers", JSON.stringify(players));
}

function loadFromLocalStorage() {
    const storedPlayers = localStorage.getItem("pokerPlayers");
    if (storedPlayers) {
        players = JSON.parse(storedPlayers);
        updateTable();
    }
}

// Event listener for form submission
playerForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const name = playerNameInput.value.trim();
    const buyIn = buyInInput.value.trim();
    
    if (name && buyIn) {
        addPlayer(name, buyIn);
        playerNameInput.value = "";
        buyInInput.value = "";
    }
});

// Load saved data when page loads
loadFromLocalStorage();

// Add event listener for calculate settlements button
document.getElementById("calculateSettlements").addEventListener("click", calculateSettlements);