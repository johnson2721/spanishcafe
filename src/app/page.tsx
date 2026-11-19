"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { menuItems, categories } from "@/lib/menuItems";
import type { MenuItem } from "@/lib/menuItems";
import { createOrderLocally } from "@/lib/orderClient";
import type { OrderPayload } from "@/lib/orderClient";

/**
 * Order endpoint.
 * - Node hosts (Vercel/Railway/VPS): "/api/orders" — saves to Postgres and emails the café.
 * - Static hosting (GitHub Pages): set NEXT_PUBLIC_ORDERS_API="" at build time so orders
 *   are completed in the browser and handed to WhatsApp instead.
 */
const ORDERS_API_ENDPOINT = process.env.NEXT_PUBLIC_ORDERS_API ?? "/api/orders";

// ===================== TYPES =====================
interface CartItem {
  item: MenuItem;
  quantity: number;
  selected: boolean;
}

interface OrderResult {
  success: boolean;
  orderNumber?: string;
  grandTotal?: number;
  whatsappUrl?: string;
  message: string;
  /** "server" = saved by the Node API, "whatsapp" = static hosting handoff */
  delivery?: "server" | "whatsapp";
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

// ===================== TOAST COMPONENT =====================
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)}>
          <i className={`fas ${t.type === "success" ? "fa-check-circle" : t.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ===================== NAVBAR =====================
function Navbar({ cartCount }: { cartCount: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navLinks = [
    { href: "#home", icon: "fa-home", label: "Home" },
    { href: "#menu", icon: "fa-utensils", label: "Menu" },
    { href: "#gallery", icon: "fa-images", label: "Gallery" },
    { href: "#order", icon: "fa-shopping-cart", label: "Order" },
    { href: "#contact", icon: "fa-phone", label: "Contact" },
  ];

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="nav-container">
        <a href="#home" className="nav-logo" onClick={(e) => scrollTo(e, "#home")}>
          <div className="nav-logo-icon">☕</div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">SPANISH CAFE</span>
            <span className="nav-logo-tagline">Fresh • Affordable • Delicious</span>
          </div>
        </a>
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={(e) => scrollTo(e, l.href)}
                className={l.href === "#order" ? "nav-order-btn" : ""}>
                <i className={`fas ${l.icon}`} />
                {l.label}
                {l.href === "#order" && cartCount > 0 && (
                  <span style={{
                    background: "#fff",
                    color: "var(--orange)",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    marginLeft: 2,
                  }}>{cartCount}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
        <button className={`hamburger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <ul>
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={(e) => scrollTo(e, l.href)}>
                <i className={`fas ${l.icon}`} style={{ color: "var(--orange)", width: 20 }} />
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

// ===================== HERO =====================
function Hero() {
  const scrollToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge">
          <i className="fas fa-star" style={{ color: "var(--yellow)" }} />
          Serving since 2020 – Nairobi, Kenya
        </div>
        <h1 className="hero-title">
          WELCOME TO<br />
          <span>SPANISH CAFE</span>
        </h1>
        <p className="hero-subtitle">
          Freshly prepared meals at affordable prices.<br />
          Taste the heart of Kenya in every bite.
        </p>
        <div className="hero-tags">
          {["🍵 Fresh Tea", "🫓 Soft Chapati", "🍟 Crispy Chips", "🥚 Farm Eggs", "🌿 Sukuma Wiki"].map((tag) => (
            <span key={tag} className="hero-tag">{tag}</span>
          ))}
        </div>
        <div className="hero-cta-group">
          <a href="#order" className="btn-hero btn-hero-primary" onClick={scrollToOrder}>
            <i className="fas fa-shopping-cart" />
            ORDER NOW
          </a>
          <a href="#menu" className="btn-hero btn-hero-secondary" onClick={scrollToMenu}>
            <i className="fas fa-book-open" />
            View Menu
          </a>
        </div>
      </div>
      <div className="hero-scroll">
        <i className="fas fa-chevron-down" />
        <span>Scroll</span>
      </div>
    </section>
  );
}

