import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] }); // Đổi URL nếu backend chạy ở cổng khác

export default socket;
