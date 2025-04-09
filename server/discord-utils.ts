import crypto from 'crypto';

// Verify Discord interaction signatures
export function verifyDiscordInteraction(
  publicKey: string,
  signature: string,
  timestamp: string,
  body: string
): boolean {
  try {
    const timestampBody = timestamp + body;
    const signatureBuffer = Buffer.from(signature, 'hex');
    const publicKeyBuffer = Buffer.from(publicKey, 'hex');
    
    return crypto.verify(
      'ed25519',
      Buffer.from(timestampBody),
      publicKeyBuffer,
      signatureBuffer
    );
  } catch (error) {
    console.error('Error verifying Discord interaction:', error);
    return false;
  }
}
