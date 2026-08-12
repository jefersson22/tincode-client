import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import "./UserWelcome.scss";

export function UserWelcome() {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const loginDate = user.iat ? new Date(user.iat * 1000) : null;

  const formatDate = (date) =>
    date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div className="user-welcome">
      <div className="user-welcome__avatar">
        {user.email ? user.email.charAt(0).toUpperCase() : "U"}
      </div>

      <div className="user-welcome__info">
        <p className="user-welcome__greeting">
          Bienvenido, <strong>{user.email}</strong>
          {user.role && (
            <span className={`user-welcome__role user-welcome__role--${user.role}`}>
              {user.role}
            </span>
          )}
        </p>

        <div className="user-welcome__meta">
          {loginDate && (
            <span className="user-welcome__login">
              Ingreso: {formatDate(loginDate)} · {formatTime(loginDate)}
            </span>
          )}
          <span className="user-welcome__divider">•</span>
          <span className="user-welcome__clock">{formatTime(now)}</span>
        </div>
      </div>
    </div>
  );
}