import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { getProUsers } from '../../store/actions/adminActions';

const ProManagement = ({ proUsersData, getProUsers, pagination }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Fetch data when filters change
  useEffect(() => {
    getProUsers(currentPage, limit, debouncedSearchTerm, statusFilter, planFilter);
  }, [currentPage, limit, debouncedSearchTerm, statusFilter, planFilter, getProUsers]);

  // Handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPlanFilter('all');
    setCurrentPage(1);
  };

  const handleStatusChange = async (userId, newStatus) => {
    console.log(`Change status for user ${userId} to ${newStatus}`);
    // Add API call to update status here
  };

  const handlePaymentStatusChange = async (userId, newStatus) => {
    console.log(`Change payment status for user ${userId} to ${newStatus}`);
    // Add API call to update payment status here
  };

  const handleRenew = (userId) => {
    console.log(`Renew subscription for user ${userId}`);
    // Add renew logic here
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Quản lý người dùng Pro</h1>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: '1 1 300px'
          }}
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: '0 1 200px'
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="Active">Đang hoạt động</option>
          <option value="Inactive">Không hoạt động</option>
        </select>
        
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: '0 1 200px'
          }}
        >
          <option value="all">Tất cả gói</option>
          <option value="Monthly">Hàng tháng</option>
          <option value="Yearly">Hàng năm</option>
        </select>
        
        <button
          onClick={handleResetFilters}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: '0 0 auto'
          }}
        >
          Reset
        </button>
      </div>

      {/* Pro Users Table */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflowX: 'auto',
        marginBottom: '20px'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Tên</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Gói đăng ký</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Ngày bắt đầu</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Ngày kết thúc</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Trạng thái</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Thanh toán</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
          {proUsersData && proUsersData.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.id}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {user.subscription_plan === 'Monthly' ? 'Hàng tháng' : 'Hàng năm'}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{formatDate(user.start_date)}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{formatDate(user.end_date)}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: user.status === 'Active' ? '#e3fcef' : '#fff1f0',
                    color: user.status === 'Active' ? '#00a854' : '#f5222d'
                  }}>
                    {user.status === 'Active' ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: user.payment_status === 'Completed' ? '#e3fcef' : '#fff1f0',
                    color: user.payment_status === 'Completed' ? '#00a854' : '#f5222d'
                  }}>
                    {user.payment_status === 'Completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={() => handleRenew(user.id)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginRight: '8px',
                      backgroundColor: '#1cc88a',
                      color: 'white'
                    }}
                  >
                    {user.actions === 'Renew' ? 'Gia hạn' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px'
        }}>
          <div style={{ color: '#666' }}>
            Hiển thị {((currentPage - 1) * limit) + 1} -{' '}
            {Math.min(currentPage * limit, pagination.totalUsers)} trên tổng số{' '}
            {pagination.totalUsers} người dùng
          </div>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              &lt;
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    backgroundColor: currentPage === page ? '#4e73df' : 'white',
                    color: currentPage === page ? 'white' : 'inherit',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              );
            })}

            {pagination.totalPages > 5 && (
              <span style={{ padding: '8px' }}>...</span>
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === pagination.totalPages ? 0.5 : 1
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  proUsersData: state.admin.proUsers ? state.admin.proUsers.users : [],
  pagination: state.admin.proUsers ? state.admin.proUsers.pagination : { 
    currentPage: 1, 
    totalPages: 1, 
    totalUsers: 0 
  }
});

export default connect(mapStateToProps, { getProUsers })(ProManagement);