const budgetSocket = require("./budgetSocket");

function initAllSockets(io) {
    budgetSocket(io);
}

module.exports = initAllSockets;
