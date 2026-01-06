const API_URL = "https://api-summarry.onrender.com/api/summarize";

async function summarizeWithAI(text) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend error:", errorData);
      return `Lỗi: ${response.status} - ${
        errorData.message || "Không thể kết nối backend"
      }`;
    }

    const data = await response.json();

    if (data.summary) {
      return data.summary.trim();
    } else {
      console.error("Response lạ:", data);
      return "Không lấy được nội dung tóm tắt từ Backend.";
    }
  } catch (error) {
    console.error("Lỗi kết nối Backend:", error);
    return "Lỗi kết nối API (Hãy chắc chắn Backend đang chạy tại port 5050).";
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SUMMARIZE") {
    summarizeWithAI(msg.text).then((summary) => {
      sendResponse({ summary });
    });
    return true;
  }
});
