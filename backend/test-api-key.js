"use strict";
// Test script to verify Gemini 2.0 Flash API key and endpoint
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function testGeminiAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        // Replace with your actual API key
        const API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";
        if (API_KEY === "YOUR_API_KEY_HERE") {
            console.log("❌ Please set your GEMINI_API_KEY environment variable or replace YOUR_API_KEY_HERE with your actual key");
            return;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
        const headers = {
            "Content-Type": "application/json"
        };
        const data = {
            contents: [
                {
                    parts: [
                        {
                            text: "Explain how AI works in a few words"
                        }
                    ]
                }
            ]
        };
        try {
            console.log("🚀 Testing Gemini 2.0 Flash API...");
            const response = yield fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            if (response.ok) {
                console.log("✅ API Key is valid!");
                const result = yield response.json();
                console.log("📝 Response:", (_e = (_d = (_c = (_b = (_a = result.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text);
            }
            else {
                console.log("❌ API Key might be invalid or expired.");
                console.log("Status Code:", response.status);
                const errorText = yield response.text();
                console.log("Response:", errorText);
            }
        }
        catch (error) {
            console.error("❌ Error testing API:", error);
        }
    });
}
testGeminiAPI();
