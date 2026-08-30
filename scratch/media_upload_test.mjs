import "dotenv/config";
import { getMediaFiles, uploadMediaFile, deleteMediaFile } from "../actions/media.ts";

async function testMediaUploadFlow() {
  console.log("==========================================");
  console.log("🖼️ TESTING MEDIA UPLOAD & PICKER FLOW");
  console.log("==========================================\n");

  const testFileContent = Buffer.from("fake-png-image-content-for-test");
  const testFile = new Blob([testFileContent], { type: "image/png" });

  const formData = new FormData();
  formData.append("file", testFile, "test-upload-picker.png");
  formData.append("folder", "content");

  console.log("1. Uploading media file...");
  const uploadRes = await uploadMediaFile(formData);
  console.log("Upload result:", uploadRes);

  if (!uploadRes.success || !uploadRes.data) {
    console.error("❌ Upload failed!");
    process.exit(1);
  }

  console.log("✅ Upload succeeded. File ID:", uploadRes.data.id, "URL:", uploadRes.data.url);

  console.log("2. Verifying getMediaFiles contains newly uploaded item...");
  const listRes = await getMediaFiles({ folder: "content", limit: 20 });
  const found = listRes.data.find(m => m.id === uploadRes.data.id);

  if (!found) {
    console.error("❌ File not found in getMediaFiles!");
    process.exit(1);
  }

  console.log("✅ File found in media library:", found.originalName);

  console.log("3. Cleaning up test file...");
  const delRes = await deleteMediaFile(uploadRes.data.id);
  console.log("Delete result:", delRes);

  if (delRes.success) {
    console.log("✅ Test file deleted cleanly!");
    console.log("\n==========================================");
    console.log("🎉 ALL MEDIA UPLOAD TESTS PASSED!");
    console.log("==========================================");
    process.exit(0);
  } else {
    console.error("❌ Delete failed!");
    process.exit(1);
  }
}

testMediaUploadFlow().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
