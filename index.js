const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let score = 0;
let goal = 10; // Mặc định goal = 10 nếu không thiết lập

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.emit("updateScore", { score, goal });
});

// Mặc định hiển thị overlay
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "overlay.html"));
});

// Thiết lập goal mới qua URL /default=10
app.get("/default=:goal", (req, res) => {
    goal = parseInt(req.params.goal) || 10;
    io.emit("updateScore", { score, goal });
    res.json({ success: true, goal });
});

// Cộng bàn thắng với số tùy chọn
app.get("/cong", (req, res) => {
    const value = parseInt(req.query.value) || 1; // Mặc định là 1 nếu không có value
    score += value;
    io.emit("updateScore", { score, goal });
    res.json({ success: true, score, goal, added: value });
});

// Trừ bàn thắng với số tùy chọn
app.get("/tru", (req, res) => {
    const value = parseInt(req.query.value) || 1;
    score -= value;
    io.emit("updateScore", { score, goal });
    res.json({ success: true, score, goal, subtracted: value });
});

// Reset về 0
app.get("/reset", (req, res) => {
    score = 0;
    io.emit("updateScore", { score, goal });
    res.json({ success: true, score, goal });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
