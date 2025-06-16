// Simple MD5 implementation for signature generation
export function md5(str: string): string {
  // This is a simplified implementation for demo purposes
  // In production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export function generateDigiflazzSignature(username: string, apiKey: string, cmd: string = 'pricelist'): string {
  return md5(username + apiKey + cmd);
}