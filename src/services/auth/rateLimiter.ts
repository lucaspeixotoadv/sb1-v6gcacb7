interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blocked: boolean;
  blockExpires?: number;
  attempts: number;
}

export class RateLimiter {
  private static readonly STORAGE_KEY = 'rate_limit';
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  private static readonly BASE_BLOCK_DURATION = 60000; // 1 minuto base em ms

  static checkRateLimit(identifier: string): { 
    allowed: boolean; 
    waitTime?: number;
    remainingAttempts?: number;
  } {
    const now = Date.now();
    const limits = this.getLimits();
    const entry = limits[identifier] || this.createEntry(now);

    if (entry.blocked && entry.blockExpires && entry.blockExpires > now) {
      const waitTimeMinutes = Math.ceil((entry.blockExpires - now) / 60000);
      const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - entry.attempts);
      return { 
        allowed: false, 
        waitTime: waitTimeMinutes,
        remainingAttempts
      };
    }

    // Remove bloqueio expirado
    if (entry.blocked) {
      entry.blocked = false;
      delete entry.blockExpires;
      entry.attempts = 0;
    }

    // Reseta contagem se a janela expirou
    if ((now - entry.firstAttempt) > this.WINDOW_MS) {
      entry.count = 0;
      entry.firstAttempt = now;
      entry.attempts = 0;
    }

    // Incrementa contagem
    entry.count++;
    entry.attempts++;
    
    const remainingAttempts = Math.max(0, this.MAX_ATTEMPTS - entry.attempts);

    // Bloqueia se excedeu limite
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      entry.blocked = true;
      const blockDuration = Math.min(
        this.BASE_BLOCK_DURATION * Math.pow(2, Math.min(entry.attempts - this.MAX_ATTEMPTS, 6)),
        3600000 // Máximo de 1 hora em ms
      );
      entry.blockExpires = now + (blockDuration * 1000);
      this.saveLimits({ ...limits, [identifier]: entry });
      
      // Retorna tempo em minutos
      const waitTimeMinutes = Math.ceil(blockDuration / 60000);
      return { 
        allowed: false, 
        waitTime: waitTimeMinutes,
        remainingAttempts
      };
    }

    this.saveLimits({ ...limits, [identifier]: entry });
    return { 
      allowed: true,
      remainingAttempts
    };
  }

  static resetLimit(identifier: string): void {
    const limits = this.getLimits();
    delete limits[identifier];
    this.saveLimits(limits);
  }

  private static createEntry(timestamp: number): RateLimitEntry {
    return {
      count: 0,
      firstAttempt: timestamp,
      blocked: false,
      attempts: 0
    };
  }

  private static getLimits(): Record<string, RateLimitEntry> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private static saveLimits(limits: Record<string, RateLimitEntry>): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limits));
  }
}