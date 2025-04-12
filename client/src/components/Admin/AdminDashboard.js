import React, { useEffect, useRef, useCallback } from "react";
import { connect } from "react-redux";
import { getAdminStats } from "../../store/actions/adminActions";

const Dashboard = ({ stats = {}, getAdminStats }) => {
  const genderChartRef = useRef(null);
  const ageChartRef = useRef(null);
  const interestChartRef = useRef(null);
  const isMounted = useRef(false);
  const visitsChartRef = useRef(null);
  const messagesChartRef = useRef(null);

  const fetchStats = useCallback(() => {
    getAdminStats();
  }, [getAdminStats]);

  useEffect(() => {
    if (!isMounted.current) {
      fetchStats();
      isMounted.current = true;
    }
  }, [fetchStats]);

  useEffect(() => {
    if (!window.Chart || !stats || Object.keys(stats).length === 0) return;

    // ===================== GIỚI TÍNH ===================== //
    const genderCanvas = document.getElementById("genderChart");
    if (genderCanvas) {
      if (genderChartRef.current) genderChartRef.current.destroy();

      const genderCtx = genderCanvas.getContext("2d");
      genderChartRef.current = new window.Chart(genderCtx, {
        type: "pie",
        data: {
          labels: ["Nam", "Nữ", "Khác"],
          datasets: [
            {
              data: [
                stats.total_male || 0,
                stats.total_female || 0,
                stats.total_other || 0,
              ],
              backgroundColor: ["#4e73df", "#e74a3b", "#f6c23e"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom" },
            title: { display: true, text: "Phân bố giới tính" },
          },
        },
      });
    }

    // ===================== ĐỘ TUỔI ===================== //
    const ageCanvas = document.getElementById("ageChart");
    if (ageCanvas) {
      if (ageChartRef.current) ageChartRef.current.destroy();

      const ageCtx = ageCanvas.getContext("2d");
      ageChartRef.current = new window.Chart(ageCtx, {
        type: "bar",
        data: {
          labels:
            (stats.age_distribution &&
              stats.age_distribution.map((item) => item.age_group)) ||
            [],

          datasets: [
            {
              label: "Số lượng",
              data:
                (stats.age_distribution &&
                  stats.age_distribution.map((item) => item.total)) ||
                [],

              backgroundColor: "#36b9cc",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Phân bố độ tuổi" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    // ===================== SỞ THÍCH ===================== //
    const interestCanvas = document.getElementById("interestChart");
    if (interestCanvas) {
      if (interestChartRef.current) interestChartRef.current.destroy();

      const interestCtx = interestCanvas.getContext("2d");
      interestChartRef.current = new window.Chart(interestCtx, {
        type: "bar",
        data: {
          labels:
            (stats.popular_interests &&
              stats.popular_interests.map((item) =>
                item.tag.replace(/_/g, " ")
              )) ||
            [],

          datasets: [
            {
              label: "Số lượng",
              data:
                (stats.popular_interests &&
                  stats.popular_interests.map((item) => item.total)) ||
                [],
              backgroundColor: "#1cc88a",
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Sở thích phổ biến" },
          },
          scales: {
            x: { beginAtZero: true },
          },
        },
      });
    }
    // ===================== LƯỢT XEM ===================== //
    const visitsCanvas = document.getElementById("visitsChart");
    if (visitsCanvas) {
      if (visitsChartRef.current) visitsChartRef.current.destroy();

      const visitsCtx = visitsCanvas.getContext("2d");
      visitsChartRef.current = new window.Chart(visitsCtx, {
        type: "bar",
        data: {
          labels:
            (stats.daily_visits &&
              stats.daily_visits.map((v) => `User ${v.user_id}`)) ||
            [],
          datasets: [
            {
              label: "Số người đã xem",
              data:
                (stats.daily_visits &&
                  stats.daily_visits.map((v) => v.total_views)) ||
                [],
              backgroundColor: "#ff9f40",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: "Lượt xem người dùng" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    // ===================== TIN NHẮN THEO NGÀY ===================== //
    const messagesCanvas = document.getElementById("messagesChart");
    if (messagesCanvas) {
      if (messagesChartRef.current) messagesChartRef.current.destroy();

      const messagesCtx = messagesCanvas.getContext("2d");
      messagesChartRef.current = new window.Chart(messagesCtx, {
        type: "line",
        data: {
          labels:
            (stats.daily_messages &&
              stats.daily_messages.map((m) =>
                new Date(m.date).toLocaleDateString()
              )) ||
            [],
          datasets: [
            {
              label: "Tin nhắn",
              data:
                (stats.daily_messages &&
                  stats.daily_messages.map((m) => m.message_count)) ||
                [],
              borderColor: "#4e73df",
              backgroundColor: "rgba(78, 115, 223, 0.05)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Tin nhắn theo ngày" },
          },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    }

    // Cleanup
    return () => {
      if (genderChartRef.current) genderChartRef.current.destroy();
      if (ageChartRef.current) ageChartRef.current.destroy();
      if (interestChartRef.current) interestChartRef.current.destroy();
      if (visitsChartRef.current) visitsChartRef.current.destroy();
      if (messagesChartRef.current) messagesChartRef.current.destroy();

    };
  }, [stats]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "30px", color: "#333" }}>Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <StatCard label="Tổng người dùng" value={stats.total_users || 0} />
        <StatCard
          label="Người dùng đang hoạt động"
          value={stats.active_users || 0}
        />
        <StatCard label="Tổng số match" value={stats.total_matches || 0} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div className="chart-box">
          <canvas id="genderChart" height="300"></canvas>
        </div>
        <div className="chart-box">
          <canvas id="ageChart" height="300"></canvas>
        </div>
      </div>

      <div className="chart-box" style={{ marginBottom: "40px" }}>
        <canvas id="interestChart" height="400"></canvas>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <div className="chart-box">
          <canvas id="visitsChart" height="300"></canvas>
        </div>
        <div className="chart-box">
          <canvas id="messagesChart" height="300"></canvas>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    }}
  >
    <h3 style={{ color: "#666", marginBottom: "10px" }}>{label}</h3>
    <p style={{ color: "#333", fontSize: "24px", fontWeight: "bold" }}>
      {value}
    </p>
  </div>
);

const mapStateToProps = (state) => ({
  stats: state.admin.stats || {},
});

export default connect(mapStateToProps, {
  getAdminStats,
})(Dashboard);
