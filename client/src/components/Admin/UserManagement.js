import React, { useState, useEffect, use } from "react";
import { connect } from "react-redux";
import {
  getAdminUsers,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
} from "../../store/actions/adminActions";

const UserManagement = ({
  usersData,
  getAdminUsers,
  pagination,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term để tránh gọi API liên tục khi gõ
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Gọi API khi có thay đổi về trang, search term hoặc filter
  useEffect(() => {
    getAdminUsers(currentPage, limit, debouncedSearchTerm, statusFilter);
  }, [currentPage, limit, debouncedSearchTerm, statusFilter, getAdminUsers]);

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý reset bộ lọc
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Xử lý thay đổi trạng thái user
  const handleStatusChange = async (userId, newStatus) => {
    try {
      if (newStatus === "Banned") {
        const reason = prompt("Nhập lý do band người dùng:");
        if (!reason) return;
        // Gọi API để ban người dùng
        await banUserAction(userId, reason);
        console.log(`Đã band user ${userId}`);
      } else if (newStatus === "Not Banned") {
        // Gọi API để gỡ ban người dùng
        await unbanUserAction(userId);
        console.log(`Đã gỡ band user ${userId}`);
      }

      // Sau khi cập nhật trạng thái thành công, gọi lại API để cập nhật danh sách
      getAdminUsers(currentPage, limit, debouncedSearchTerm, statusFilter);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xoá người dùng có ID " + userId + " ?"
      )
    )
      return;

    try {
      await deleteUserAction(userId);
      getAdminUsers(currentPage, limit, debouncedSearchTerm, statusFilter);
      console.log(`Đã xoá user ${userId}`);
    } catch (error) {
      console.error("Lỗi khi xoá user:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>
        Quản lý người dùng
      </h1>

      {/* Navigation - Giữ nguyên như cũ */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {/* ... (giữ nguyên phần navigation) ... */}
      </div>
      {/* Users Table */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            flex: "1 1 300px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            flex: "0 1 200px",
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>

        <button
          onClick={handleResetFilters}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff4d4f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            flex: "0 0 auto",
          }}
        >
          Reset
        </button>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          overflowX: "auto",
          marginBottom: "20px",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Tên
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Vai trò
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Active
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Trạng thái
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                }}
              >
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {usersData &&
              usersData.map((user) => (
                <tr key={user.id}>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    {user.id}
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    {user.name}
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    {user.email}
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          user.role === "admin" ? "#f8e3ff" : "#e6f7ff",
                        color: user.role === "admin" ? "#722ed1" : "#1890ff",
                      }}
                    >
                      {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                    </span>
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    {user.status === "Active" ? (
                      <span style={{ color: "#00a854" }}>Active</span>
                    ) : (
                      <span style={{ color: "#f5222d" }}>Inactive</span>
                    )}
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    <select disabled={user.role == "admin"}
                      value={user.ban_status}
                      onChange={(e) =>
                        handleStatusChange(user.id, e.target.value)
                      }
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        opacity: user.role == "admin" ? "0.5" : "1",
                        border: "1px solid #ddd",
                        backgroundColor:
                          user.ban_status === "Not Banned"
                            ? "#e3fcef"
                            : "#fff1f0",
                        color:
                          user.ban_status === "Not Banned"
                            ? "#00a854"
                            : "#f5222d",
                      }}
                    >
                      <option value="Not Banned">Not Banned</option>
                      <option value="Banned">Banned</option>
                    </select>
                  </td>
                  <td
                    style={{ padding: "12px", borderBottom: "1px solid #eee" }}
                  >
                    <button
                      disabled={user.role == "admin"}
                      onClick={() => handleDelete(user.id)}
                      style={{
                        padding: "6px 12px",
                        border: "none",
                        opacity: user.role == "admin" ? "0.5" : "1",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#ff4d4f",
                        color: "white",
                      }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            gap: "5px",
          }}
        >
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            &lt;
          </button>

          {/* Hiển thị các trang */}
          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    backgroundColor: currentPage === page ? "#4e73df" : "white",
                    color: currentPage === page ? "white" : "inherit",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {page}
                </button>
              );
            }
          )}

          {pagination.totalPages > 5 && (
            <span style={{ padding: "8px" }}>...</span>
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor:
                currentPage === pagination.totalPages
                  ? "not-allowed"
                  : "pointer",
              opacity: currentPage === pagination.totalPages ? 0.5 : 1,
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  const admin = state.admin || {};
  const users = admin.users || {};
  return {
    usersData: users.users || [],
    pagination: users.pagination || { currentPage: 1, totalPages: 1 },
  };
};

export default connect(mapStateToProps, {
  getAdminUsers,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
})(UserManagement);
