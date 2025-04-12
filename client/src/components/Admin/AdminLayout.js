import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Link, useLocation } from 'react-router-dom';
import './AdminDashboard.css';

const AdminLayout = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  const location = useLocation();
  
  // Kiểm tra quyền admin
  if (!auth.isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Kiểm tra role admin - giả sử role được lưu trong user.role
  // Nếu không có role trong user, bạn cần cập nhật lại logic này
  const isAdmin = auth.user && auth.user.role === 'admin';
  // const isAdmin = auth.user;

  
  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fc'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#ffffff',
        color: '#333',
        padding: '0',
        boxShadow: '0 0 15px rgba(0,0,0,0.05)',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 1000
      }}>
        {/* Logo and Title */}
        <div style={{
          padding: '25px 20px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#4e73df',
            letterSpacing: '0.5px'
          }}>
            Admin Panel Dadder
          </h2>
        </div>

        {/* Navigation */}
        <div style={{ padding: '20px 15px' }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            margin: 0
          }}>
            <li style={{ 
              marginBottom: '8px'
            }}>
              <Link to="/admin" style={{ 
                color: isActive('/admin') ? '#4e73df' : '#6c757d',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                borderRadius: '8px',
                backgroundColor: isActive('/admin') ? 'rgba(78, 115, 223, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive('/admin') ? '600' : '400',
                fontSize: '15px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={isActive('/admin') ? '#4e73df' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 22V12H15V22" stroke={isActive('/admin') ? '#4e73df' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Dashboard
              </Link>
            </li>
            <li style={{ 
              marginBottom: '8px'
            }}>
              <Link to="/admin/users" style={{ 
                color: isActive('/admin/users') ? '#1cc88a' : '#6c757d',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                borderRadius: '8px',
                backgroundColor: isActive('/admin/users') ? 'rgba(28, 200, 138, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive('/admin/users') ? '600' : '400',
                fontSize: '15px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={isActive('/admin/users') ? '#1cc88a' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={isActive('/admin/users') ? '#1cc88a' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={isActive('/admin/users') ? '#1cc88a' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={isActive('/admin/users') ? '#1cc88a' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Quản lý người dùng
              </Link>
            </li>
            <li style={{ 
              marginBottom: '8px'
            }}>
              <Link to="/admin/pro" style={{ 
                color: isActive('/admin/pro') ? '#f6c23e' : '#6c757d',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                borderRadius: '8px',
                backgroundColor: isActive('/admin/pro') ? 'rgba(246, 194, 62, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
                fontWeight: isActive('/admin/pro') ? '600' : '400',
                fontSize: '15px'
              }}>
                <span style={{ marginRight: '10px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke={isActive('/admin/pro') ? '#f6c23e' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={isActive('/admin/pro') ? '#f6c23e' : '#6c757d'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Quản lý Pro
              </Link>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <div style={{ 
          padding: '20px 15px',
          borderTop: '1px solid #f0f0f0',
          marginTop: 'auto'
        }}>
          <Link to="/" style={{ 
            color: '#ff4d4f',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            padding: '12px 15px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            fontSize: '15px',
            fontWeight: '500'
          }}>
            <span style={{ marginRight: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Trở lại trang chủ
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        marginLeft: '280px',
        padding: '30px',
        backgroundColor: '#f8f9fc'
      }}>
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;