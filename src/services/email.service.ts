/**
 * Email Service
 *
 * 使用 Resend 發送 Email
 */

import { Resend } from 'resend';
import { log } from '../utils/logger';

// 初始化 Resend（如果有 API Key）
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@mementia.app';

/**
 * 發送信件送達通知
 */
export async function sendLetterDeliveryNotification(
  toEmail: string,
  letterContent: string,
  sendDate: Date
): Promise<boolean> {
  if (!resend) {
    log.warn('Resend API Key not configured, skipping email notification');
    return false;
  }

  try {
    const daysSince = Math.floor(
      (new Date().getTime() - sendDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `📬 一封來自 ${daysSince} 天前的你 | Mementia`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 30px;
            }
            .content {
              background: #f9f9f9;
              padding: 25px;
              border-radius: 10px;
              margin-bottom: 20px;
            }
            .cta-button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📬 你有一封來自過去的信！</h1>
            <p>在 ${sendDate.toLocaleDateString('zh-TW')}，過去的你寫了一封信給現在的你</p>
          </div>

          <div class="content">
            <p>親愛的使用者，</p>
            <p>這封信已經在時光郵局中靜靜等待了 <strong>${daysSince} 天</strong>。</p>
            <p>現在，它終於送達了。</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="#" class="cta-button">前往 Discord 開啟信件</a>
            </p>
            <p style="font-size: 14px; color: #666;">
              💡 提示：使用 Discord 中的 <code>/my-letters</code> 指令查看你的信箱
            </p>
          </div>

          <div class="footer">
            <p>Mementia - Where memories live ✨</p>
            <p style="font-size: 12px;">
              這是一封自動發送的郵件，請勿直接回覆。
            </p>
          </div>
        </body>
        </html>
      `,
    });

    log.info(`Email sent to ${toEmail} for letter delivery`);
    return true;
  } catch (error) {
    log.error('Error sending email:', error);
    return false;
  }
}

/**
 * 發送測試郵件
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  if (!resend) {
    log.warn('Resend API Key not configured');
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: '✅ Mementia Email 測試',
      html: `
        <h1>Email 設定成功！</h1>
        <p>如果你收到這封郵件，代表 Mementia 的 Email 通知功能已經正常運作。</p>
        <p>當你的未來信件送達時，我們會發送通知到這個信箱。</p>
        <p>—— Mementia Team</p>
      `,
    });

    log.info(`Test email sent to ${toEmail}`);
    return true;
  } catch (error) {
    log.error('Error sending test email:', error);
    return false;
  }
}
