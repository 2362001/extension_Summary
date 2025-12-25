let tooltip;

document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection) return;

    const text = selection.toString().trim();
    if (text.length < 30) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    tooltip?.remove();

    tooltip = document.createElement("div");
    tooltip.innerHTML = "⏳ Đang tóm tắt...";
    tooltip.style.position = "fixed";
    tooltip.style.top = `${rect.bottom + 8}px`;
    tooltip.style.left = `${rect.left}px`;
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

    chrome.runtime.sendMessage(
        { type: "SUMMARIZE", text },
        (res) => {
            tooltip.innerHTML = `<b>Tóm tắt:</b><br>${res.summary}`;
        }
    );
});
