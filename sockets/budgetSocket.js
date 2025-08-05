function budgetSocket(io) {
    io.on("connection", (socket) => {
        const joinedRooms = new Set();

        socket.on("join-budget-room", ({ budgetId, budgetType }) => {
            joinedRooms.forEach(room => {
                socket.leave(room);
            });
            joinedRooms.clear();

            const roomName = `budget-${budgetId}-${budgetType}`;
            socket.join(roomName);
            joinedRooms.add(roomName);
        });

        socket.on("budget-item-changed", ({ budgetId, budgetType, index, item }) => {
            const roomName = `budget-${budgetId}-${budgetType}`;
            socket.to(roomName).emit("received-budget-item-update", { index, item });
        });

        socket.on("budget-item-removed", ({ budgetId, budgetType, index }) => {
            const roomName = `budget-${budgetId}-${budgetType}`;
            socket.to(roomName).emit("received-budget-item-removed", { index });
        });

        socket.on("budget-subcategory-update", ({ budgetId, budgetType, category, subCategories }) => {
            const roomName = `budget-${budgetId}-${budgetType}`;
            socket.to(roomName).emit("received-subcategory-update", { category, subCategories });
        });

        socket.on("budget-tax-changed", ({ budgetId, budgetType, taxes }) => {
            const roomName = `budget-${budgetId}-${budgetType}`;
            socket.to(roomName).emit("received-budget-tax-update", { taxes });
        });

        socket.on("disconnect", () => {
            joinedRooms.clear();
        });
    });
}

module.exports = budgetSocket;