// ===================== STATS BAR =====================
function StatsBar() {
  return (
    <div className="stats-bar">
      <div className="stats-grid">
        {[
          { number: "500+", label: "Happy Customers" },
          { number: "15+", label: "Menu Items" },
          { number: "6AM", label: "We Open" },
          { number: "10PM", label: "We Close" },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <span className="stat-number">{s.number}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== MENU CARD =====================
function MenuCard({ item, cartItem, onToggle, onQtyChange }: {
  item: MenuItem;
  cartItem: CartItem | undefined;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
}) {
  const selected = cartItem?.selected ?? false;
  const qty = cartItem?.quantity ?? 1;

  return (
    <div className={`menu-card ${selected ? "menu-card-selected" : ""}`}>
      <div className="menu-card-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt={item.name} className="menu-card-img" loading="lazy" />
        <div className="menu-card-badge">{item.category}</div>
        {selected && (
          <div className="menu-card-selected-badge">
            <i className="fas fa-check" />
          </div>
        )}
      </div>
      <div className="menu-card-body">
        <div className="menu-card-name">{item.name}</div>
        <div className="menu-card-desc">{item.description}</div>
        <div className="menu-card-footer">
          <div>
            <div className="menu-card-price">
              KSh {item.price}
              {item.unit && <span> /{item.unit}</span>}
            </div>
          </div>
          <div className="menu-card-controls">
            <div className="add-checkbox-wrap">
              <input
                type="checkbox"
                id={`add-${item.id}`}
                className="add-checkbox"
                checked={selected}
                onChange={() => onToggle(item.id)}
              />
              <label htmlFor={`add-${item.id}`} className="add-label">Add</label>
            </div>
            <button className="qty-btn" onClick={() => onQtyChange(item.id, -1)} disabled={!selected && qty <= 1}>
              <i className="fas fa-minus" style={{ fontSize: 10 }} />
            </button>
            <span className="qty-display">{qty}</span>
            <button className="qty-btn" onClick={() => onQtyChange(item.id, 1)}>
              <i className="fas fa-plus" style={{ fontSize: 10 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== MENU SECTION =====================
function MenuSection({ cart, onToggle, onQtyChange }: {
  cart: Map<string, CartItem>;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, delta: number) => void;
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const allCats = ["All", ...categories];
  const filtered = activeCategory === "All" ? menuItems : menuItems.filter((m) => m.category === activeCategory);

  return (
    <section id="menu" className="section menu-bg">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-utensils" />
            Our Menu
          </div>
          <h2 className="section-title">Fresh & Delicious Food</h2>
          <p className="section-subtitle">
            Every meal is freshly prepared with quality ingredients at prices that won't break the bank.
          </p>
        </div>
        <div className="category-filter">
          {allCats.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="menu-grid">
          {filtered.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              cartItem={cart.get(item.id)}
              onToggle={onToggle}
              onQtyChange={onQtyChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== GALLERY =====================
const galleryImages = [
  { src: "https://images.pexels.com/photos/30119016/pexels-photo-30119016.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400", label: "Our Spreads" },
  { src: "https://images.pexels.com/photos/17486836/pexels-photo-17486836.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Traditional Meals" },
  { src: "https://images.pexels.com/photos/32612769/pexels-photo-32612769.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Beans & Rice" },
  { src: "https://images.pexels.com/photos/5041473/pexels-photo-5041473.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Crispy Chips" },
  { src: "https://images.pexels.com/photos/8696759/pexels-photo-8696759.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Hot Tea" },
  { src: "https://images.pexels.com/photos/20067069/pexels-photo-20067069.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400", label: "Snacks" },
  { src: "https://images.pexels.com/photos/20434734/pexels-photo-20434734.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Kenyan Cuisine" },
  { src: "https://images.pexels.com/photos/17486827/pexels-photo-17486827.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400", label: "Vegetables" },
];

function Gallery() {
  return (
    <section id="gallery" className="section gallery-bg">
      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">
            <i className="fas fa-images" />
            Gallery
          </div>
          <h2 className="section-title">Food That Inspires</h2>
          <p className="section-subtitle">
            A feast for the eyes before it's a feast for the stomach.
          </p>
        </div>
        <div className="gallery-grid">
          {galleryImages.map((img, i) => (
            <div key={i} className="gallery-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.src} alt={img.label} loading="lazy" />
              <div className="gallery-overlay">
                <i className="fas fa-eye" />
                <span>{img.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===================== ORDER SUMMARY =====================
function OrderSummary({ cart, grandTotal, isLoading, onPlaceOrder, onClearOrder }: {
  cart: Map<string, CartItem>;
  grandTotal: number;
  isLoading: boolean;
  onPlaceOrder: () => void;
  onClearOrder: () => void;
}) {
  const selectedItems = Array.from(cart.values()).filter((c) => c.selected);

  return (
    <div className="order-summary-card">
      <div className="summary-header">
        <div className="summary-title">
          <i className="fas fa-receipt" />
          Order Summary
        </div>
        <div className="summary-subtitle">
          {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
        </div>
      </div>

      {selectedItems.length === 0 ? (
        <div className="summary-empty">
          <i className="fas fa-shopping-basket" />
          <p>No items selected yet.</p>
          <p style={{ marginTop: 4, fontSize: 12 }}>Check items from the menu above.</p>
        </div>
      ) : (
        <div className="summary-items">
          {selectedItems.map(({ item, quantity }) => (
            <div key={item.id} className="summary-item">
              <span className="summary-item-name">{item.name}</span>
              <span className="summary-item-qty">×{quantity}</span>
              <span className="summary-item-price">KSh {(item.price * quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="summary-total">
          <div className="total-row">
            <span>Subtotal ({selectedItems.reduce((a, c) => a + c.quantity, 0)} items)</span>
            <span>KSh {grandTotal.toLocaleString()}</span>
          </div>
          <div className="total-grand">
            <span className="total-grand-label">GRAND TOTAL</span>
            <span className="total-grand-amount">KSh {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="summary-footer">
        <button
          className="btn-place-order"
          onClick={onPlaceOrder}
          disabled={isLoading || selectedItems.length === 0}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              Placing Order...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle" />
              PLACE ORDER
            </>
          )}
        </button>
        {selectedItems.length > 0 && (
          <button className="btn-clear-order" onClick={onClearOrder}>
            <i className="fas fa-trash-alt" />
            CLEAR ORDER
          </button>
        )}
      </div>
    </div>
  );
}

// ===================== M-PESA CARD =====================
function MpesaCard({
  grandTotal,
  mpesaPaid, setMpesaPaid,
  confirmCode, setConfirmCode,
  amountPaid, setAmountPaid,
  payDate, setPayDate,
  payTime, setPayTime,
}: {
  grandTotal: number;
  mpesaPaid: boolean; setMpesaPaid: (v: boolean) => void;
  confirmCode: string; setConfirmCode: (v: string) => void;
  amountPaid: string; setAmountPaid: (v: string) => void;
  payDate: string; setPayDate: (v: string) => void;
  payTime: string; setPayTime: (v: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyNumber = () => {
    navigator.clipboard.writeText("0713851716").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="mpesa-card">
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: 12,
            padding: "8px 16px",
            fontSize: 22,
            fontWeight: 900,
          }}>📱</div>
          <div>
            <div className="mpesa-logo">M-PESA</div>
            <div className="mpesa-subtitle">Pochi la Biashara – SPANISH CAFE</div>
          </div>
        </div>

        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Pochi la Biashara Number</div>
        <div className="mpesa-number-wrap">
          <span className="mpesa-number">0713 851 716</span>
          <button className="copy-btn" onClick={copyNumber}>
            <i className={`fas ${copied ? "fa-check" : "fa-copy"}`} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid rgba(255,255,255,0.25)",
        }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>Amount to Pay:</span>
          <span style={{ fontSize: 22, fontWeight: 900 }}>KSh {grandTotal.toLocaleString()}</span>
        </div>

        <ol className="mpesa-steps">
          {[
            "Open M-PESA on your phone",
            "Select Pochi la Biashara",
            "Enter number: 0713851716",
            `Pay KSh ${grandTotal.toLocaleString()}`,
            "Note your confirmation code",
            "Return here to complete order",
          ].map((step, i) => (
            <li key={i}>
              <span className="mpesa-step-num">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className="mpesa-confirmation">
          <label className="mpesa-paid-check">
            <input
              type="checkbox"
              checked={mpesaPaid}
              onChange={(e) => setMpesaPaid(e.target.checked)}
            />
            <label style={{ cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
              ✅ I have completed the M-PESA payment
            </label>
          </label>

          <input
            className="mpesa-input"
            type="text"
            placeholder="M-PESA Confirmation Code (e.g. QJX7AHG7FP)"
            value={confirmCode}
            onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
            maxLength={12}
          />
          <div className="mpesa-amount-row">
            <input
              className="mpesa-input"
              type="number"
              placeholder="Amount Paid (KSh)"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <input
              className="mpesa-input"
              type="date"
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <input
              className="mpesa-input"
              type="time"
              value={payTime}
              onChange={(e) => setPayTime(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== ORDER FORM =====================
function OrderForm({
  cart,
  grandTotal,
  isLoading,
  orderResult,
  onPlaceOrder,
  onClearOrder,
}: {
  cart: Map<string, CartItem>;
  grandTotal: number;
  isLoading: boolean;
  orderResult: OrderResult | null;
  onPlaceOrder: (formData: Record<string, unknown>) => void;
  onClearOrder: () => void;
}) {
  const getNowDate = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const getNowTime = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [tableNum, setTableNum] = useState("");
  const [orderType, setOrderType] = useState("eat_in");
  const [payment, setPayment] = useState("cash");
  const [prefDate, setPrefDate] = useState(getNowDate);
  const [prefTime, setPrefTime] = useState(getNowTime);
  const [instructions, setInstructions] = useState("");
  const [mpesaPaid, setMpesaPaid] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [payDate, setPayDate] = useState(getNowDate);
  const [payTime, setPayTime] = useState(getNowTime);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live clock: auto-update date/time every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrefDate(getNowDate());
      setPrefTime(getNowTime());
      setPayDate(getNowDate());
      setPayTime(getNowTime());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full name is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!phone.trim().match(/^\+?[\d\s\-]{7,15}$/)) newErrors.phone = "Enter a valid phone number.";
    const selectedItems = Array.from(cart.values()).filter((c) => c.selected);
    if (selectedItems.length === 0) newErrors.items = "Please select at least one food item from the menu.";
    if (orderType === "delivery" && !address.trim()) newErrors.address = "Delivery address is required.";
    if (payment === "mpesa") {
      if (!mpesaPaid) newErrors.mpesaPaid = "Please confirm you've made the M-PESA payment.";
      if (!confirmCode.trim()) newErrors.confirmCode = "M-PESA confirmation code is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, phone, cart, orderType, address, payment, mpesaPaid, confirmCode]);

  const handleSubmit = () => {
    if (!validate()) {
      document.querySelector(".form-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const selectedItems = Array.from(cart.values())
      .filter((c) => c.selected)
      .map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity,
        subtotal: item.price * quantity,
      }));

    onPlaceOrder({
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      deliveryAddress: address,
      tableNumber: tableNum,
      orderType,
      paymentMethod: payment,
      preferredDate: prefDate,
      preferredTime: prefTime,
      specialInstructions: instructions,
      mpesaConfirmationCode: confirmCode,
      mpesaAmountPaid: amountPaid ? Number(amountPaid) : null,
      mpesaPaymentDate: payDate,
      mpesaPaymentTime: payTime,
      mpesaPaid,
      items: selectedItems,
    });
  };

  const InputError = ({ field }: { field: string }) =>
    errors[field] ? (
      <div className="form-error">
        <i className="fas fa-exclamation-circle" />
        {errors[field]}
      </div>
    ) : null;

  return (
    <div className="order-form-card">
      {/* Customer Details */}
      <div className="form-section">
        <div className="form-section-title">
          <i className="fas fa-user-circle" style={{ color: "var(--orange)" }} />
          Customer Details
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name <span>*</span></label>
            <input
              className={`form-input ${errors.name ? "error" : ""}`}
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
            />
            <InputError field="name" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number <span>*</span></label>
            <input
              className={`form-input ${errors.phone ? "error" : ""}`}
              type="tel"
              placeholder="+254700000000"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
            />
            <InputError field="phone" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Table Number</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Table 5 (optional)"
              value={tableNum}
              onChange={(e) => setTableNum(e.target.value)}
            />
          </div>
        </div>
        {orderType === "delivery" && (
          <div className="form-group">
            <label className="form-label">Delivery Address <span>*</span></label>
            <input
              className={`form-input ${errors.address ? "error" : ""}`}
              type="text"
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }}
            />
            <InputError field="address" />
          </div>
        )}
      </div>

      {/* Order Details */}
      <div className="form-section" style={{ paddingTop: 20 }}>
        <div className="form-section-title">
          <i className="fas fa-clipboard-list" style={{ color: "var(--orange)" }} />
          Order Details
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Order Type <span>*</span></label>
            <select
              className="form-select"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="eat_in">🍽️ Eat In</option>
              <option value="take_away">🛍️ Take Away</option>
              <option value="delivery">🛵 Delivery</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method <span>*</span></label>
            <select
              className="form-select"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              <option value="cash">💵 Cash</option>
              <option value="card">💳 Card</option>
              <option value="mpesa">📱 M-PESA (Pochi la Biashara)</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Preferred Date
              <span style={{
                marginLeft: 8,
                background: "var(--green)",
                color: "#fff",
                borderRadius: 50,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                verticalAlign: "middle",
              }}>
                <i className="fas fa-clock" style={{ marginRight: 3 }} />
                AUTO
              </span>
            </label>
            <input
              className="form-input"
              type="date"
              value={prefDate}
              onChange={(e) => setPrefDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Preferred Time
              <span style={{
                marginLeft: 8,
                background: "var(--orange)",
                color: "#fff",
                borderRadius: 50,
                padding: "2px 8px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.5,
                verticalAlign: "middle",
              }}>
                <i className="fas fa-sync-alt" style={{ marginRight: 3 }} />
                LIVE
              </span>
            </label>
            <input
              className="form-input"
              type="time"
              value={prefTime}
              onChange={(e) => setPrefTime(e.target.value)}
            />
          </div>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: -8,
          marginBottom: 8,
          fontSize: 11,
          color: "var(--text-gray)",
        }}>
          <i className="fas fa-info-circle" style={{ color: "var(--orange)" }} />
          Date and time are automatically set to the current moment. You can change them if needed.
        </div>
        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            className="form-textarea"
            placeholder="Any special requests, allergies, or notes..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        {payment === "mpesa" && (
          <>
            <MpesaCard
              grandTotal={grandTotal}
              mpesaPaid={mpesaPaid} setMpesaPaid={setMpesaPaid}
              confirmCode={confirmCode} setConfirmCode={setConfirmCode}
              amountPaid={amountPaid} setAmountPaid={setAmountPaid}
              payDate={payDate} setPayDate={setPayDate}
              payTime={payTime} setPayTime={setPayTime}
            />
            {errors.mpesaPaid && <div className="form-error" style={{ marginTop: 8 }}><i className="fas fa-exclamation-circle" />{errors.mpesaPaid}</div>}
            {errors.confirmCode && <div className="form-error"><i className="fas fa-exclamation-circle" />{errors.confirmCode}</div>}
          </>
        )}
      </div>

      {/* Item Selection Validation Error */}
      {errors.items && (
        <div style={{ padding: "0 28px 16px" }}>
          <div className="form-error" style={{ fontSize: 14, padding: "10px 16px", background: "#fff5f5", borderRadius: 8, border: "1px solid #fca5a5" }}>
            <i className="fas fa-exclamation-triangle" />
            {errors.items}
          </div>
        </div>
      )}

      {/* Action Buttons (mobile) */}
      <div style={{ padding: "0 28px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          className="btn-place-order"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              Placing Order...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle" />
              PLACE ORDER
            </>
          )}
        </button>
        <button className="btn-clear-order" onClick={onClearOrder}>
          <i className="fas fa-trash-alt" />
          CLEAR ORDER
        </button>
      </div>

      {/* Order Result */}
      {orderResult && (
        <div style={{ padding: "0 28px 28px" }}>
          {orderResult.success ? (
            <div className="order-result order-result-success">
              <div className="order-result-icon">✅</div>
              <div className="order-result-title">
                {orderResult.delivery === "whatsapp" ? "Order Ready to Send!" : "Order Placed Successfully!"}
              </div>
              <div className="order-result-msg">
                <strong>Thank you for ordering from SPANISH CAFE.</strong><br />
                {orderResult.delivery === "whatsapp" ? (
                  <>
                    Your order summary is ready. Tap the WhatsApp button below to send it to
                    the café so the kitchen can start preparing it.
                  </>
                ) : (
                  <>Your order has been received and is now being prepared.</>
                )}
                <br />
                {orderResult.orderNumber && (
                  <span>Order Number: <strong style={{ color: "var(--green)" }}>{orderResult.orderNumber}</strong></span>
                )}
              </div>
              {orderResult.whatsappUrl && (
                <a href={orderResult.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  <i className="fab fa-whatsapp" style={{ fontSize: 20 }} />
                  {orderResult.delivery === "whatsapp" ? "Send Order via WhatsApp" : "Send Copy via WhatsApp"}
                </a>
              )}
            </div>
          ) : (
            <div className="order-result order-result-error">
              <div className="order-result-icon">❌</div>
              <div className="order-result-title">Order Failed</div>
              <div className="order-result-msg">
                {orderResult.message || "Unable to send your order. Please try again."}
              </div>
              <button className="btn-retry" onClick={() => onPlaceOrder({})}>
                <i className="fas fa-redo" />
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===================== CONTACT =====================
function Contact() {
  return (
    <section id="contact" className="section contact-bg">
      <div className="section-container">
        <div className="contact-grid">
          <div>
            <div className="section-badge" style={{ background: "rgba(230,126,34,0.2)", color: "var(--orange)" }}>
              <i className="fas fa-phone-alt" />
              Get In Touch
            </div>
            <h2 className="contact-info-title">Visit or Contact<br />SPANISH CAFE</h2>
            <p className="contact-info-desc">
              We&apos;re always happy to serve you. Whether you want to visit, call, or order online — we&apos;re here for you every day of the week.
            </p>
            <div className="contact-items">
              {[
                { icon: "fa-phone", label: "Phone / WhatsApp", value: "+254 110 666 172" },
                { icon: "fa-envelope", label: "Email Address", value: "ddeltaj@gmail.com" },
                { icon: "fa-clock", label: "Opening Hours", value: "6:00 AM – 10:00 PM" },
                { icon: "fa-calendar-alt", label: "Operating Days", value: "Monday – Sunday" },
              ].map((item) => (
                <div key={item.label} className="contact-item">
                  <div className="contact-item-icon">
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div>
                    <div className="contact-item-label">{item.label}</div>
                    <div className="contact-item-value">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-hours-card">
            <div className="hours-icon">⏰</div>
            <div className="hours-title">Opening Hours</div>
            {[
              ["Monday", "6:00 AM – 10:00 PM"],
              ["Tuesday", "6:00 AM – 10:00 PM"],
              ["Wednesday", "6:00 AM – 10:00 PM"],
              ["Thursday", "6:00 AM – 10:00 PM"],
              ["Friday", "6:00 AM – 10:00 PM"],
              ["Saturday", "6:00 AM – 10:00 PM"],
              ["Sunday", "6:00 AM – 10:00 PM"],
            ].map(([day, time]) => (
              <div key={day} className="hours-row">
                <span className="hours-day">{day}</span>
                <span className="hours-time">{time}</span>
              </div>
            ))}
            <div style={{
              marginTop: 20,
              background: "rgba(230,126,34,0.2)",
              borderRadius: 10,
              padding: "10px 16px",
              color: "var(--orange)",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <i className="fas fa-circle" style={{ fontSize: 8, color: "#2ecc71" }} />
              We&apos;re Open Right Now!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===================== FOOTER =====================
function Footer() {
  return (
    <>
      <hr className="divider" />
      <footer className="footer">
        <div className="footer-text">
          <p style={{ fontSize: 22, marginBottom: 6 }}>☕</p>
          <p>
            © 2026 <span className="footer-brand">SPANISH CAFE</span>
          </p>
          <p>Serving Fresh Food Every Day ❤️</p>
          <p style={{ marginTop: 8 }}>Fresh • Affordable • Delicious</p>
          <p style={{ marginTop: 8, fontSize: 12 }}>
            📍 Nairobi, Kenya &nbsp;|&nbsp; 📞 +254 110 666 172 &nbsp;|&nbsp; ✉️ ddeltaj@gmail.com
          </p>
        </div>
      </footer>
    </>
  );
}

// ===================== FLOATING BUTTONS =====================
function FloatingButtons({ whatsappUrl }: { whatsappUrl: string }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handler = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <a
        href={whatsappUrl || `https://wa.me/254110666172`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-btn whatsapp-float"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <i className="fab fa-whatsapp" />
        <span className="whatsapp-badge">1</span>
      </a>
      <button
        className={`floating-btn scroll-top-float ${showScrollTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll to top"
        title="Back to top"
      >
        <i className="fas fa-arrow-up" />
      </button>
    </>
  );
}

// ===================== MAIN PAGE =====================
export default function Home() {
  const [cart, setCart] = useState<Map<string, CartItem>>(() => {
    const initial = new Map<string, CartItem>();
    menuItems.forEach((item) => {
      initial.set(item.id, { item, quantity: 1, selected: false });
    });
    return initial;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState("");
  const toastIdRef = useRef(0);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        next.set(id, { ...existing, selected: !existing.selected });
      }
      return next;
    });
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      const next = new Map(prev);
      const existing = next.get(id);
      if (existing) {
        const newQty = Math.max(1, existing.quantity + delta);
        next.set(id, { ...existing, quantity: newQty, selected: delta > 0 ? true : existing.selected });
      }
      return next;
    });
  }, []);

  const clearOrder = useCallback(() => {
    setCart((prev) => {
      const next = new Map(prev);
      next.forEach((v, k) => next.set(k, { ...v, quantity: 1, selected: false }));
      return next;
    });
    setOrderResult(null);
    addToast("info", "Order cleared.");
  }, [addToast]);

  const grandTotal = Array.from(cart.values())
    .filter((c) => c.selected)
    .reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  const cartCount = Array.from(cart.values()).filter((c) => c.selected).length;

  const placeOrder = useCallback(async (formData: Record<string, unknown>) => {
    if (Object.keys(formData).length === 0) return; // retry without data
    setIsLoading(true);
    setOrderResult(null);

    try {
      // On a Node host the API saves the order + emails the café. On static
      // hosting (GitHub Pages) that endpoint does not exist, so the order is
      // completed in the browser and handed to WhatsApp instead.
      let data: OrderResult | null = null;
      if (ORDERS_API_ENDPOINT) {
        try {
          const res = await fetch(ORDERS_API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });
          const contentType = res.headers.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            data = (await res.json()) as OrderResult;
          }
        } catch {
          data = null;
        }
      }

      if (!data) {
        data = createOrderLocally(formData as OrderPayload);
      }

      if (data.success) {
        setOrderResult(data);
        setLastWhatsappUrl(data.whatsappUrl ?? "");
        addToast(
          "success",
          data.delivery === "whatsapp"
            ? `✅ Order ${data.orderNumber} ready — send it on WhatsApp!`
            : `🎉 Order ${data.orderNumber} placed successfully!`,
        );
        // Clear cart
        setCart((prev) => {
          const next = new Map(prev);
          next.forEach((v, k) => next.set(k, { ...v, quantity: 1, selected: false }));
          return next;
        });
        document.querySelector("#order")?.scrollIntoView({ behavior: "smooth" });
      } else {
        setOrderResult({ success: false, message: data.message || "Failed to place order." });
        addToast("error", data.message || "Failed to place order.");
      }
    } catch {
      setOrderResult({ success: false, message: "Network error. Please check your connection and try again." });
      addToast("error", "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Navbar cartCount={cartCount} />
      <Hero />
      <StatsBar />
      <MenuSection cart={cart} onToggle={toggleItem} onQtyChange={changeQty} />
      <Gallery />

      {/* ORDER SECTION */}
      <section id="order" className="section order-bg">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">
              <i className="fas fa-shopping-cart" />
              Place Your Order
            </div>
            <h2 className="section-title">Order Online</h2>
            <p className="section-subtitle">
              Fill in your details below. Once you place your order, our team receives it instantly.
            </p>
          </div>

          <div className="order-layout">
            <OrderForm
              cart={cart}
              grandTotal={grandTotal}
              isLoading={isLoading}
              orderResult={orderResult}
              onPlaceOrder={placeOrder}
              onClearOrder={clearOrder}
            />
            <OrderSummary
              cart={cart}
              grandTotal={grandTotal}
              isLoading={isLoading}
              onPlaceOrder={() => {
                // Trigger form submit via button in form
                document.querySelector<HTMLButtonElement>(".btn-place-order")?.click();
              }}
              onClearOrder={clearOrder}
            />
          </div>
        </div>
      </section>

      <Contact />
      <Footer />
      <FloatingButtons whatsappUrl={lastWhatsappUrl} />
    </>
  );
}
