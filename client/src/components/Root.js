import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Sidebar from './Sidebar/sidebar';
import Navbar from './Navbar/navbar';
import Footer from './Footer/footer';
import ChatPanel from './Chat/ChatPanel';
import PopUp from './PopUp/PopUp';
import Notifications from './Notifications/Notifications';

const Root = ({ children }) => {
  const location = useLocation();
  const isAuth = useSelector((state) => state.auth.isAuthenticated);

  const path = location.pathname;

  // Các điều kiện để ẩn layout
  const shouldHideLayout = path.startsWith('/admin')||path.startsWith('/ban'); // ẩn tất cả /admin và các nhánh

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div id="wrapper">
        <Navbar />
        <PopUp />
        <Notifications />
        <div id="container">
          {children}
        </div>
        <Footer />
        {isAuth && <ChatPanel />}
      </div>
    </>
  );
};

export default Root;
