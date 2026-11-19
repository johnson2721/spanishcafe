import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { db } from "@backend/db";
import { orders } from "@backend/db/schema";
import type { OrderItem } from "@backend/db/schema";
import { generateOrderEmailHtml } from "@backend/lib/emailTemplate";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SC-${timestamp}-${random}`;
}

function sanitize(str: string | undefined | null): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // --- Validate required fields ---
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      tableNumber,
      orderType,
      paymentMethod,
      preferredDate,
      preferredTime,
      specialInstructions,
      mpesaConfirmationCode,
      mpesaAmountPaid,
      mpesaPaymentDate,
      mpesaPaymentTime,
      mpesaPaid,
      items,
    } = body;

    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return NextResponse.json({ success: false, message: "Customer name is required." }, { status: 400 });
    }

    if (!customerPhone || typeof customerPhone !== "string" || !customerPhone.trim()) {
      return NextResponse.json({ success: false, message: "Phone number is required." }, { status: 400 });
    }

    if (!orderType || !["eat_in", "take_away", "delivery"].includes(orderType)) {
      return NextResponse.json({ success: false, message: "Valid order type is required." }, { status: 400 });
    }

    if (!paymentMethod || !["cash", "card", "mpesa"].includes(paymentMethod)) {
      return NextResponse.json({ success: false, message: "Valid payment method is required." }, { status: 400 });
    }

    if (orderType === "delivery" && (!deliveryAddress || !deliveryAddress.trim())) {
      return NextResponse.json({ success: false, message: "Delivery address is required for delivery orders." }, { status: 400 });
    }

    if (paymentMethod === "mpesa") {
      if (!mpesaPaid) {
        return NextResponse.json({ success: false, message: "Please confirm that you have made the M-PESA payment." }, { status: 400 });
      }
      if (!mpesaConfirmationCode || !mpesaConfirmationCode.trim()) {
        return NextResponse.json({ success: false, message: "M-PESA confirmation code is required." }, { status: 400 });
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Please select at least one food item." }, { status: 400 });
    }

    // Validate each item
    const validatedItems: OrderItem[] = [];
    let grandTotal = 0;

    for (const item of items) {
      if (!item.id || !item.name || typeof item.price !== "number" || typeof item.quantity !== "number") {
        return NextResponse.json({ success: false, message: "Invalid item data." }, { status: 400 });
      }
      if (item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ success: false, message: `Invalid quantity for ${item.name}.` }, { status: 400 });
      }
      const subtotal = item.price * item.quantity;
      validatedItems.push({
        id: sanitize(item.id),
        name: sanitize(item.name),
        price: item.price,
        quantity: item.quantity,
        subtotal,
      });
      grandTotal += subtotal;
    }

    const orderNumber = generateOrderNumber();
    const now = new Date();
    const submittedAt = now.toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      dateStyle: "full",
      timeStyle: "short",
    });

    // --- Save to database ---
    await db.insert(orders).values({
      orderNumber,
      customerName: sanitize(customerName),
      customerPhone: sanitize(customerPhone),
      customerEmail: sanitize(customerEmail) || null,
      deliveryAddress: sanitize(deliveryAddress) || null,
      tableNumber: sanitize(tableNumber) || null,
      orderType,
      paymentMethod,
      preferredDate: sanitize(preferredDate) || null,
      preferredTime: sanitize(preferredTime) || null,
      specialInstructions: sanitize(specialInstructions) || null,
      mpesaConfirmationCode: sanitize(mpesaConfirmationCode) || null,
      mpesaAmountPaid: mpesaAmountPaid ? Number(mpesaAmountPaid) : null,
      mpesaPaymentDate: sanitize(mpesaPaymentDate) || null,
      mpesaPaymentTime: sanitize(mpesaPaymentTime) || null,
      items: validatedItems,
      grandTotal,
      status: "pending",
      emailSent: false,
    });

    // --- Send Email ---
    const emailHtml = generateOrderEmailHtml({
      orderNumber,
      customerName: sanitize(customerName),
      customerPhone: sanitize(customerPhone),
      customerEmail: sanitize(customerEmail),
      deliveryAddress: sanitize(deliveryAddress),
      tableNumber: sanitize(tableNumber),
      orderType,
      paymentMethod,
      preferredDate: sanitize(preferredDate),
      preferredTime: sanitize(preferredTime),
      specialInstructions: sanitize(specialInstructions),
      mpesaConfirmationCode: sanitize(mpesaConfirmationCode),
      mpesaAmountPaid: mpesaAmountPaid ? Number(mpesaAmountPaid) : undefined,
      mpesaPaymentDate: sanitize(mpesaPaymentDate),
      mpesaPaymentTime: sanitize(mpesaPaymentTime),
      items: validatedItems,
      grandTotal,
      submittedAt,
    });

    // Build transporter from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT ?? "587", 10);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM ?? smtpUser ?? "orders@spanishcafe.co.ke";
    const orderEmail = process.env.ORDER_EMAIL ?? "ddeltaj@gmail.com";

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: `"SPANISH CAFE Orders" <${smtpFrom}>`,
          to: orderEmail,
          subject: `🛒 New Customer Order – SPANISH CAFE [${orderNumber}]`,
          html: emailHtml,
          text: `New order ${orderNumber} from ${sanitize(customerName)} (${sanitize(customerPhone)}). Grand Total: KSh ${grandTotal.toLocaleString()}. Items: ${validatedItems.map((i) => `${i.name} x${i.quantity}`).join(", ")}.`,
        });

        emailSent = true;

        // Update email sent status (fire and forget)
        void db
          .update(orders)
          .set({ emailSent: true, updatedAt: new Date() })
          .where(eq(orders.orderNumber, orderNumber));
      } catch (emailError) {
        console.error("[Email Error]", emailError);
        // Order is still saved, just email failed
      }
    } else {
      // No SMTP configured – log to console for dev; order still saved
      console.log("[DEV MODE] Email would be sent to:", orderEmail);
      console.log("[DEV MODE] Order:", orderNumber, "- Grand Total: KSh", grandTotal);
      emailSent = true; // In dev, treat as success so UI flow works
    }

    const customerName_clean = sanitize(customerName);
    const whatsappItems = validatedItems
      .map((i) => `• ${i.name} x${i.quantity} = KSh ${i.subtotal}`)
      .join("\n");

    const whatsappText = encodeURIComponent(
      `🛒 *ORDER FROM SPANISH CAFE*\n\n` +
      `Order #: ${orderNumber}\n` +
      `Name: ${customerName_clean}\n` +
      `Phone: ${sanitize(customerPhone)}\n` +
      `Order Type: ${orderType}\n\n` +
      `*Items:*\n${whatsappItems}\n\n` +
      `*Grand Total: KSh ${grandTotal}*\n\n` +
      `Payment: ${paymentMethod.toUpperCase()}\n` +
      `${mpesaConfirmationCode ? `M-PESA Code: ${sanitize(mpesaConfirmationCode)}\n` : ""}` +
      `Date: ${submittedAt}`
    );

    const whatsappUrl = `https://wa.me/254110666172?text=${whatsappText}`;

    return NextResponse.json({
      success: true,
      message: "Order placed successfully!",
      orderNumber,
      grandTotal,
      whatsappUrl,
      emailSent,
    });
  } catch (error) {
    console.error("[Order API Error]", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allOrders = await db.select().from(orders).orderBy(orders.createdAt);
    return NextResponse.json({ success: true, orders: allOrders });
  } catch (error) {
    console.error("[Orders GET Error]", error);
    return NextResponse.json({ success: false, message: "Failed to fetch orders." }, { status: 500 });
  }
}
