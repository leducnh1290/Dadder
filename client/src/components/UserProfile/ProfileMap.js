import React, { useEffect, useState, useRef } from "react";
import pinkicon from "../../assets/img/pinklogo.svg"; // Nữ
import blueicon from "../../assets/img/bluelogo.svg"; // Nam
import purpleicon from "../../assets/img/purplelogo.svg"; // Không xác định
import L from "leaflet"; // Import Leaflet để xử lý bản đồ
import axios from "axios"; // Import axios để gọi API
import "./AddressFetcher.css"; // Import file CSS tùy chỉnh

const AddressFetcher = ({ lat, lon, gender, name }) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null); // Lưu đối tượng bản đồ để không bị reset
  const markerRef = useRef(null); // Lưu đối tượng marker để cập nhật tọa độ
  const mapId = "map"; // Định danh duy nhất cho bản đồ

  useEffect(() => {
    if (!lat || !lon) {
      setError("Tọa độ không hợp lệ.");
      setLoading(false);
      return;
    }

    const fetchAddress = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = await axios.get(url, {
          headers: { "User-Agent": "Mozilla/5.0" }, // Tránh bị chặn
        });

        if (response.data && response.data.display_name) {
          let address = response.data.display_name;
          let postcode = response.data.address.postcode;
          let filteredAddress = address.replace(new RegExp(`,? ${postcode}`, "g"), "");
          setAddress(filteredAddress);
        } else {
          setError("Không tìm thấy địa chỉ.");
        }
      } catch (err) {
        console.error("Lỗi khi lấy địa chỉ:", err);
        setError("Lỗi khi lấy địa chỉ.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [lat, lon]);

  useEffect(() => {
    if (!lat || !lon) return;

    if (!mapRef.current) {
      // Khởi tạo bản đồ chỉ một lần
      mapRef.current = L.map(mapId, {
        center: [lat, lon],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false,
        keyboard: false,
        tap: false,
        touchZoom: false,
      });

      // Thêm tile layer từ OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    const iconUrl = gender === "male" ? blueicon : gender === "female" ? pinkicon : purpleicon;

    // Tạo custom icon cho marker
    const icon = L.icon({
      iconUrl: iconUrl, // Sử dụng tệp SVG đã import
      iconSize: [50, 50], // Kích thước của biểu tượng
      iconAnchor: [25, 50], // Điểm neo vào chính giữa dưới của icon
      popupAnchor: [0, -50], // Khoảng cách popup khi click vào marker
    });

    if (!markerRef.current) {
      // Tạo marker nếu chưa có
      markerRef.current = L.marker([lat, lon], { icon }).addTo(mapRef.current);
      markerRef.current.bindPopup(`${name} ở đây :)`).openPopup();
    } else {
      // Cập nhật vị trí marker nếu đã tồn tại
      markerRef.current.setLatLng([lat, lon]);
      mapRef.current.setView([lat, lon], 12);
    }

    return () => {
      // Cleanup khi component unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [lat, lon, gender, name]);

  return (
    <div className="address-fetcher-container">
      {loading ? (
        <div className="loading">Đang lấy địa chỉ...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="address">{address}</div>
      )}
      <div id={mapId}></div>
    </div>
  );
};

export default AddressFetcher;
