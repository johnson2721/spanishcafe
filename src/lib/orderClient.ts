/**
 * Client-side order helpers.
 *
 * The site is published as a static site on GitHub Pages, where there is no
 * Node.js server, database or SMTP connection. In that mode an order is:
 *   1. validated in the browser,
 *   2. given an order number,
 *   3. stored in `localStorage` on the customer's device, and
 *   4. handed off to the café through WhatsApp (one tap, prefilled message).
 *
 * When the same code runs on a Node host (Vercel, Railway, VPS) the
 * `/api/orders` route in `server/backend` takes over instead — see
 * `placeOrder` in `src/app/page.tsx`.
 */

export const CAFE_WHATSAPP_NUMBER = "254110666172";
export const ORDERS_STORAGE_KEY = "spanishcafe:orders";

export interface OrderItemInput {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderPayload {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  tableNumber?: string;
  orderType?: string;
  paymentMethod?: string;
  preferredDate?: string;
  preferredTime?: string;
  specialInstructions?: string;
  mpesaConfirmationCode?: string;
  mpesaAmountPaid?: number | null;
  mpesaPaymentDate?: string;
  mpesaPaymentTime?: string;
  mpesaPaid?: boolean;
  items?: OrderItemInput[];
}

export interface OrderOutcome {
  success: boolean;
  message: string;
  orderNumber?: string;
  grandTotal?: number;
  whatsappUrl?: string;
  delivery?: "server" | "whatsapp";
}

export interface StoredOrder extends OrderOutcome {
  id: string;
  payload: OrderPayload;
  items: OrderItemInput[];
  submittedAt: string;
  status: "awaiting_whatsapp" | "submitted_to_server";
}

export function sanitize(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[<>]/g, "").trim();
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SC-${timestamp}-${random}`;
}

export function submittedAtLabel(date = new Date()): string {
  try {
    return date.toLocaleString("en-KE", {
      timeZone: "Africa/Nairobi",
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return date.toLocaleString();
  }
}

export function buildWhatsAppUrl(
  payload: OrderPayload,
  items: OrderItemInput[],
  orderNumber: string,
  grandTotal: number,
  submittedAt: string,
): string {
  const itemLines = items.map((item) => `• ${item.name} x${item.quantity} = KSh ${item.subtotal}`).join("\n");

  const text = encodeURIComponent(
    `🛒 *ORDER FROM SPANISH CAFE*\n\n` +
      `Order #: ${orderNumber}\n` +
      `Name: ${sanitize(payload.customerName)}\n` +
      `Phone: ${sanitize(payload.customerPhone)}\n` +
      `Order Type: ${sanitize(payload.orderType)}\n` +
      (payload.deliveryAddress ? `Address: ${sanitize(payload.deliveryAddress)}\n` : "") +
      (payload.tableNumber ? `Table: ${sanitize(payload.tableNumber)}\n` : "") +
      `\n*Items:*\n${itemLines}\n\n` +
      `*Grand Total: KSh ${grandTotal}*\n\n` +
      `Payment: ${sanitize(payload.paymentMethod).toUpperCase()}\n` +
      `${payload.mpesaConfirmationCode ? `M-PESA Code: ${sanitize(payload.mpesaConfirmationCode)}\n` : ""}` +
      `${payload.specialInstructions ? `Notes: ${sanitize(payload.specialInstructions)}\n` : ""}` +
      `Date: ${submittedAt}`,
  );

  return `https://wa.me/${CAFE_WHATSAPP_NUMBER}?text=${text}`;
}

/**
 * Validates and completes an order in the browser (static hosting mode).
 * Mirrors the rules enforced by the server route.
 */
export function createOrderLocally(payload: OrderPayload): OrderOutcome {
  const customerName = sanitize(payload.customerName);
  const customerPhone = sanitize(payload.customerPhone);
  const orderType = sanitize(payload.orderType);
  const paymentMethod = sanitize(payload.paymentMethod);

  if (!customerName) return { success: false, message: "Customer name is required." };
  if (!customerPhone) return { success: false, message: "Phone number is required." };
  if (!orderType || !["eat_in", "take_away", "delivery"].includes(orderType)) {
    return { success: false, message: "Valid order type is required." };
  }
  if (!paymentMethod || !["cash", "card", "mpesa"].includes(paymentMethod)) {
    return { success: false, message: "Valid payment method is required." };
  }
  if (orderType === "delivery" && !sanitize(payload.deliveryAddress)) {
    return { success: false, message: "Delivery address is required for delivery orders." };
  }
  if (paymentMethod === "mpesa") {
    if (!payload.mpesaPaid) return { success: false, message: "Please confirm that you have made the M-PESA payment." };
    if (!sanitize(payload.mpesaConfirmationCode)) {
      return { success: false, message: "M-PESA confirmation code is required." };
    }
  }

  const rawItems = payload.items ?? [];
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { success: false, message: "Please select at least one food item." };
  }

  const items: OrderItemInput[] = [];
  let grandTotal = 0;

  for (const item of rawItems) {
    if (!item?.id || !item?.name || typeof item.price !== "number" || typeof item.quantity !== "number") {
      return { success: false, message: "Invalid item data." };
    }
    if (item.quantity < 1 || item.quantity > 100) {
      return { success: false, message: `Invalid quantity for ${item.name}.` };
    }
    const subtotal = item.price * item.quantity;
    items.push({ id: sanitize(item.id), name: sanitize(item.name), price: item.price, quantity: item.quantity, subtotal });
    grandTotal += subtotal;
  }

  const orderNumber = generateOrderNumber();
  const submittedAt = submittedAtLabel();
  const whatsappUrl = buildWhatsAppUrl(payload, items, orderNumber, grandTotal, submittedAt);

  saveOrderLocally({
    success: true,
    message: "Order created — send it to the café on WhatsApp to confirm.",
    orderNumber,
    grandTotal,
    whatsappUrl,
    delivery: "whatsapp",
    id: orderNumber,
    payload,
    items,
    submittedAt,
    status: "awaiting_whatsapp",
  });

  return {
    success: true,
    message: "Order created — send it to the café on WhatsApp to confirm.",
    orderNumber,
    grandTotal,
    whatsappUrl,
    delivery: "whatsapp",
  };
}

export function saveOrderLocally(order: StoredOrder): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readStoredOrders();
    const next = [order, ...existing].slice(0, 50);
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage can be disabled (private mode); ordering still works via WhatsApp.
  }
}

export function readStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredOrder[]) : [];
  } catch {
    return [];
  }
}
