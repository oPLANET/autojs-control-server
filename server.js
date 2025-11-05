// server.js
import { WebSocketServer } from "ws";
import http from "http";

const PORT = process.env.PORT || 10000;
const server = http.createServer();
const wss = new WebSocketServer({ server });

let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log("✅ 新客户端已连接，总连接数:", clients.size);

  // 连接确认
  ws.send(JSON.stringify({ type: "info", msg: "connected" }));

  ws.on("message", (message) => {
    console.log("📩 收到消息:", message.toString());
    try {
      const data = JSON.parse(message);

      // 如果是指令，广播给所有客户端（包括自己）
      if (data.type === "command") {
        console.log("📢 广播指令:", data.data);
        for (const client of clients) {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: "command", data: data.data }));
          }
        }
      }
    } catch (err) {
      console.error("❌ 无法解析消息:", err);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log("🔌 客户端断开，总连接数:", clients.size);
  });
});

server.listen(PORT, () => {
  console.log(`✅ WebSocket 控制服务器已启动，端口 ${PORT}`);
});
