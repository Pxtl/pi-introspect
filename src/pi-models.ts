/**
 * Fetching of model/provider metadata from the pi runtime.
 *
 * The helpers here read model and provider metadata off the
 * ExtensionToolContext. They never expose credentials: only the resolved
 * request baseUrl is surfaced, never API keys, auth headers, or env values.
 */

import type { ExtensionToolContext } from "@earendil-works/pi-coding-agent";

/** `"provider/id"` label for the active model, if any. */
export function modelLabel(ctx: ExtensionToolContext): string | null {
  const model = ctx.model;
  return model ? `${model.provider}/${model.id}` : null;
}

/** Resolve the effective request baseUrl without exposing credentials. */
export async function resolvedRequestBaseUrl(ctx: ExtensionToolContext): Promise<string | undefined> {
  const model = ctx.model;
  if (!model) {
    return undefined;
  }

  try {
    const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
    return auth.ok ? auth.baseUrl : undefined;
  } catch {
    // Auth resolution is best-effort; the catalog baseUrl is still reported.
    return undefined;
  }
}

/**
 * Model metadata: identity, provider, limits, costs, and reasoning support.
 * Never includes API keys or auth headers.
 */
export async function modelInfo(ctx: ExtensionToolContext) {
  const model = ctx.model;
  if (!model) {
    return null;
  }

  const resolvedBaseUrl = await resolvedRequestBaseUrl(ctx);
  return {
    id: model.id,
    name: model.name,
    provider: model.provider,
    providerDisplayName: ctx.modelRegistry.getProviderDisplayName(model.provider),
    api: model.api,
    baseUrl: model.baseUrl,
    resolvedRequestBaseUrl: resolvedBaseUrl ?? null,
    reasoning: model.reasoning,
    thinkingLevelMap: model.thinkingLevelMap ?? null,
    contextWindow: model.contextWindow,
    maxTokens: model.maxTokens,
    input: model.input,
    cost: model.cost ?? null,
  };
}
