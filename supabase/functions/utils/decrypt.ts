// Utility function for decrypting tokens
export async function decryptToken(encryptedToken: string, secretKey: string): Promise<string> {
  try {
    const decoder = new TextDecoder()
    
    // Decode base64
    const combined = new Uint8Array(
      atob(encryptedToken).split('').map(char => char.charCodeAt(0))
    )
    
    // Extract IV (first 12 bytes)
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    // Import the secret key
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secretKey),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )
    
    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )
    
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt token')
  }
}
