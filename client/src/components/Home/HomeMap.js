import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import axios from "axios";

import pinkicon from "../../assets/img/pinklogo.svg";
import blueicon from "../../assets/img/bluelogo.svg";
import purpleicon from "../../assets/img/purplelogo.svg";
import "./MapContainerLeaflet.css"; // optional CSS

const MapContainerLeaflet = () => {
  const [markersData, setMarkersData] = useState([]);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    axios.get("/api/locations/topFifty")
      .then((res) => {
        setMarkersData(res.data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu marker:", err);
      });
  }, []);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map("leaflet-map", {
        center: [21.0285, 105.8542], // Vị trí mặc định (Hà Nội)
        zoom: 6,
        zoomControl: true,
        attributionControl: false
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(mapRef.current);
    }

    // Xóa marker cũ
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    markersData.forEach(user => {
      const iconUrl =
        user.gender === "male"
          ? blueicon
          : user.gender === "female"
          ? pinkicon
          : purpleicon;

      const customIcon = L.icon({
        iconUrl,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([user.latitude, user.longitude], { icon: customIcon }).addTo(mapRef.current);

      marker.on("click", async () => {
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${user.latitude}&lon=${user.longitude}&format=json`,
            {
              headers: { "User-Agent": "Mozilla/5.0" },
            }
          );

          const address = (res.data && res.data.display_name) || "Không xác định";

          marker.bindPopup(`
            <div class="info-window">
              <div class="iw__pic" style="background-image: url('${user.profile_pic}')"></div>
              <h3>${user.firstName} ${user.lastName}</h3>
              <p>${address}</p>
            </div>
          `).openPopup();
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          marker.bindPopup(`<p>${user.firstName} ${user.lastName}</p><p>Không tìm thấy địa chỉ</p>`).openPopup();
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markersData]);

  return <div id="leaflet-map" style={{ height: "600px", width: "100%" }}></div>;
};

export default MapContainerLeaflet;
