// Test script to verify Gemini 2.0 Flash API key and endpoint

async function testGeminiAPI() {
  // Replace with your actual API key
  const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";

  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.log(
      "❌ Please set your GEMINI_API_KEY environment variable or replace YOUR_API_KEY_HERE with your actual key"
    );
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    contents: [
      {
        parts: [
          {
            text: "Explain how AI works in a few words",
          },
        ],
      },
    ],
  };

  try {
    console.log("🚀 Testing Gemini 2.0 Flash API...");

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log("✅ API Key is valid!");
      const result = await response.json();
      console.log(
        "📝 Response:",
        result.candidates?.[0]?.content?.parts?.[0]?.text
      );
    } else {
      console.log("❌ API Key might be invalid or expired.");
      console.log("Status Code:", response.status);
      const errorText = await response.text();
      console.log("Response:", errorText);
    }
  } catch (error) {
    console.error("❌ Error testing API:", error);
  }
}

testGeminiAPI();
