import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const schemaDirectory = new URL("../schemas/", import.meta.url);
const filenames = (await readdir(schemaDirectory))
  .filter((filename) => filename.endsWith(".json"))
  .sort();

assert.ok(filenames.length > 0, "No JSON schema files were found.");

for (const filename of filenames) {
  const fileUrl = new URL(filename, schemaDirectory);
  const source = await readFile(fileUrl, "utf8");

  let schema;

  try {
    schema = JSON.parse(source);
  } catch (error) {
    throw new Error(`${filename} contains invalid JSON: ${error.message}`);
  }

  assert.equal(
    typeof schema,
    "object",
    `${filename} must contain a JSON object.`
  );

  assert.ok(
    typeof schema.$schema === "string",
    `${filename} must declare $schema.`
  );

  assert.equal(
    schema.type,
    "object",
    `${filename} must define an object schema.`
  );

  assert.ok(
    schema.properties && typeof schema.properties === "object",
    `${filename} must define properties.`
  );

  assert.ok(
    Array.isArray(schema.required),
    `${filename} must define its required properties.`
  );

  for (const requiredProperty of schema.required) {
    assert.ok(
      Object.hasOwn(schema.properties, requiredProperty),
      `${filename}: required property "${requiredProperty}" is undefined.`
    );
  }

  console.log(`Validated ${path.basename(filename)}`);
}

console.log(`Validated ${filenames.length} schema file(s).`);