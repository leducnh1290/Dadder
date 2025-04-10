// src/components/DisableAllCSS.js
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const DisableAllCSS = () => {
  const location = useLocation();

  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin');

    // 1. Vô hiệu hóa tất cả link CSS
    const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    linkTags.forEach(link => {
      link.disabled = isAdmin;
    });

    // 2. Ẩn các thẻ <style> nội bộ (ví dụ styled-components hoặc CSS module runtime)
    const styleTags = Array.from(document.querySelectorAll('style'));
    styleTags.forEach(style => {
      style.setAttribute('data-hidden-style', 'true'); // đánh dấu để restore
      if (isAdmin) style.disabled = true;
    });

    return () => {
      // Bật lại khi rời admin
      linkTags.forEach(link => link.disabled = false);
      styleTags.forEach(style => {
        if (style.getAttribute('data-hidden-style') === 'true') {
          style.disabled = false;
        }
      });
    };
  }, [location]);

  return null;
};

export default DisableAllCSS;
