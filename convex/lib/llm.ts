import { createAzure } from "@ai-sdk/azure";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";
import type { EmbeddingModel } from "ai";

/**
 * Azure AI Foundry — embeddings (CodeEcho).
 * Set OPENAI_BASE_URL to this (or leave the path suffix off).
 */
export const CODEECHO_AZURE_ENDPOINT =
  "https://codeecho-resource.services.ai.azure.com";

/**
 * Azure AI Foundry — chat via Responses API (OptiPrime).
 * Default chat base; override with OPENAI_CHAT_BASE_URL.
 */
export const OPTIPRIME_AZURE_ENDPOINT =
  "https://optiprimeai-resource.services.ai.azure.com";

type ChatModel = LanguageModelV3;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function isAzureEndpoint(url: string): boolean {
  return (
    url.includes("services.ai.azure.com") ||
    url.includes("openai.azure.com") ||
    url.includes("cognitiveservices.azure.com")
  );
}

/**
 * `@ai-sdk/azure` resolves requests as `{baseURL}/v1{path}`, so the base must
 * end at `/openai` (not `/openai/v1` or `/openai/v1/responses`). Accept the
 * bare resource host too.
 */
function normalizeAzureOpenAIBaseURL(endpoint: string): string {
  const trimmed = endpoint.replace(/\/+$/, "");
  // Full Responses path pasted as base — strip down to /openai
  if (trimmed.endsWith("/openai/v1/responses")) {
    return trimmed.slice(0, -"/v1/responses".length);
  }
  if (trimmed.endsWith("/openai/v1")) {
    return trimmed.slice(0, -"/v1".length);
  }
  if (trimmed.endsWith("/openai")) {
    return trimmed;
  }
  return `${trimmed}/openai`;
}

function chatBaseURL(): string {
  return (
    readEnv("OPENAI_CHAT_BASE_URL") ??
    readEnv("AZURE_CHAT_ENDPOINT") ??
    OPTIPRIME_AZURE_ENDPOINT
  );
}

function chatApiKey(): string | undefined {
  return readEnv("OPENAI_CHAT_API_KEY") ?? readEnv("AZURE_CHAT_API_KEY");
}

function chatDeployment(): string {
  return (
    readEnv("OPENAI_CHAT_MODEL") ??
    readEnv("AZURE_OPENAI_DEPLOYMENT") ??
    "gpt-4o-mini"
  );
}

function embeddingBaseURL(): string | undefined {
  return (
    readEnv("OPENAI_BASE_URL") ??
    readEnv("AZURE_OPENAI_ENDPOINT") ??
    readEnv("AZURE_BASE_URL")
  );
}

function embeddingApiKey(): string | undefined {
  return (
    readEnv("OPENAI_API_KEY") ??
    readEnv("AZURE_API_KEY") ??
    readEnv("AZURE_OPENAI_API_KEY")
  );
}

function embeddingDeployment(): string {
  return (
    readEnv("OPENAI_EMBEDDING_MODEL") ??
    readEnv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT") ??
    "text-embedding-3-small"
  );
}

/**
 * Chat model — OptiPrime Azure Responses API by default (separate key from embeddings).
 * Falls back to public OpenAI Responses if the chat base URL is not Azure.
 */
export function getChatModel(): ChatModel {
  const baseURL = chatBaseURL();
  const apiKey = chatApiKey();
  const modelId = chatDeployment();

  if (!apiKey) {
    throw new Error(
      "Missing OPENAI_CHAT_API_KEY (OptiPrime chat key). Set it with: npx convex env set OPENAI_CHAT_API_KEY <key>",
    );
  }

  if (isAzureEndpoint(baseURL)) {
    const azure = createAzure({
      baseURL: normalizeAzureOpenAIBaseURL(baseURL),
      apiKey,
    });
    // Hits {base}/v1/responses — matches OptiPrime's Responses endpoint.
    return azure.responses(modelId);
  }

  const openai = createOpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return openai.responses(modelId);
}

/** Embedding model — CodeEcho / OPENAI_BASE_URL + OPENAI_API_KEY (not the chat key). */
export function getEmbeddingModel(): EmbeddingModel {
  const baseURL = embeddingBaseURL();
  const apiKey = embeddingApiKey();
  const modelId = embeddingDeployment();

  if (baseURL && isAzureEndpoint(baseURL)) {
    const azure = createAzure({
      baseURL: normalizeAzureOpenAIBaseURL(baseURL),
      apiKey,
    });
    return azure.embedding(modelId);
  }

  const openai = createOpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return openai.embedding(modelId);
}
