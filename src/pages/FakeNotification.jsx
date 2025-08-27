import React, { useState, useEffect } from 'react';

const FakeNotification = ({ show, onHide }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fake-notification">
      <div className="notification-content">
        <div className="notification-icon"></div>
        <div className="notification-text">
          <div className="notification-title">고객님이 좋아할 상품했던,</div>
          <div className="notification-subtitle">깔끔 바베큐 크기가 더 커졌어요!</div>
        </div>
      </div>
    </div>
  );
};