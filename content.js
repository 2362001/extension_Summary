let tooltip;
let pendingSummary = null;
let lastSelection = "";

// Hàm tạo và hiển thị tooltip
function showTooltip(rect, initialContent) {
  if (tooltip) tooltip.remove();

  tooltip = document.createElement("div");
  tooltip.className = "summary-extension-tooltip";

  // Thiết lập style cơ bản trước (opacity 0 để đo kích thước)
  Object.assign(tooltip.style, {
    position: "fixed",
    zIndex: "999999",
    maxWidth: "350px",
    minWidth: "220px",
    background: "#1e1e1e",
    color: "#ffffff",
    padding: "20px 15px 15px 15px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    fontFamily: "sans-serif",
    border: "1px solid #333",
    visibility: "hidden", // Ẩn để đo
    pointerEvents: "none",
  });

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
  });
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    tooltip.remove();
    tooltip = null;
  };

  const content = document.createElement("div");
  content.className = "summary-content";
  content.innerHTML = initialContent;

  tooltip.appendChild(closeBtn);
  tooltip.appendChild(content);
  document.body.appendChild(tooltip);

  // Tính toán vị trí đứng NGAY TRÊN đoạn text
  const tooltipHeight = tooltip.offsetHeight;
  let finalTop = rect.top - tooltipHeight - 12; // Cách bên trên đoạn bôi đen 12px
  let finalLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2; // Căn giữa theo chiều ngang đoạn bôi đen

  // Xử lý nếu bị tràn màn hình bên trên
  if (finalTop < 10) {
    finalTop = rect.bottom + 12; // Nếu không đủ chỗ bên trên thì nhảy xuống dưới
  }

  // Xử lý nếu bị tràn lề trái/phải
  if (finalLeft < 10) finalLeft = 10;
  if (finalLeft + tooltip.offsetWidth > window.innerWidth - 10) {
    finalLeft = window.innerWidth - tooltip.offsetWidth - 10;
  }

  // Cập nhật vị trí cuối cùng và hiển thị
  Object.assign(tooltip.style, {
    top: `${finalTop}px`,
    left: `${finalLeft}px`,
    visibility: "visible",
    pointerEvents: "auto",
  });

  return content;
}

document.addEventListener("mouseup", (e) => {
  // 1. Click vào tooltip thì bỏ qua
  if (tooltip && tooltip.contains(e.target)) return;

  // 2. Click ra ngoài thì tắt tooltip
  if (tooltip) {
    tooltip.remove();
    tooltip = null;
  }

  // 3. Lấy text bôi đen
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length < 30) {
    pendingSummary = null;
    lastSelection = "";
    return;
  }

  // Nếu bôi đen đoạn mới, bắt đầu tóm tắt ngầm ngay
  if (text !== lastSelection) {
    lastSelection = text;
    pendingSummary = {
      status: "loading",
      rect: selection.getRangeAt(0).getBoundingClientRect(),
    };

    chrome.runtime.sendMessage({ type: "SUMMARIZE", text }, (res) => {
      if (lastSelection === text) {
        // Đảm bảo vẫn là đoạn text đó
        pendingSummary = {
          status: "ready",
          summary: res && res.summary ? res.summary : null,
          rect: pendingSummary.rect,
        };
        // Nếu lúc này người dùng đã nhấn Shift trước đó mà đang đợi tải
        if (
          tooltip &&
          tooltip
            .querySelector(".summary-content")
            .innerHTML.includes("Đang tải")
        ) {
          updateTooltipContent();
        }
      }
    });
  }
});

function updateTooltipContent() {
  if (!tooltip || !pendingSummary || pendingSummary.status !== "ready") return;
  const content = tooltip.querySelector(".summary-content");
  if (pendingSummary.summary) {
    const formatted = pendingSummary.summary.replace(/\n/g, "<br>");
    content.innerHTML = `<b style="color: #4facfe;">Tóm tắt:</b><br>${formatted}`;
  } else {
    content.innerHTML =
      "<span style='color: #ff4b2b;'>Lỗi: Không thể lấy dữ liệu.</span>";
  }
}

// Lắng nghe phím Shift
document.addEventListener("keydown", (e) => {
  if (e.key === "Shift" && lastSelection && !tooltip) {
    const selection = window.getSelection();
    const currentText = selection.toString().trim();

    // Chỉ mở popup nếu text đang bôi đen khớp với text đã gửi đi tóm tắt ngầm
    if (currentText === lastSelection) {
      const rect = selection.getRangeAt(0).getBoundingClientRect();

      if (pendingSummary && pendingSummary.status === "ready") {
        const contentDiv = showTooltip(rect, "");
        const formatted = pendingSummary.summary.replace(/\n/g, "<br>");
        contentDiv.innerHTML = `<b style="color: #4facfe;">Tóm tắt:</b><br>${formatted}`;
      } else {
        // Popup vẫn hiện ra ngay khi bấm Shift, thông báo đang tải
        showTooltip(
          rect,
          "<i>⏳ Đang tải bản tóm tắt (đã bắt đầu khi bạn bôi đen)...</i>"
        );
      }
    }
  }
});
