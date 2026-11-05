# Thời tiết Việt Nam

Ứng dụng React + TypeScript hiển thị thời tiết hiện tại và dự báo 7 ngày cho 8 thành phố Việt Nam. Dữ liệu được lấy trực tiếp từ [Open-Meteo](https://open-meteo.com/) — miễn phí, không cần API key.

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên.

```bash
npm install
npm run dev
```

Mở địa chỉ được in ra bởi Vite (thường là `http://localhost:5173`). Tạo bản build production bằng `npm run build`, xem thử bằng `npm run preview`.

## Tính năng

- Chọn một trong 8 thành phố; thành phố đang chọn được làm nổi bật.
- Thời tiết hiện tại: biểu tượng, mô tả, nhiệt độ, độ ẩm, tốc độ gió và thời điểm cập nhật.
- Dự báo 7 ngày: thứ/ngày, biểu tượng, nhiệt độ cao nhất và thấp nhất.
- Trạng thái ban đầu, đang tải, lỗi và nút thử lại.
- Chuyển °C / °F ngay trên dữ liệu đã tải, không gọi lại API.
- Tìm thành phố không phân biệt dấu; lưu thành phố yêu thích trong localStorage.
- Responsive: danh sách và dự báo xếp dọc trên màn hình nhỏ; bố cục hai cột từ 768px.

## API

Gọi Open-Meteo Forecast API với `current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`, `daily=weather_code,temperature_2m_max,temperature_2m_min`, múi giờ `Asia/Ho_Chi_Minh` và 7 ngày dự báo.
