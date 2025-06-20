"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LLMService_1 = require("./src/application/services/LLMService");
// Mock data for testing
const mockRedditData = {
    title: "AITA for telling my roommate that her cooking smells terrible?",
    url: "https://reddit.com/r/AmItheAsshole/comments/test",
    author: "TestUser123",
    content: "So I (22F) live with my roommate Sarah (23F) in a small apartment. She loves to cook these really exotic dishes with strong spices, and honestly, the smell is overwhelming. It fills the entire apartment and sometimes makes me feel nauseous. Yesterday I finally told her that her cooking smells terrible and asked if she could cook less pungent food. She got really upset and said I was being culturally insensitive. AITA?",
    comments: [
        {
            author: "RedditWisdom",
            content: "NTA - You have a right to feel comfortable in your own home. Maybe you could suggest she use the kitchen fan or cook when you're not around?",
            upvotes: 245,
            depth: 0,
        },
        {
            author: "CookingExpert",
            content: "YTA - You could have approached this more diplomatically. Food is often tied to culture and identity.",
            upvotes: 156,
            depth: 0,
        }
    ],
    upvotes: 1547,
    subreddit: "AmItheAsshole"
};
function testLLMService() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Testing LLM Service with Gemini Flash 1.5...\n');
        try { // Test with a dummy API key (will fall back to mock)
            const llmService = new LLMService_1.LLMService("test-key", "gemini-2.0-flash");
            console.log('📝 Generating script from Reddit thread...');
            const script = yield llmService.generateStructuredScript(mockRedditData);
            console.log('✅ Script generated successfully!\n');
            console.log('📋 Script Details:');
            console.log(`- ID: ${script.id}`);
            console.log(`- Background: ${script.background}`);
            console.log(`- Characters: ${script.characters.join(', ')}`);
            console.log(`- Number of dialogue lines: ${script.lines.length}\n`);
            console.log('🎭 Dialogue Lines:');
            script.lines.forEach((line, index) => {
                console.log(`${index + 1}. ${line.speaker}: "${line.text}"`);
            });
        }
        catch (error) {
            console.error('❌ Error testing LLM service:', error);
        }
    });
}
// Run the test
testLLMService();
