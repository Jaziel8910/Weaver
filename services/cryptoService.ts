const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Helper to convert ArrayBuffer to Base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert Base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// Derives a key from a password using PBKDF2
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
};

// Encrypts data with a password
export const encrypt = async (data: string, password: string): Promise<string> => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);

    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        key,
        textEncoder.encode(data)
    );

    // Combine salt, iv, and encrypted data into one string for storage
    const saltB64 = bufferToBase64(salt);
    const ivB64 = bufferToBase64(iv);
    const encryptedContentB64 = bufferToBase64(encryptedContent);

    return `${saltB64}:${ivB64}:${encryptedContentB64}`;
};

// Decrypts data with a password
export const decrypt = async (encryptedString: string, password: string): Promise<string> => {
    try {
        const [saltB64, ivB64, encryptedContentB64] = encryptedString.split(':');
        
        if (!saltB64 || !ivB64 || !encryptedContentB64) {
             throw new Error("Invalid encrypted data format.");
        }

        const salt = new Uint8Array(base64ToBuffer(saltB64));
        const iv = new Uint8Array(base64ToBuffer(ivB64));
        const encryptedContent = base64ToBuffer(encryptedContentB64);
        
        const key = await deriveKey(password, salt);

        const decryptedContent = await window.crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv,
            },
            key,
            encryptedContent
        );

        return textDecoder.decode(decryptedContent);
    } catch (e) {
        // Errors can happen here if the password is wrong or the data is corrupt
        console.error("Decryption failed:", e);
        throw new Error("Decryption failed. Invalid password or corrupt data.");
    }
};