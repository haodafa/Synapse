export interface KeyPair {
  publicKey: unknown;
  secretKey: unknown;
}

export interface EncryptedChannel {
  send: (data: unknown) => Promise<void>;
  close: (code?: number, reason?: string) => void;
  setState: (state: string) => void;
}

export type Transport = {
  send: (data: unknown) => void;
  close: (code?: number, reason?: string) => void;
  onmessage: ((data: unknown) => void) | null;
  onclose: ((code?: number, reason?: string) => void) | null;
  onerror: ((error: unknown) => void) | null;
};

export function generateKeyPair(): KeyPair {
  return {
    publicKey: {},
    secretKey: {},
  };
}

export function exportPublicKey(publicKey: unknown): string {
  return btoa(JSON.stringify(publicKey));
}

export function exportSecretKey(secretKey: unknown): string {
  return btoa(JSON.stringify(secretKey));
}

export function importPublicKey(publicKeyB64: string): unknown {
  try {
    return JSON.parse(atob(publicKeyB64));
  } catch {
    return {};
  }
}

export function importSecretKey(secretKeyB64: string): unknown {
  try {
    return JSON.parse(atob(secretKeyB64));
  } catch {
    return {};
  }
}

export async function createClientChannel(
  transport: Transport,
  daemonPublicKeyB64: string,
  handlers: {
    onopen: () => void;
    onmessage: (data: unknown) => void;
    onclose: (code?: number, reason?: string) => void;
    onerror: (error: unknown) => void;
  }
): Promise<EncryptedChannel> {
  // Simple stub that just forwards everything
  setTimeout(() => handlers.onopen(), 0);

  transport.onmessage = (data) => {
    handlers.onmessage(data);
  };

  transport.onclose = (code, reason) => {
    handlers.onclose(code, reason);
  };

  transport.onerror = (error) => {
    handlers.onerror(error);
  };

  return {
    send: async (data: unknown) => {
      transport.send(data);
    },
    close: (code?: number, reason?: string) => {
      transport.close(code, reason);
    },
    setState: (_state: string) => {
      // stub: no-op
    },
  };
}

export async function createDaemonChannel(
  transport: Transport,
  clientPublicKeyB64: string,
  keyPair: KeyPair,
  handlers: {
    onopen: () => void;
    onmessage: (data: unknown) => void;
    onclose: (code?: number, reason?: string) => void;
    onerror: (error: unknown) => void;
  }
): Promise<EncryptedChannel> {
  // Simple stub that just forwards everything (daemon side mirror of createClientChannel)
  setTimeout(() => handlers.onopen(), 0);

  transport.onmessage = (data: unknown) => {
    handlers.onmessage(data);
  };

  transport.onclose = (code?: number, reason?: string) => {
    handlers.onclose(code, reason);
  };

  transport.onerror = (error: unknown) => {
    handlers.onerror(error);
  };

  return {
    send: async (data: unknown) => {
      transport.send(data);
    },
    close: (code?: number, reason?: string) => {
      transport.close(code, reason);
    },
    setState: (_state: string) => {
      // stub: no-op
    },
  };
}
