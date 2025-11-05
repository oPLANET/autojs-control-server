// server.js
// 简单的 WebSocket 控制服务器，支持 Render / Railway / VPS 免费部署
const WebSocket = require("ws");
const PORT = process.env.PORT || 10000; // Render 或 Railway 自动分配端口
const wss = new WebSocket.Server({ port: PORT });

console.log(`✅ WebSocket 控制服务器已启动，端口 ${PORT}`);

let clients = new Set();

wss.on("connection", ws => {
    clients.add(ws);
    console.log("📱 新设备连接，目前在线数:", clients.size);
    ws.send(JSON.stringify({ type: "info", msg: "connected" }));

    ws.on("message", msg => {
        msg = msg.toString().trim();
        console.log("📩 收到消息:", msg);

        if (msg === "start") {
            console.log("🚀 主控机发出启动命令，广播中...");
            broadcast({ type: "command", cmd: "start" });
        } else if (msg === "ping") {
            ws.send(JSON.stringify({ type: "pong" }));
        } else {
            console.log("⚠️ 未知消息:", msg);
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
        console.log("❎ 设备断开，目前在线数:", clients.size);
    });
});

function broadcast(obj) {
    for (let ws of clients) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(obj));
        }
    }
}
