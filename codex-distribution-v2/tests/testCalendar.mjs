import axios from "axios";

const BASE_URL = "http://localhost:5301";

async function testCalendar() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 TESTING: Calendar Generation");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Generate Weekly Calendar
  let calendarId;
  try {
    console.log("Test 1: Generate Weekly Calendar");
    const response = await axios.post(`${BASE_URL}/distribution/calendar`, {
      platforms: ["tiktok", "youtube", "instagram"],
      languages: ["en", "es", "ar"]
    });
    if (response.data.ok && response.data.calendar) {
      calendarId = response.data.calendar.id;
      const slotCount = response.data.calendar.slots.length;
      console.log(`✅ PASSED - Calendar created with ${slotCount} slots\n`);
      passed++;
    } else {
      console.log("❌ FAILED - Calendar generation failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Calendar error:", error.message, "\n");
    failed++;
  }

  // Test 2: Get Calendar Slots
  try {
    console.log("Test 2: Get Calendar Slots");
    const response = await axios.get(`${BASE_URL}/distribution/slots?calendarId=${calendarId}`);
    if (response.data.ok && response.data.slots) {
      console.log(`✅ PASSED - Retrieved ${response.data.slots.length} slots\n`);
      passed++;
    } else {
      console.log("❌ FAILED - Slot retrieval failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Slots error:", error.message, "\n");
    failed++;
  }

  // Test 3: Filter Slots by Platform
  try {
    console.log("Test 3: Filter Slots by Platform");
    const response = await axios.get(`${BASE_URL}/distribution/slots?calendarId=${calendarId}&platform=tiktok`);
    if (response.data.ok && response.data.slots) {
      const tiktokSlots = response.data.slots.filter(s => s.platform === "tiktok");
      console.log(`✅ PASSED - Found ${tiktokSlots.length} TikTok slots\n`);
      passed++;
    } else {
      console.log("❌ FAILED - Platform filter failed\n");
      failed++;
    }
  } catch (error) {
    console.log("❌ FAILED - Filter error:", error.message, "\n");
    failed++;
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(failed > 0 ? 1 : 0);
}

testCalendar();
