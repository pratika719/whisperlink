export const RATE_LIMITS = {
  REGISTER: {
    limit: 5,
    windowSeconds: 60 * 60,
  },
  LOGIN: {
    limit: 5,
    windowSeconds: 15 * 60,
  },
  OTP_REQUEST: {
    limit: 3,
    windowSeconds: 10 * 60,
  },
  OTP_VERIFY: {
    limit: 5,
    windowSeconds: 10 * 60,
  },
  FORGOT_PASSWORD: {
    limit: 3,
    windowSeconds: 15 * 60,
  },
} as const;