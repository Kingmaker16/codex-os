import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths
const schemaPath = path.resolve(__dirname, "./schema.json");
const samplePath = path.resolve(__dirname, "../fixtures/sample_turn.json");

// Read files
if (!fs.existsSync(schemaPath)) {
  console.error("Schema file not found at:", schemaPath);
  process.exit(1);
}
if (!fs.existsSync(samplePath)) {
  console.error("Fixture not found at:", samplePath);
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(samplePath, "utf8"));

// Validate
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

console.log("→ Validating fixtures against contracts schema…");

if (validate(data)) {
  console.log("✓ All schemas valid.");
  process.exit(0);
} else {
  console.error("✗ Schema validation errors:");
  console.error(validate.errors);
  process.exit(1);
}
