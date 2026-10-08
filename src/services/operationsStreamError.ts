const publicMessages = new Set([
  "The model service could not be reached. Please try again.",
  "The model service took too long to respond. Please try again.",
  "The model service is rate limited. Please wait and try again.",
  "The model service access is unavailable. Please contact an administrator.",
  "The operations copilot could not complete this request. Please try again.",
]);

export class OperationsStreamFailure extends Error {}

export function publicOperationsStreamFailure(value: unknown, traceId?: string): OperationsStreamFailure | undefined {
  if (typeof value !== "string" || value.length > 400) return undefined;
  const reference = / Reference: ([0-9a-f-]{36})$/i.exec(value);
  if (reference && (!traceId || reference[1].toLowerCase() !== traceId.toLowerCase())) return undefined;
  const message = reference ? value.slice(0, reference.index) : value;
  return publicMessages.has(message) ? new OperationsStreamFailure(message) : undefined;
}
