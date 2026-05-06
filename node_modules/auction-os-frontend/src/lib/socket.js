import { io } from "socket.io-client";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    socket = io("/", {
      path: "/socket.io",
      transports: ["polling", "websocket"],
      auth: token ? { token } : {},
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
