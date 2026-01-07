// Token has been removed for security reasons
const API_URL = "http://localhost:5050/api/summarize";

async function testSummarize() {
  const text =
    "Mô hình mt5-small là một phiên bản đa ngôn ngữ của mô hình T5 do Google phát triển. Nó được huấn luyện trên tập dữ liệu khổng lồ bao gồm hơn 100 ngôn ngữ khác nhau, trong đó có tiếng Việt.";

  console.log("--- Đang gọi Router HuggingFace ---");
  console.log("URL:", MODEL_URL);

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

    const textRes = await response.text();
    console.log("Phản hồi thô:", textRes);

    try {
      const data = JSON.parse(textRes);
      const result = Array.isArray(data)
        ? data[0].generated_text
        : data.generated_text;

      if (data.error) {
        console.log("Lỗi từ API:", data.error);
      } else {
        console.log("Kết quả tóm tắt:", result);
      }
    } catch (e) {
      console.log("Không thể parse JSON phản hồi.");
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error.message);
  }
}

testSummarize();
