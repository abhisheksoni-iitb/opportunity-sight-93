interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  allowed: boolean;
  error?: string;
  resetTime?: number;
}

class RateLimiter {
  private minuteLimit = 3;
  private hourLimit = 10;
  private minuteWindow = 60 * 1000; // 1 minute in milliseconds
  private hourWindow = 60 * 60 * 1000; // 1 hour in milliseconds
  
  private minuteTracker: RateLimitEntry = { count: 0, resetTime: 0 };
  private hourTracker: RateLimitEntry = { count: 0, resetTime: 0 };

  checkLimit(): RateLimitResult {
    const now = Date.now();

    // Reset minute counter if window has passed
    if (now > this.minuteTracker.resetTime) {
      this.minuteTracker = {
        count: 0,
        resetTime: now + this.minuteWindow
      };
    }

    // Reset hour counter if window has passed
    if (now > this.hourTracker.resetTime) {
      this.hourTracker = {
        count: 0,
        resetTime: now + this.hourWindow
      };
    }

    // Check minute limit first (more restrictive)
    if (this.minuteTracker.count >= this.minuteLimit) {
      const resetInSeconds = Math.ceil((this.minuteTracker.resetTime - now) / 1000);
      return {
        allowed: false,
        error: `Rate limit exceeded. You can make ${this.minuteLimit} requests per minute. Try again in ${resetInSeconds} seconds.`,
        resetTime: this.minuteTracker.resetTime
      };
    }

    // Check hour limit
    if (this.hourTracker.count >= this.hourLimit) {
      const resetInMinutes = Math.ceil((this.hourTracker.resetTime - now) / (1000 * 60));
      return {
        allowed: false,
        error: `Hourly rate limit exceeded. You can make ${this.hourLimit} requests per hour. Try again in ${resetInMinutes} minutes.`,
        resetTime: this.hourTracker.resetTime
      };
    }

    // Increment counters
    this.minuteTracker.count++;
    this.hourTracker.count++;

    return { allowed: true };
  }

  getRemainingRequests(): { minute: number; hour: number } {
    const now = Date.now();
    
    // Reset counters if windows have passed
    if (now > this.minuteTracker.resetTime) {
      this.minuteTracker.count = 0;
    }
    if (now > this.hourTracker.resetTime) {
      this.hourTracker.count = 0;
    }

    return {
      minute: Math.max(0, this.minuteLimit - this.minuteTracker.count),
      hour: Math.max(0, this.hourLimit - this.hourTracker.count)
    };
  }
}

// Create a singleton instance
export const geminiRateLimiter = new RateLimiter();