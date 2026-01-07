document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleExtension");
  const statusLabel = document.getElementById("statusLabel");

  // Lấy trạng thái hiện tại từ storage
  chrome.storage.local.get(["isEnabled"], (result) => {
    // Mặc định là true nếu chưa lưu bao giờ
    const isEnabled = result.isEnabled !== false;
    toggle.checked = isEnabled;
    statusLabel.textContent = isEnabled ? "Đang bật" : "Đang tắt";
  });

  // Lắng nghe sự kiện thay đổi
  toggle.addEventListener("change", () => {
    const isEnabled = toggle.checked;
    chrome.storage.local.set({ isEnabled: isEnabled }, () => {
      statusLabel.textContent = isEnabled ? "Đang bật" : "Đang tắt";

      // Tùy chọn: Gửi tin nhắn đến content script để áp dụng ngay lập tức nếu cần
      // Nhưng ở đây chúng ta sẽ kiểm tra mỗi khimouseup/keydown nên không cần gửi ngay.
    });
  });
});
