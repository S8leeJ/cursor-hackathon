import { createAzure } from "@ai-sdk/azure";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * Azure AI Foundry resource used by CodeEcho.
 * Set OPENAI_BASE_URL to this (or leave the path suffix off) to route chat + embeddings there.
 */
export const CODEECHO_AZURE_ENDPOINT =
  "https://codeecho-resource.services.ai.azure.com";

type ChatModel = ReturnType<ReturnType<typeof createOpenAI>["chat"]>;
type EmbeddingModel = ReturnType<ReturnType<typeof createOpenAI>["embedding"]>;

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function configuredBaseURL(): string | undefined {
  return (
    readEnv("OPENAI_BASE_URL") ??
    readEnv("AZURE_OPENAI_ENDPOINT") ??
    readEnv("AZURE_BASE_URL")
  );
}

function configuredApiKey(): string | undefined {
  return (
    readEnv("OPENAI_API_KEY") ??
    readEnv("AZURE_API_KEY") ??
    readEnv("AZURE_OPENAI_API_KEY")
  );
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
 * end at `/openai` (not `/openai/v1`). Accept the bare resource host too.
 */
function normalizeAzureOpenAIBaseURL(endpoint: string): string {
  const trimmed = endpoint.replace(/\/+$/, "");
  if (trimmed.endsWith("/openai/v1")) {
    return trimmed.slice(0, -"/v1".length);
  }
  if (trimmed.endsWith("/openai")) {
    return trimmed;
  }
  // e.g. https://codeecho-resource.services.ai.azure.com
  return `${trimmed}/openai`;
}

function chatDeployment(): string {
  return (
    readEnv("OPENAI_CHAT_MODEL") ??
    readEnv("AZURE_OPENAI_DEPLOYMENT") ??
    "gpt-4o-mini"
  );
}

function embeddingDeployment(): string {
  return (
    readEnv("OPENAI_EMBEDDING_MODEL") ??
    readEnv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT") ??
    "text-embedding-3-small"
  );
}

/** Chat model — OpenAI by default, or Azure when OPENAI_BASE_URL points at Azure. */
export function getChatModel(): ChatModel {
  const baseURL = configuredBaseURL();
  const apiKey = configuredApiKey();
  const modelId = chatDeployment();

  if (baseURL && isAzureEndpoint(baseURL)) {
    const azure = createAzure({
      baseURL: normalizeAzureOpenAIBaseURL(baseURL),
      apiKey,
    });
    return azure.chat(modelId) as ChatModel;
  }

  const openai = createOpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return openai.chat(modelId);
}

/** Embedding model — same provider selection as chat. */
export function getEmbeddingModel(): EmbeddingModel {
  const baseURL = configuredBaseURL();
  const apiKey = configuredApiKey();
  const modelId = embeddingDeployment();

  if (baseURL && isAzureEndpoint(baseURL)) {
    const azure = createAzure({
      baseURL: normalizeAzureOpenAIBaseURL(baseURL),
      apiKey,
    });
    return azure.embedding(modelId) as EmbeddingModel;
  }

  const openai = createOpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });
  return openai.embedding(modelId);
}
