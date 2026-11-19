import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: text("delivery_address"),
  tableNumber: text("table_number"),
  orderType: text("order_type").notNull(), // eat_in | take_away | delivery
  paymentMethod: text("payment_method").notNull(), // cash | card | mpesa
  preferredDate: text("preferred_date"),
  preferredTime: text("preferred_time"),
  specialInstructions: text("special_instructions"),
  mpesaConfirmationCode: text("mpesa_confirmation_code"),
  mpesaAmountPaid: integer("mpesa_amount_paid"),
  mpesaPaymentDate: text("mpesa_payment_date"),
  mpesaPaymentTime: text("mpesa_payment_time"),
  items: jsonb("items").notNull(), // Array of order items
  grandTotal: integer("grand_total").notNull(),
  status: text("status").notNull().default("pending"), // pending | confirmed | preparing | ready | delivered
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}
