import { useEffect, useState } from "react";

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const token =
    localStorage.getItem("token");

  const loadNotifications = async () => {
    const response = await fetch(
      "http://localhost:5000/api/notifications",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setNotifications(
      data.notifications || []
    );
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id: string) => {
    await fetch(
      `http://localhost:5000/api/notifications/${id}/read`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadNotifications();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold">
          Notifications
        </h1>

        <div className="mt-6 space-y-3">

          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() =>
                markRead(notification._id)
              }
              className={`p-5 rounded-2xl border cursor-pointer ${
                notification.read
                  ? "bg-slate-900 border-white/5"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex justify-between">

                <h2 className="font-semibold">
                  {notification.title}
                </h2>

                {!notification.read && (
                  <span className="text-xs text-blue-400">
                    NEW
                  </span>
                )}

              </div>

              <p className="text-slate-300 mt-2">
                {notification.message}
              </p>

              <p className="text-xs text-slate-500 mt-2">
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </p>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}