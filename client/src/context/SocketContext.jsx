import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      console.log("🔌 Connected to Notification Server");
      newSocket.emit("join", user.id);
    });

    newSocket.on("newNotification", (notification) => {
      setUnreadCount((prev) => prev + 1);

      let message = "You have a new notification";
      if (notification.type === "like") {
        message = `❤️ ${notification.sender.name} liked your article: "${notification.blog.title}"`;
      } else if (notification.type === "comment") {
        message = `💬 ${notification.sender.name} commented on your article: "${notification.blog.title}"`;
      } else if (notification.type === "reply") {
        message = `🔁 ${notification.sender.name} replied to your comment`;
      } else if (notification.type === "bookmark") {
        message = `🔖 ${notification.sender.name} bookmarked your article`;
      } else if (notification.type === "follow") {
        message = `👤 ${notification.sender.name} started following you`;
      }

      toast.info(message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
