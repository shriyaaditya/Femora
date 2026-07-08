import forge from 'node-forge';
import { Buffer } from 'buffer';

const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH  = 12; // GCM standard

/** Convert the base-64 key from env into a binary string */
const getKey = (): string => {
  const b64 = process.env.ENCRYPTION_KEY_BASE64 ?? '';
  const buf = Buffer.from(b64, 'base64');
  if (buf.length !== KEY_LENGTH) {
    throw new Error('Invalid encryption key length - must be 32 bytes');
  }
  return buf.toString('binary'); 
};

/** Encrypt a Base64-encoded image and return a Base64-encoded ciphertext */
export const encryptImage = (imageBase64: string): string => {
  const key = getKey();
  
  // Generate a random 12-byte IV
  const iv = forge.random.getBytesSync(IV_LENGTH);
  
  // Decode base64 input to binary string
  const plainText = Buffer.from(imageBase64, 'base64').toString('binary');

  // Create AES-GCM cipher
  const cipher = forge.cipher.createCipher('AES-GCM', key);
  cipher.start({ iv: iv });
  cipher.update(forge.util.createBuffer(plainText, 'binary'));
  cipher.finish();

  const ciphertext = cipher.output.getBytes();
  const tag = cipher.mode.tag.getBytes();

  // Structure: [IV (12)] + [Ciphertext] + [Auth Tag (16)]
  const payloadStr = iv + ciphertext + tag;
  
  return Buffer.from(payloadStr, 'binary').toString('base64');
};

/** Decrypt (if you ever need it on the client) */
export const decryptImage = (encryptedBase64: string): string => {
  const key = getKey();
  
  const data = Buffer.from(encryptedBase64, 'base64').toString('binary');
  
  const iv = data.substring(0, IV_LENGTH);
  const tag = data.substring(data.length - 16);
  const ciphertext = data.substring(IV_LENGTH, data.length - 16);

  const decipher = forge.cipher.createDecipher('AES-GCM', key);
  decipher.start({
    iv: iv,
    tag: forge.util.createBuffer(tag, 'binary')
  });
  decipher.update(forge.util.createBuffer(ciphertext, 'binary'));
  const pass = decipher.finish();

  if (!pass) {
    throw new Error('Decryption failed - auth tag mismatch');
  }

  return Buffer.from(decipher.output.getBytes(), 'binary').toString('base64');
};
