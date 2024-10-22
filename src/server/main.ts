import express from "express";
import { createServer } from "node:http";
import { join } from "node:path";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

const app = express();
const server = createServer(app);

type ClientToServerEvents = {
    message: (message: string) => void;
};

type ServerToClientEvents = {
    message: (message: string) => void;
};

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
    res.sendFile(join(process.cwd(), "index.html"));
});

app.use(express.static(join(__dirname, "../../dist")));

server.listen(3006, () => {
    console.log("Server is running on http://localhost:3006/");
});

io.on("connection", (socket) => {
    socket.on("message", (message) => {
        console.log("Received message:", message);
        socket.broadcast.emit("message", message);
    });
});
