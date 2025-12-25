function summarizeLocal(text, maxSentences = 3) {
    const cleanText = text
        .replace(/\s+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

    const sentences = cleanText.match(/[^.!?]+[.!?]?/g);
    if (!sentences || sentences.length <= maxSentences) {
        return cleanText;
    }

    const stopWords = new Set([
        "là", "và", "của", "có", "cho", "một", "những", "các", "được", "trong",
        "khi", "đến", "với", "về", "the", "is", "are", "to", "of", "and", "in"
    ]);

    const wordFreq = {};
    cleanText
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .split(" ")
        .forEach(word => {
            if (!stopWords.has(word) && word.length > 2) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });

    const scored = sentences.map(sentence => {
        const words = sentence
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "")
            .split(" ");

        let score = 0;
        words.forEach(w => {
            if (wordFreq[w]) score += wordFreq[w];
        });

        return { sentence: sentence.trim(), score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, maxSentences)
        .map(s => "• " + s.sentence)
        .join("<br>");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "SUMMARIZE") {
        const summary = summarizeLocal(msg.text, 3);
        sendResponse({ summary });
    }
});
