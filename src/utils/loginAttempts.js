
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

class LoginAttemptTracker {
    static attempts = new Map();

    static recordAttempt(email) {
        const now = Date.now();
        const userAttempts = this.attempts.get(email) || { count: 0, timestamp: now };
        
        if (this.isBlocked(email)) {
            return false;
        }

        // Reset attempts if block duration has passed
        if (now - userAttempts.timestamp > BLOCK_DURATION) {
            userAttempts.count = 1;
            userAttempts.timestamp = now;
        } else {
            userAttempts.count += 1;
        }

        this.attempts.set(email, userAttempts);
        return userAttempts.count < MAX_ATTEMPTS;
    }

    static isBlocked(email) {
        const userAttempts = this.attempts.get(email);
        if (!userAttempts) return false;

        const now = Date.now();
        if (userAttempts.count >= MAX_ATTEMPTS && 
            now - userAttempts.timestamp < BLOCK_DURATION) {
            return true;
        }

        return false;
    }

    static getRemainingBlockTime(email) {
        const userAttempts = this.attempts.get(email);
        if (!userAttempts) return 0;

        const now = Date.now();
        const timePassed = now - userAttempts.timestamp;
        return Math.max(0, BLOCK_DURATION - timePassed);
    }

    static resetAttempts(email) {
        this.attempts.delete(email);
    }
}

export default LoginAttemptTracker;