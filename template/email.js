module.exports = {
  templateEmail: function templateEmail(subtitle, button, title, content, link) {
    return `
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <style>
        /* Reset mặc định */
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          background: #f3f4f6;
          font-family: 'Arial', sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e0e0e0;
        }
        .logo {
          width: 120px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 26px;
          font-weight: bold;
          color: #333;
        }
        .subtitle {
          font-size: 18px;
          color: #555;
          margin-bottom: 20px;
        }
        p {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          padding: 14px 26px;
          margin: 20px 0;
          font-size: 18px;
          color: #fff;
          background: linear-gradient(135deg, #ff416c, #ff4b2b);
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
          transition: 0.3s;
          box-shadow: 0 4px 8px rgba(255, 75, 43, 0.3);
        }
        .button:hover {
          background: linear-gradient(135deg, #ff4b2b, #ff416c);
          transform: scale(1.05);
        }
        .footer {
          margin-top: 25px;
          font-size: 14px;
          color: #888;
        }
        .social-icons {
          margin-top: 20px;
        }
        .social-icons img {
          width: 32px;
          margin: 0 8px;
          opacity: 0.8;
          transition: 0.3s;
        }
        .social-icons img:hover {
          opacity: 1;
          transform: scale(1.1);
        }
		 .header {
          background-color: #4CAF50;
          color: #ffffff;
          font-size: 22px;
          font-weight: bold;
          padding: 15px;
          text-align: center;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
		.logo {
		  width: 120px;
		  display: block;
		   margin: -20px -20px -15px auto; 
		}

      </style>
    </head>
    <body>
      <div class="container">
	  <img src="http://dating.leducanh.name.vn/img/dadder_logo.png" alt="Logo" class="logo">
      <div class="header">${title}</div>
        <p class="subtitle">${subtitle}</p>
        <p>${content}</p>
        <a href="${link}" class="button">${button}</a>
        <div class="social-icons">
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png" alt="Facebook"></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733635.png" alt="Instagram"></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter"></a>
        </div>
        <p class="footer">Nếu bạn không yêu cầu email này, vui lòng bỏ qua. <br> &copy; 2025 Dadder. All Rights Reserved.</p>
      </div>
    </body>
    </html>
    `;
  }
};
