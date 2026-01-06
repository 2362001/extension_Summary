let tooltip;

document.addEventListener("mouseup", (e) => {
  // 1. Nếu click vào chính cái tooltip thì không làm gì cả (để người dùng có thể copy text trong đó)
  if (tooltip && tooltip.contains(e.target)) return;

  // 2. Xóa tooltip cũ nếu có khi click ra ngoài
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

  // 4. Tạo tooltip mới
  tooltip = document.createElement("div");
  tooltip.innerHTML = "⏳ Đang tóm tắt...";
  tooltip.style.position = "fixed";
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`; // Thêm window.scrollY để cố định đúng vị trí khi scroll
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.zIndex = 999999;
  tooltip.style.maxWidth = "320px";
  tooltip.style.background = "#111";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "10px 12px";
  tooltip.style.borderRadius = "8px";
  tooltip.style.fontSize = "13px";
  tooltip.style.lineHeight = "1.4";
  tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,.3)";

  document.body.appendChild(tooltip);

  chrome.runtime.sendMessage({ type: "SUMMARIZE", text }, (res) => {
    if (tooltip) {
      tooltip.innerHTML = `<b>Tóm tắt:</b><br>${res.summary}`;
    }
  });
});
