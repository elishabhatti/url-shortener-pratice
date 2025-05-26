import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmails = async () => {
  try {
    const data = await resend.emails.send({
      from: "URL Shortener <elishabhatti@resend.dev>", // Must be a verified domain or Resend sandbox domain
      to: ["elishajameel270@gmail.com"],
      subject: "Testing Email Sending!",
      html: "<p>This is a test email sent from Muhammad Hanif via Resend API</p>",
    });

    console.log("Email sent:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
