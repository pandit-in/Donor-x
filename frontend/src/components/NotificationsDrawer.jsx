import React from 'react';
import { FaTimes, FaBell } from 'react-icons/fa';

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  openRequests,
  onRespond,
  onMarkRead,
  onMarkAllRead,
}) {
  if (!isOpen) return null;
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 520 }} onClick={(event) => event.stopPropagation()}>
        <div className="modal-header-sos" style={{ background: '#1e293b' }}>
          <div className="modal-title-sos"><FaBell style={{ color: '#ef233c' }} /> Notifications ({unreadCount} unread)</div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><FaTimes /></button>
        </div>
        <div className="modal-body notification-list">
          {unreadCount > 0 && (
            <button type="button" className="auth-mode-toggle" onClick={onMarkAllRead}>Mark all as read</button>
          )}
          {notifications.map((notification) => (
            <article key={notification._id} className={`notification-item ${notification.readAt ? '' : 'unread'}`}>
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
              <time>{new Date(notification.createdAt).toLocaleString()}</time>
              {!notification.readAt && (
                <button type="button" className="auth-mode-toggle" onClick={() => onMarkRead(notification._id)}>Mark as read</button>
              )}
            </article>
          ))}
          {notifications.length === 0 && <p className="availability-desc">No notifications yet.</p>}

          <h3 className="availability-heading">Open blood requests</h3>
          {openRequests.map((request) => (
            <article key={request.id} className="notification-item">
              <strong>{request.bloodGroup} · {request.hospital}</strong>
              <p>{request.unitsNeeded} unit(s) · {request.urgency} · {request.area}</p>
              <button type="button" className="btn-ticker-respond" onClick={() => { onClose(); onRespond(request); }}>
                Respond with ETA
              </button>
            </article>
          ))}
          {openRequests.length === 0 && <p className="availability-desc">No open requests at this time.</p>}
        </div>
      </div>
    </div>
  );
}
