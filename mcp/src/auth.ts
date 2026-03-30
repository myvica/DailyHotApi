import { z } from "zod";
import { config } from "dotenv";

// Load environment variables
config();

const API_KEY_ENV = "DAILYHOT_API_KEY";

const apiKeySchema = z.string().min(1, "API key cannot be empty");

/**
 * Get the configured API key from environment variable
 */
function getConfiguredApiKey(): string | undefined {
  return process.env[API_KEY_ENV];
}

/**
 * Validate an API key
 * @param apiKey - The API key to validate
 * @returns true if valid, false otherwise
 */
export function validateApiKey(apiKey: string | undefined): boolean {
  const configuredKey = getConfiguredApiKey();

  // If no API key is configured, all requests are allowed
  if (!configuredKey) {
    return true;
  }

  // If API key is required but not provided
  if (!apiKey) {
    return false;
  }

  // Validate the input using Zod
  const result = apiKeySchema.safeParse(apiKey);
  if (!result.success) {
    return false;
  }

  // Compare with configured key
  return apiKey === configuredKey;
}

/**
 * Require a valid API key - throws error if invalid
 * @param apiKey - The API key to validate
 * @throws {Error} with { error: "API key is required" } or { error: "Invalid API key" }
 */
export function requireApiKey(apiKey: string | undefined): void {
  const configuredKey = getConfiguredApiKey();

  // If no API key is configured, allow all requests
  if (!configuredKey) {
    return;
  }

  // If API key is required but not provided
  if (!apiKey) {
    const error = new Error("API key is required");
    (error as any).error = "API key is required";
    throw error;
  }

  // Validate the input using Zod
  const result = apiKeySchema.safeParse(apiKey);
  if (!result.success) {
    const error = new Error("Invalid API key");
    (error as any).error = "Invalid API key";
    throw error;
  }

  // Compare with configured key
  if (apiKey !== configuredKey) {
    const error = new Error("Invalid API key");
    (error as any).error = "Invalid API key";
    throw error;
  }
}
