export function maskToken(token) {
    const trimmed = token.trim();
    if (trimmed.length <= 4) {
        return trimmed;
    }
    return `****${trimmed.slice(-4)}`;
}
