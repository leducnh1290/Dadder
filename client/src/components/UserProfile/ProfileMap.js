import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AddressFetcher.css'; // Import file CSS tùy chỉnh

const AddressFetcher = ({ lat, lon }) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' } // Tránh bị chặn
        });

        if (response.data && response.data.display_name) {
          setAddress(response.data.display_name);
        } else {
          setError('Không tìm thấy địa chỉ.');
        }
      } catch (err) {
        console.error('Lỗi khi lấy địa chỉ:', err);
        setError('Lỗi khi lấy địa chỉ.');
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [lat, lon]);

  return (
    <div className="address-container">
      {loading ? (
        <div className="loading">⏳ Đang lấy địa chỉ...</div>
      ) : error ? (
        <div className="error">❌ {error}</div>
      ) : (
        <div className="address">
          {address}
        </div>
      )}
    </div>
  );
};

export default AddressFetcher;
