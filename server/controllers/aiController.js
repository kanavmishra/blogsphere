// Helper to call Gemini API using raw fetch
const callGemini = async (prompt, apiKey) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
};

// ==============================
// AI WRITING ASSISTANT
// ==============================
export const getAiSuggestions = async (req, res) => {
  try {
    const { prompt, type, currentContent } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        message: "Prompt is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Construct prompts based on request type
    let systemPrompt = "";
    if (type === "title") {
      systemPrompt = `Suggest 5 catchy, professional, SEO-friendly titles for a blog post based on this outline/topic: "${prompt}". Respond with just the list of titles separated by newlines. No extra conversational text.`;
    } else if (type === "outline") {
      systemPrompt = `Create a structured, detailed blog post outline with headings (H2, H3) based on this topic: "${prompt}". Use standard markdown headers.`;
    } else if (type === "improve") {
      systemPrompt = `Improve the grammar, clarity, and style of the following text: "${currentContent}". The user wants to: "${prompt}". Return only the improved text, no headers or chat explanations.`;
    } else {
      systemPrompt = `Generate blog content snippet or ideas based on: "${prompt}".`;
    }

    // Call API or use smart fallback
    if (apiKey) {
      try {
        const aiText = await callGemini(systemPrompt, apiKey);
        return res.status(200).json({ suggestion: aiText });
      } catch (err) {
        console.error("AI API call failed, falling back to simulation:", err.message);
      }
    }

    // High quality simulation fallback if no key or API fails
    let simulatedText = "";
    if (type === "title") {
      simulatedText = `1. Master ${prompt} in 2026: A Step-by-Step Guide\n` +
                      `2. Why Everyone is Talking About ${prompt} Right Now\n` +
                      `3. 5 Common Pitfalls of ${prompt} and How to Avoid Them\n` +
                      `4. The Future of Web Development: Unleashing the Power of ${prompt}\n` +
                      `5. Advanced Techniques in ${prompt}: From Novice to Pro`;
    } else if (type === "outline") {
      simulatedText = `## Introduction\n` +
                      `- Hook the reader\n` +
                      `- Brief overview of ${prompt}\n` +
                      `- Why this matters for modern developers\n\n` +
                      `## Core Concepts & Fundamentals\n` +
                      `- Key terms defined\n` +
                      `- How it works under the hood\n` +
                      `- Setting up your environment\n\n` +
                      `## Practical Walkthrough / Step-by-Step\n` +
                      `- Step 1: Initializing the project\n` +
                      `- Step 2: Implementation best practices\n` +
                      `- Step 3: Troubleshooting and optimization\n\n` +
                      `## Advanced Use Cases & Patterns\n` +
                      `- Integration with third-party tools\n` +
                      `- Scalability and performance considerations\n\n` +
                      `## Summary & Conclusion\n` +
                      `- Key takeaways\n` +
                      `- Next steps / Call to Action`;
    } else if (type === "improve") {
      const original = currentContent || "This is some rough draft text.";
      simulatedText = `Here is an enhanced version of your draft:\n\n` +
                      `"${original.trim()}" has been refined for better clarity, flow, and developer engagement. We recommend using active verbs and separating your core instructions into bullet points to maximize readability.`;
    } else {
      simulatedText = `Here are some ideas on "${prompt}":\n` +
                      `- Start by explaining the problem it solves.\n` +
                      `- Provide clear code snippets showing the contrast.\n` +
                      `- Conclude with performance benchmarks.`;
    }

    return res.status(200).json({
      suggestion: simulatedText,
      simulated: true,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
