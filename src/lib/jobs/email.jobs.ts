export type SendOtpEmailJob = {
  type: "SEND_OTP_EMAIL";
  payload: {
    to: string;
    otp: string;
  };
};

export type SendWelcomeEmailJob = {
  type: "SEND_WELCOME_EMAIL";
  payload: {
    to: string;
    name?: string;
  };
};

export type SendPasswordResetEmailJob = {
  type: "SEND_PASSWORD_RESET_EMAIL";
  payload: {
    to: string;
    resetUrl: string;
  };
};

export type EmailJob =
  | SendOtpEmailJob
  | SendWelcomeEmailJob
  | SendPasswordResetEmailJob;