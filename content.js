let tooltip;

document.addEventListener("mouseup", (e) => {
  // 1. Kiểm tra nếu đang click vào tooltip hoặc các thành phần con của nó
  if (tooltip && tooltip.contains(e.target)) {
    // Nếu click vào nút X (close-btn)
    if (e.target.classList.contains("summary-close-btn")) {
      tooltip.remove();
      tooltip = null;
    }
    return;
  }

  // 2. Click ra ngoài thì xóa tooltip cũ
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }

  // 3. Kiểm tra bôi đen mới
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const text = selection.toString().trim();
  if (text.length < 30) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // 4. Tạo tooltip mới với cấu trúc có nút Close
  tooltip = document.createElement("div");
  tooltip.className = "summary-extension-tooltip";

  // Style cho container chính
  Object.assign(tooltip.style, {
    position: "fixed",
    top: `${rect.bottom + window.scrollY + 10}px`,
    left: `${rect.left + window.scrollX}px`,
    zIndex: "999999",
    maxWidth: "350px",
    minWidth: "200px",
    background: "#1e1e1e",
    color: "#ffffff",
    padding: "20px 15px 15px 15px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    fontFamily: "sans-serif",
    border: "1px solid #333",
  });

  // Nút đóng (X)
  const closeBtn = document.createElement("div");
  closeBtn.innerHTML = "&times;";
  closeBtn.className = "summary-close-btn";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "5px",
    right: "10px",
    cursor: "pointer",
    fontSize: "20px",
    color: "#888",
    fontWeight: "bold",
    transition: "color 0.2s",
  });
  closeBtn.onmouseover = () => (closeBtn.style.color = "#fff");
  closeBtn.onmouseout = () => (closeBtn.style.color = "#888");

  // Phần nội dung
  const content = document.createElement("div");
  content.className = "summary-content";
  content.innerHTML = "<i>⏳ Đang tóm tắt nội dung...</i>";

  tooltip.appendChild(closeBtn);
  tooltip.appendChild(content);
  document.body.appendChild(tooltip);

  // 5. Gọi API
  chrome.runtime.sendMessage({ type: "SUMMARIZE", text }, (res) => {
    if (tooltip && content) {
      if (res && res.summary) {
        // Render markdown-like (thay đổi xuống dòng thành <br>)
        const formattedSummary = res.summary.replace(/\n/g, "<br>");
        content.innerHTML = `<b style="color: #4facfe;">Tóm tắt:</b><br>${formattedSummary}`;
      } else {
        content.innerHTML =
          "<span style='color: #ff4b2b;'>Lỗi: Không thể lấy dữ liệu tóm tắt.</span>";
      }
    }
  });
});
