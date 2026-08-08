/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chat from "../chat.js";
import type * as chatHelpers from "../chatHelpers.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_fingerprint from "../lib/fingerprint.js";
import type * as lib_llm from "../lib/llm.js";
import type * as lib_matchingAgent from "../lib/matchingAgent.js";
import type * as lib_matchingTools from "../lib/matchingTools.js";
import type * as lib_peopleRag from "../lib/peopleRag.js";
import type * as lib_validators from "../lib/validators.js";
import type * as matching from "../matching.js";
import type * as peopleIndex from "../peopleIndex.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  chatHelpers: typeof chatHelpers;
  "lib/auth": typeof lib_auth;
  "lib/fingerprint": typeof lib_fingerprint;
  "lib/llm": typeof lib_llm;
  "lib/matchingAgent": typeof lib_matchingAgent;
  "lib/matchingTools": typeof lib_matchingTools;
  "lib/peopleRag": typeof lib_peopleRag;
  "lib/validators": typeof lib_validators;
  matching: typeof matching;
  peopleIndex: typeof peopleIndex;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
