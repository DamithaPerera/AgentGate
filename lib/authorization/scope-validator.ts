// Validates that requested scopes are a subset of agent's declared capabilities

export function validateScope(
  requestedScopes: string[],
  agentCapabilities: string[],
  parentScopes?: string[]
): { valid: boolean; reason?: string } {
  const availableScopes = parentScopes ?? agentCapabilities;

  for (const scope of requestedScopes) {
    const [service, action] = scope.split('.');
    const hasExact = availableScopes.includes(scope);
    const hasWildcard = availableScopes.includes(`${service}.*`);

    if (!hasExact && !hasWildcard) {
      return {
        valid: false,
        reason: `Scope '${scope}' is not within agent's declared capabilities`,
      };
    }
  }

  return { valid: true };
}

export function narrowScopes(
  requestedScopes: string[],
  parentScopes: string[]
): string[] {
  return requestedScopes.filter(scope => {
    const [service] = scope.split('.');
    return (
      parentScopes.includes(scope) || parentScopes.includes(`${service}.*`)
    );
  });
}
