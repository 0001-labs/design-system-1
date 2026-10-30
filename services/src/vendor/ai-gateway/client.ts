/** Backend-only transports. Provider credentials live in System, never in this client. */
export const AI_ORIGIN = 'https://system.0001.dev/api/ai';
export const ANTHROPIC_URL = AI_ORIGIN + '/anthropic/v1/messages';
export const TYPESAFE_URL = AI_ORIGIN + '/typesafe/v1/systemone';
export interface GatewayEnv { SYSTEM_AI_TOKEN?: string }
export function anthropicGateway(apiKey: string) { return { apiKey, baseURL: AI_ORIGIN + '/anthropic' }; }
