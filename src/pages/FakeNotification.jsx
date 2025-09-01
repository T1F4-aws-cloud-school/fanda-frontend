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
          <div className="notification-title">고객님이 좋아할만한 상품!,</div>
          <div className="notification-subtitle">신선 연어 크기가 더 커지고, 품질이 개선되었어요!</div>
        </div>
      </div>
    </div>
  );
};

export default FakeNotification;