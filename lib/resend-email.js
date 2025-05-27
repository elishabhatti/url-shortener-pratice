import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmails = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: "URL Shortener Practice <elishabhatti@resend.dev>", // Must be a verified domain or Resend sandbox domain
      to: [to],
      subject: subject,
      html: html,
    });

    console.log("Email sent:", data);
    console.log("Email sent:", to, subject, html);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
