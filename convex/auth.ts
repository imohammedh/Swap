import GitHub from "@auth/core/providers/github";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";

const verificationEmail = Email({
  maxAge: 10 * 60,
  async generateVerificationToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  async sendVerificationRequest({ identifier, token }) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM,
        to: identifier,
        subject: "Your Swap verification code",
        html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Verify your email</h2><p>Your Swap verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${token}</p><p>This code expires in 10 minutes.</p></div>`,
        text: `Your Swap verification code is: ${token}. It expires in 10 minutes.`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend failed: ${response.status}`);
    }
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Password({
      verify: verificationEmail,
    }),
  ],
});
