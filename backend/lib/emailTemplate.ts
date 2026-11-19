import type { OrderItem } from "@backend/db/schema";

interface EmailData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  tableNumber?: string;
  orderType: string;
  paymentMethod: string;
  preferredDate?: string;
  preferredTime?: string;
  specialInstructions?: string;
  mpesaConfirmationCode?: string;
  mpesaAmountPaid?: number;
  mpesaPaymentDate?: string;
  mpesaPaymentTime?: string;
  items: OrderItem[];
  grandTotal: number;
  submittedAt: string;
}

export function generateOrderEmailHtml(data: EmailData): string {
  const orderTypeLabel =
    data.orderType === "eat_in"
      ? "Eat In"
      : data.orderType === "take_away"
        ? "Take Away"
        : "Delivery";

  const paymentMethodLabel =
    data.paymentMethod === "cash"
      ? "Cash"
      : data.paymentMethod === "card"
        ? "Card"
        : "M-PESA (Pochi la Biashara)";

  const itemsRows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f0e8d8; font-size: 14px; color: #333;">${item.name}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f0e8d8; text-align: center; font-size: 14px; color: #333;">${item.quantity}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f0e8d8; text-align: right; font-size: 14px; color: #333;">KSh ${item.price.toLocaleString()}</td>
      <td style="padding: 10px 14px; border-bottom: 1px solid #f0e8d8; text-align: right; font-size: 14px; font-weight: 600; color: #e67e22;">KSh ${item.subtotal.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const mpesaSection =
    data.paymentMethod === "mpesa"
      ? `
    <tr>
      <td colspan="2" style="padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0fff4; border: 1px solid #86efac; border-radius: 8px; margin-top: 10px;">
          <tr>
            <td style="padding: 16px 20px; border-bottom: 1px solid #bbf7d0;">
              <h3 style="margin: 0; color: #16a34a; font-size: 15px; font-weight: 700;">📱 M-PESA Payment Details</h3>
            </td>
          </tr>
          ${data.mpesaConfirmationCode ? `<tr><td style="padding: 8px 20px;"><span style="color: #555; font-size: 13px;">Confirmation Code:</span> <strong style="color: #16a34a;">${data.mpesaConfirmationCode}</strong></td></tr>` : ""}
          ${data.mpesaAmountPaid ? `<tr><td style="padding: 8px 20px;"><span style="color: #555; font-size: 13px;">Amount Paid:</span> <strong style="color: #16a34a;">KSh ${data.mpesaAmountPaid.toLocaleString()}</strong></td></tr>` : ""}
          ${data.mpesaPaymentDate ? `<tr><td style="padding: 8px 20px;"><span style="color: #555; font-size: 13px;">Payment Date:</span> <strong style="color: #333;">${data.mpesaPaymentDate}</strong></td></tr>` : ""}
          ${data.mpesaPaymentTime ? `<tr><td style="padding: 8px 20px 16px;"><span style="color: #555; font-size: 13px;">Payment Time:</span> <strong style="color: #333;">${data.mpesaPaymentTime}</strong></td></tr>` : ""}
        </table>
      </td>
    </tr>
  `
      : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order – SPANISH CAFE</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f0e8; font-family: 'Arial', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0e8; padding: 30px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #e67e22 0%, #d35400 50%, #c0392b 100%); padding: 36px 30px; text-align: center;">
              <div style="font-size: 32px; margin-bottom: 6px;">☕</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px;">SPANISH CAFE</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 3px;">FRESH • AFFORDABLE • DELICIOUS</p>
              <div style="margin-top: 16px; background: rgba(255,255,255,0.2); border-radius: 50px; display: inline-block; padding: 6px 20px;">
                <span style="color: #fff; font-size: 13px; font-weight: 600;">🛒 NEW ORDER RECEIVED</span>
              </div>
            </td>
          </tr>

          <!-- Order Number Banner -->
          <tr>
            <td style="background: #fff8f0; border-bottom: 3px solid #e67e22; padding: 14px 30px; text-align: center;">
              <span style="color: #e67e22; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Order Number</span>
              <span style="display: block; color: #c0392b; font-size: 22px; font-weight: 800; margin-top: 2px;">${data.orderNumber}</span>
              <span style="color: #888; font-size: 12px;">${data.submittedAt}</span>
            </td>
          </tr>

          <!-- Customer Details -->
          <tr>
            <td style="padding: 24px 30px 0;">
              <h2 style="margin: 0 0 16px; color: #e67e22; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff3e0; padding-bottom: 10px;">
                👤 Customer Information
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 6px 0; vertical-align: top;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">${data.customerName}</div>
                  </td>
                  <td width="50%" style="padding: 6px 0; vertical-align: top;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone Number</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">${data.customerPhone}</div>
                  </td>
                </tr>
                ${
                  data.customerEmail
                    ? `<tr>
                  <td colspan="2" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">${data.customerEmail}</div>
                  </td>
                </tr>`
                    : ""
                }
                ${
                  data.deliveryAddress
                    ? `<tr>
                  <td colspan="2" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">${data.deliveryAddress}</div>
                  </td>
                </tr>`
                    : ""
                }
                ${
                  data.tableNumber
                    ? `<tr>
                  <td colspan="2" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Table Number</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">${data.tableNumber}</div>
                  </td>
                </tr>`
                    : ""
                }
              </table>
            </td>
          </tr>

          <!-- Order Details -->
          <tr>
            <td style="padding: 20px 30px 0;">
              <h2 style="margin: 0 0 16px; color: #e67e22; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff3e0; padding-bottom: 10px;">
                📋 Order Details
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Order Type</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">🍽️ ${orderTypeLabel}</div>
                  </td>
                  <td width="50%" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">💳 ${paymentMethodLabel}</div>
                  </td>
                </tr>
                ${
                  data.preferredDate || data.preferredTime
                    ? `<tr>
                  <td width="50%" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Preferred Date</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">📅 ${data.preferredDate || "—"}</div>
                  </td>
                  <td width="50%" style="padding: 6px 0;">
                    <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Preferred Time</span>
                    <div style="color: #1a1a1a; font-size: 15px; font-weight: 600; margin-top: 2px;">⏰ ${data.preferredTime || "—"}</div>
                  </td>
                </tr>`
                    : ""
                }
                ${mpesaSection}
              </table>
            </td>
          </tr>

          <!-- Order Items -->
          <tr>
            <td style="padding: 20px 30px 0;">
              <h2 style="margin: 0 0 16px; color: #e67e22; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff3e0; padding-bottom: 10px;">
                🛒 Ordered Items
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #f0e8d8; border-radius: 10px; overflow: hidden;">
                <thead>
                  <tr style="background: linear-gradient(135deg, #e67e22, #d35400);">
                    <th style="padding: 12px 14px; text-align: left; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th style="padding: 12px 14px; text-align: center; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 12px 14px; text-align: right; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                    <th style="padding: 12px 14px; text-align: right; color: #fff; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Grand Total -->
          <tr>
            <td style="padding: 16px 30px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: right;">
                    <div style="display: inline-block; background: linear-gradient(135deg, #e67e22, #c0392b); border-radius: 10px; padding: 14px 24px;">
                      <span style="color: rgba(255,255,255,0.8); font-size: 13px; display: block;">GRAND TOTAL</span>
                      <span style="color: #ffffff; font-size: 26px; font-weight: 800;">KSh ${data.grandTotal.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Special Instructions -->
          ${
            data.specialInstructions
              ? `<tr>
            <td style="padding: 20px 30px 0;">
              <h2 style="margin: 0 0 10px; color: #e67e22; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #fff3e0; padding-bottom: 10px;">
                📝 Special Instructions
              </h2>
              <div style="background: #fff8f0; border-left: 4px solid #e67e22; border-radius: 0 8px 8px 0; padding: 12px 16px; color: #555; font-size: 14px; line-height: 1.6;">
                ${data.specialInstructions}
              </div>
            </td>
          </tr>`
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; border-top: 1px solid #f0e8d8; margin-top: 20px;">
              <p style="margin: 0 0 6px; color: #e67e22; font-weight: 700; font-size: 16px;">☕ SPANISH CAFE</p>
              <p style="margin: 0 0 4px; color: #888; font-size: 13px;">📞 +254110666172</p>
              <p style="margin: 0 0 4px; color: #888; font-size: 13px;">📧 ddeltaj@gmail.com</p>
              <p style="margin: 0 0 16px; color: #888; font-size: 13px;">⏰ Mon–Sun: 6:00 AM – 10:00 PM</p>
              <div style="background: #f5f0e8; border-radius: 8px; padding: 10px 16px; display: inline-block;">
                <span style="color: #aaa; font-size: 12px;">This is an automated order notification from SPANISH CAFE online ordering system.</span>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
