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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const snoowrap_1 = __importDefault(require("snoowrap"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const reddit = new snoowrap_1.default({
    userAgent: process.env.REDDIT_USER_AGENT || '',
    clientId: process.env.REDDIT_CLIENT_ID || '',
    clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
    username: process.env.REDDIT_USERNAME || '',
    password: process.env.REDDIT_PASSWORD || '',
});
const fetchRedditPost = (postId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield reddit.getSubmission(postId).fetch();
        console.log("Post Title:", post.title);
        console.log("Post Body:", post.selftext);
        // Force TypeScript to treat comments as 'any[]'
        const comments = (yield post.comments);
        console.log("\nComments:");
        comments.forEach((comment) => {
            console.log("- ", comment.body);
        });
    }
    catch (error) {
        console.error("Error fetching Reddit post:", error);
    }
});
fetchRedditPost('1laprvj');
