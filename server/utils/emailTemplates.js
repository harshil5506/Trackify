const nodemailer = require("nodemailer");

function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Fallback to hardcoded app credentials or mock transporter
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "trackify.services@gmail.com",
      pass: "bnhz jlem nkio egos",
    },
  });
}

function generateReportEmailHTML({ userName, reportType, monthYear, totalIncome, totalExpense, netSavings, topCategories, currencySymbol = "₹" }) {
  const isPositiveSavings = netSavings >= 0;
  const savingsColor = isPositiveSavings ? "#10b981" : "#ef4444";

  const categoriesHTML = (topCategories && topCategories.length > 0)
    ? topCategories.map(c => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 10px; font-weight: 500; color: #374151;">${c.category}</td>
        <td style="padding: 10px; text-align: right; font-weight: 600; color: #1f2937;">${currencySymbol}${Number(c.total).toFixed(2)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #6b7280;">No expenses recorded in this period.</td></tr>`;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Trackify ${reportType} Financial Summary</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">📊 Trackify Financial Summary</h1>
        <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 15px;">Your ${reportType} Performance Report • ${monthYear}</p>
      </div>

      <!-- Content -->
      <div style="padding: 30px;">
        <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
        <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">Here is your automated <strong>${reportType.toLowerCase()}</strong> financial overview from Trackify. Here's how your money moved:</p>

        <!-- Summary Cards Grid -->
        <div style="display: table; width: 100%; margin: 24px 0;">
          <div style="display: table-cell; width: 33.33%; padding: 12px; background: #ecfdf5; border-radius: 12px; text-align: center;">
            <span style="font-size: 12px; text-transform: uppercase; color: #059669; font-weight: 600;">Total Income</span>
            <div style="font-size: 18px; font-weight: 700; color: #047857; margin-top: 4px;">+${currencySymbol}${Number(totalIncome).toFixed(2)}</div>
          </div>
          <div style="display: table-cell; width: 4px;"></div>
          <div style="display: table-cell; width: 33.33%; padding: 12px; background: #fef2f2; border-radius: 12px; text-align: center;">
            <span style="font-size: 12px; text-transform: uppercase; color: #dc2626; font-weight: 600;">Total Expenses</span>
            <div style="font-size: 18px; font-weight: 700; color: #b91c1c; margin-top: 4px;">-${currencySymbol}${Number(totalExpense).toFixed(2)}</div>
          </div>
          <div style="display: table-cell; width: 4px;"></div>
          <div style="display: table-cell; width: 33.33%; padding: 12px; background: #f0f9ff; border-radius: 12px; text-align: center;">
            <span style="font-size: 12px; text-transform: uppercase; color: #0284c7; font-weight: 600;">Net Balance</span>
            <div style="font-size: 18px; font-weight: 700; color: ${savingsColor}; margin-top: 4px;">${isPositiveSavings ? "+" : ""}${currencySymbol}${Number(netSavings).toFixed(2)}</div>
          </div>
        </div>

        <!-- Top Categories Table -->
        <h3 style="font-size: 16px; color: #1f2937; margin-bottom: 12px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Top Spending Categories</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #f9fafb; text-align: left;">
              <th style="padding: 10px; font-size: 13px; color: #6b7280; text-transform: uppercase;">Category</th>
              <th style="padding: 10px; font-size: 13px; color: #6b7280; text-transform: uppercase; text-align: right;">Amount Spent</th>
            </tr>
          </thead>
          <tbody>
            ${categoriesHTML}
          </tbody>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 28px;">
          <a href="http://localhost:5173/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">View Live Dashboard</a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0;">You received this automated report because auto-reports are enabled on your Trackify account.</p>
        <p style="margin: 4px 0 0 0;">Manage preferences in your <a href="http://localhost:5173/profile" style="color: #4f46e5;">Profile Settings</a>.</p>
      </div>

    </div>
  </body>
  </html>
  `;
}

async function sendFinancialReportEmail(toEmail, reportData) {
  try {
    const transporter = createTransporter();
    const htmlContent = generateReportEmailHTML(reportData);
    
    const info = await transporter.sendMail({
      from: `"Trackify Reports" <trackify.services@gmail.com>`,
      to: toEmail,
      subject: `📈 Trackify ${reportData.reportType} Report - ${reportData.monthYear}`,
      html: htmlContent,
    });
    console.log("Financial summary email sent:", info.messageId || info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending financial report email:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateReportEmailHTML,
  sendFinancialReportEmail,
};
