# Thiệp mời thôi nôi – The First Chapter

## Cấu trúc
```
├── assets/
│   ├── fonts/      font tự host (nếu dùng @font-face)
│   ├── images/     ảnh thiệp
│   ├── js/         anime.min.js (animejs 3.2.2) + main.js
│   └── scss/       style.scss
├── dist/           CSS đã biên dịch (style.css)
├── .gitignore
├── readme.md
└── thiepmoi.html
```

## Biên dịch SCSS (thủ công)
Cần cài sass một lần: `npm install -g sass`

```bash
sass assets/scss/style.scss dist/style.css --no-source-map
# hoặc tự động khi lưu file:
sass assets/scss/style.scss dist/style.css --no-source-map --watch
```

## Ghi chú
- Ô ảnh để trống là các thẻ `.ph` (nhãn trong `data-label`), thay bằng `<img>` từ `assets/images/`.
- Ngày đếm ngược: thuộc tính `data-date` của `#countdown` trong `thiepmoi.html`.
- Chỗ gửi form RSVP: tìm `TODO` trong `assets/js/main.js`.
