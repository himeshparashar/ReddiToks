import { GenerateVideoUseCase, createGenerateVideoUseCase } from "./src/application/usecases/GenerateVideoUseCase";

async function testVideoGeneration() {
  console.log("🎬 Testing Complete Video Generation Pipeline...\n");
  
  try {
    // Create the use case with all dependencies
    const generateVideoUseCase = createGenerateVideoUseCase();
    
    // Test with a Reddit URL (you can replace this with any valid Reddit post URL)
    const testRequest = {
      redditUrl: "https://www.reddit.com/r/AmItheAsshole/comments/example/test",
      background: "background-video.mp4",
      characters: ["narrator", "op", "commenter1"],
      options: {
        quality: "medium" as const,
        resolution: "1080p" as const,
      }
    };
    
    console.log("📝 Request details:");
    console.log(`- Reddit URL: ${testRequest.redditUrl}`);
    console.log(`- Background: ${testRequest.background}`);
    console.log(`- Characters: ${testRequest.characters.join(", ")}`);
    console.log(`- Quality: ${testRequest.options.quality}`);
    console.log(`- Resolution: ${testRequest.options.resolution}\n`);
    
    // Execute the video generation
    console.log("🚀 Starting video generation...\n");
    const result = await generateVideoUseCase.execute(testRequest);
    
    if (result.success) {
      console.log("✅ Video Generation Successful!");
      console.log(`📹 Video URL: ${result.videoUrl}`);
      console.log(`🆔 Script ID: ${result.scriptId}`);
      console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
      console.log(`⏱️  Processing Time: ${Math.round((result.processingTime || 0) / 1000)}s`);
    } else {
      console.log("❌ Video Generation Failed!");
      console.log(`Error: ${result.error}`);
      console.log(`⏱️  Processing Time: ${result.processingTime}ms`);
    }
    
  } catch (error) {
    console.error("💥 Unexpected error during video generation:", error);
  }
}

// Run the test
testVideoGeneration();
