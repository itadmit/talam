"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "תל״מ Pro <onboarding@resend.dev>";

/* ------------------------------------------------------------------ */
/*  Shared HTML wrapper                                                */
/* ------------------------------------------------------------------ */

function emailWrapper(content: string): string {
  return `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #f0f0f0;">
        <h1 style="color: #1a1a2e; font-size: 22px; margin: 0;">תל״מ Pro</h1>
        <p style="color: #888; margin-top: 4px; font-size: 13px;">פורטל ידע ופעולות</p>
      </div>
      ${content}
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #aaa; font-size: 11px; margin: 0;">
          הודעה זו נשלחה אוטומטית ממערכת תל״מ Pro. אין להשיב למייל זה.
        </p>
      </div>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/*  Send email helper with error handling                              */
/* ------------------------------------------------------------------ */

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Resend free tier: ניתן לשלוח רק לכתובת הבעלים. הגדר RESEND_OVERRIDE_TO (למשל itadmit@gmail.com) כדי לשלוח לשם בפיתוח.
  const recipient = process.env.RESEND_OVERRIDE_TO || to;
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: recipient,
      subject,
      html: emailWrapper(html),
    });

    if (error) {
      console.error("Email send error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Email exception:", err);
    return { ok: false, error: "שליחת המייל נכשלה" };
  }
}

/* ------------------------------------------------------------------ */
/*  1) OTP Login Code                                                  */
/* ------------------------------------------------------------------ */

export async function sendOtpEmail(email: string, code: string) {
  const result = await sendEmail({
    to: email,
    subject: `קוד כניסה: ${code}`,
    html: `
      <div style="background: #f8f9fa; border-radius: 12px; padding: 32px; text-align: center;">
        <p style="color: #333; font-size: 16px; margin: 0 0 16px;">קוד הכניסה שלך:</p>
        <div style="background: #1a1a2e; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 24px; border-radius: 8px; display: inline-block;">
          ${code}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 16px;">
          הקוד תקף ל-10 דקות בלבד
        </p>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
        אם לא ביקשת קוד זה, ניתן להתעלם מהמייל.
      </p>
    `,
  });

  if (!result.ok) {
    throw new Error("שליחת המייל נכשלה");
  }
}

/* ------------------------------------------------------------------ */
/*  2) Ticket – New Response                                           */
/* ------------------------------------------------------------------ */

export async function sendTicketResponseEmail(
  email: string,
  ticketSubject: string,
  ticketId: string
) {
  await sendEmail({
    to: email,
    subject: `תגובה חדשה לפנייה: ${ticketSubject}`,
    html: `
      <div style="padding: 20px 0;">
        <div style="background: #e8f4fd; border-right: 4px solid #2196F3; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
          <p style="color: #1565C0; font-weight: bold; margin: 0 0 4px;">💬 תגובה חדשה</p>
          <p style="color: #333; margin: 0;">התקבלה תגובה חדשה בפנייה: <strong>${ticketSubject}</strong></p>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tickets/${ticketId}" 
             style="background: #1a1a2e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; display: inline-block;">
            צפייה בפנייה
          </a>
        </div>
      </div>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  3) Ticket – Status Change                                          */
/* ------------------------------------------------------------------ */

export async function sendTicketStatusEmail(
  email: string,
  ticketSubject: string,
  ticketId: string,
  newStatus: string
) {
  const statusColors: Record<string, string> = {
    פתוח: "#2196F3",
    בטיפול: "#FF9800",
    ממתין: "#9C27B0",
    הושלם: "#4CAF50",
  };
  const color = statusColors[newStatus] || "#666";

  await sendEmail({
    to: email,
    subject: `עדכון סטטוס פנייה: ${ticketSubject}`,
    html: `
      <div style="padding: 20px 0;">
        <div style="background: #f8f9fa; border-right: 4px solid ${color}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
          <p style="color: #333; font-weight: bold; margin: 0 0 8px;">📋 עדכון סטטוס פנייה</p>
          <p style="color: #555; margin: 0 0 12px;">הפנייה <strong>"${ticketSubject}"</strong> עודכנה:</p>
          <div style="display: inline-block; background: ${color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${newStatus}
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/tickets/${ticketId}" 
             style="background: #1a1a2e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; display: inline-block;">
            צפייה בפנייה
          </a>
        </div>
      </div>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  4) Form – Submission Status Update                                 */
/* ------------------------------------------------------------------ */

export async function sendFormStatusEmail(
  email: string,
  formTitle: string,
  newStatus: string
) {
  const statusColors: Record<string, string> = {
    התקבל: "#2196F3",
    בבדיקה: "#FF9800",
    אושר: "#4CAF50",
    נדחה: "#F44336",
  };
  const color = statusColors[newStatus] || "#666";

  await sendEmail({
    to: email,
    subject: `עדכון טופס: ${formTitle} – ${newStatus}`,
    html: `
      <div style="padding: 20px 0;">
        <div style="background: #f8f9fa; border-right: 4px solid ${color}; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
          <p style="color: #333; font-weight: bold; margin: 0 0 8px;">📄 עדכון סטטוס טופס</p>
          <p style="color: #555; margin: 0 0 12px;">הטופס <strong>"${formTitle}"</strong> עודכן:</p>
          <div style="display: inline-block; background: ${color}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
            ${newStatus}
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forms" 
             style="background: #1a1a2e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; display: inline-block;">
            צפייה בטפסים
          </a>
        </div>
      </div>
    `,
  });
}

/* ------------------------------------------------------------------ */
/*  5) Test Email                                                      */
/* ------------------------------------------------------------------ */

export async function sendTestEmail(email: string) {
  return sendEmail({
    to: email,
    subject: "בדיקת מייל – תל״מ Pro ✅",
    html: `
      <div style="padding: 20px 0; text-align: center;">
        <div style="background: #f0fdf4; border-radius: 12px; padding: 32px; margin-bottom: 16px;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h2 style="color: #166534; margin: 0 0 8px;">המייל עובד!</h2>
          <p style="color: #555; margin: 0;">מערכת המיילים של תל״מ Pro מוגדרת ופועלת כשורה.</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; text-align: right;">
          <p style="color: #333; font-weight: bold; margin: 0 0 8px;">מיילים שהמערכת שולחת:</p>
          <ul style="color: #555; font-size: 14px; margin: 0; padding-right: 20px; list-style: disc;">
            <li style="margin-bottom: 4px;">קוד כניסה (OTP)</li>
            <li style="margin-bottom: 4px;">תגובה חדשה בפנייה</li>
            <li style="margin-bottom: 4px;">עדכון סטטוס פנייה</li>
            <li>עדכון סטטוס הגשת טופס</li>
          </ul>
        </div>
      </div>
    `,
  });
}
