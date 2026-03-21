#!/usr/bin/env python3
"""Generate Aaro Project Analysis Report as PDF."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Colors ──
PRIMARY = HexColor("#1a1a2e")
ACCENT = HexColor("#e94560")
ACCENT_LIGHT = HexColor("#fef2f4")
BLUE = HexColor("#0066cc")
BLUE_LIGHT = HexColor("#e8f4fd")
GREEN = HexColor("#16a34a")
GREEN_LIGHT = HexColor("#f0fdf4")
ORANGE = HexColor("#ea580c")
ORANGE_LIGHT = HexColor("#fff7ed")
RED = HexColor("#dc2626")
RED_LIGHT = HexColor("#fef2f2")
GRAY = HexColor("#6b7280")
GRAY_LIGHT = HexColor("#f9fafb")
DARK = HexColor("#111827")
BORDER = HexColor("#e5e7eb")

WIDTH, HEIGHT = A4
MARGIN = 20 * mm

output_path = "/sessions/pensive-upbeat-wozniak/mnt/Aaro/Aaro_Project_Analysis.pdf"


# ── Styles ──
def get_styles():
    return {
        "title": ParagraphStyle(
            "Title", fontSize=28, leading=34, textColor=PRIMARY,
            fontName="Helvetica-Bold", spaceAfter=4 * mm,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle", fontSize=12, leading=16, textColor=GRAY,
            fontName="Helvetica", spaceAfter=8 * mm,
        ),
        "h1": ParagraphStyle(
            "H1", fontSize=18, leading=24, textColor=PRIMARY,
            fontName="Helvetica-Bold", spaceBefore=10 * mm, spaceAfter=4 * mm,
        ),
        "h2": ParagraphStyle(
            "H2", fontSize=14, leading=18, textColor=DARK,
            fontName="Helvetica-Bold", spaceBefore=6 * mm, spaceAfter=3 * mm,
        ),
        "h3": ParagraphStyle(
            "H3", fontSize=11, leading=15, textColor=HexColor("#374151"),
            fontName="Helvetica-Bold", spaceBefore=4 * mm, spaceAfter=2 * mm,
        ),
        "body": ParagraphStyle(
            "Body", fontSize=9.5, leading=14, textColor=DARK,
            fontName="Helvetica", alignment=TA_JUSTIFY, spaceAfter=2 * mm,
        ),
        "body_bold": ParagraphStyle(
            "BodyBold", fontSize=9.5, leading=14, textColor=DARK,
            fontName="Helvetica-Bold", spaceAfter=2 * mm,
        ),
        "small": ParagraphStyle(
            "Small", fontSize=8, leading=11, textColor=GRAY,
            fontName="Helvetica",
        ),
        "code": ParagraphStyle(
            "Code", fontSize=8, leading=11, textColor=HexColor("#1e293b"),
            fontName="Courier", backColor=GRAY_LIGHT, spaceAfter=2 * mm,
            leftIndent=4 * mm, rightIndent=4 * mm,
            borderPadding=(2 * mm, 3 * mm, 2 * mm, 3 * mm),
        ),
        "bullet": ParagraphStyle(
            "Bullet", fontSize=9.5, leading=14, textColor=DARK,
            fontName="Helvetica", leftIndent=8 * mm, bulletIndent=3 * mm,
            spaceAfter=1.5 * mm,
        ),
        "issue_title": ParagraphStyle(
            "IssueTitle", fontSize=10, leading=14, textColor=DARK,
            fontName="Helvetica-Bold", spaceAfter=1 * mm,
        ),
        "issue_body": ParagraphStyle(
            "IssueBody", fontSize=9, leading=13, textColor=HexColor("#374151"),
            fontName="Helvetica", leftIndent=4 * mm, spaceAfter=1 * mm,
            alignment=TA_JUSTIFY,
        ),
        "footer": ParagraphStyle(
            "Footer", fontSize=7, leading=9, textColor=GRAY,
            fontName="Helvetica", alignment=TA_CENTER,
        ),
    }


# ── Page Template ──
def draw_page(canvas_obj, doc):
    canvas_obj.saveState()
    # Top bar
    canvas_obj.setFillColor(PRIMARY)
    canvas_obj.rect(0, HEIGHT - 8 * mm, WIDTH, 8 * mm, fill=True, stroke=False)
    # Footer
    canvas_obj.setFillColor(GRAY)
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.drawCentredString(WIDTH / 2, 10 * mm, f"Aaro Project Analysis Report  |  Page {doc.page}")
    canvas_obj.drawRightString(WIDTH - MARGIN, 10 * mm, "March 2026")
    # Bottom line
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(MARGIN, 15 * mm, WIDTH - MARGIN, 15 * mm)
    canvas_obj.restoreState()


def draw_first_page(canvas_obj, doc):
    canvas_obj.saveState()
    # Full header block
    canvas_obj.setFillColor(PRIMARY)
    canvas_obj.rect(0, HEIGHT - 70 * mm, WIDTH, 70 * mm, fill=True, stroke=False)
    # Accent stripe
    canvas_obj.setFillColor(ACCENT)
    canvas_obj.rect(0, HEIGHT - 72 * mm, WIDTH, 2 * mm, fill=True, stroke=False)
    # Title text
    canvas_obj.setFillColor(white)
    canvas_obj.setFont("Helvetica-Bold", 32)
    canvas_obj.drawString(MARGIN + 5 * mm, HEIGHT - 35 * mm, "AARO")
    canvas_obj.setFont("Helvetica", 14)
    canvas_obj.drawString(MARGIN + 5 * mm, HEIGHT - 45 * mm, "Full Project Analysis Report")
    canvas_obj.setFont("Helvetica", 10)
    canvas_obj.setFillColor(HexColor("#94a3b8"))
    canvas_obj.drawString(MARGIN + 5 * mm, HEIGHT - 57 * mm, "E-Commerce Platform  |  React + Node.js + MongoDB")
    canvas_obj.drawString(MARGIN + 5 * mm, HEIGHT - 64 * mm, "March 15, 2026  |  Prepared for Kavi")
    # Footer
    canvas_obj.setFillColor(GRAY)
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.drawCentredString(WIDTH / 2, 10 * mm, "Aaro Project Analysis Report  |  Page 1")
    canvas_obj.restoreState()


# ── Helper Builders ──
def severity_badge(severity):
    colors = {
        "Critical": ("#dc2626", "#fef2f2"),
        "High": ("#ea580c", "#fff7ed"),
        "Medium": ("#ca8a04", "#fefce8"),
        "Low": ("#6b7280", "#f9fafb"),
    }
    fg, bg = colors.get(severity, ("#6b7280", "#f9fafb"))
    return f'<font color="{fg}"><b>[{severity}]</b></font>'


def issue_block(styles, num, title, severity, file_path, description, impact):
    elements = []
    sev = severity_badge(severity)
    elements.append(Paragraph(
        f"{sev}  <b>#{num}. {title}</b>",
        styles["issue_title"]
    ))
    if file_path:
        elements.append(Paragraph(
            f'<font color="#6b7280" size="8">File: {file_path}</font>',
            styles["small"]
        ))
    elements.append(Spacer(1, 1 * mm))
    elements.append(Paragraph(description, styles["issue_body"]))
    if impact:
        elements.append(Paragraph(
            f'<font color="#6b7280"><i>Impact: {impact}</i></font>',
            styles["issue_body"]
        ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.3, color=BORDER))
    elements.append(Spacer(1, 2 * mm))
    return KeepTogether(elements)


def stat_table(styles, data):
    """Create a summary stats table."""
    t = Table(data, colWidths=[45 * mm, 30 * mm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BACKGROUND", (0, 1), (-1, -1), GRAY_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 3 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
    ]))
    return t


def summary_table(styles):
    """Create the issues overview table."""
    data = [
        ["Category", "Critical", "High", "Medium", "Low", "Total"],
        ["Frontend", "1", "8", "19", "2", "30"],
        ["Backend", "4", "6", "8", "7", "25"],
        ["Total", "5", "14", "27", "9", "55"],
    ]
    col_w = [35 * mm, 22 * mm, 22 * mm, 22 * mm, 22 * mm, 22 * mm]
    t = Table(data, colWidths=col_w)
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BACKGROUND", (0, -1), (-1, -1), HexColor("#f1f5f9")),
        ("BACKGROUND", (1, 1), (1, -2), RED_LIGHT),
        ("BACKGROUND", (2, 1), (2, -2), ORANGE_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (0, -1), 3 * mm),
    ]))
    return t


def tech_stack_table(styles):
    data = [
        ["Layer", "Technology"],
        ["Frontend", "React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui"],
        ["Forms", "react-hook-form + Zod validation"],
        ["Backend", "Express.js v5, Node.js 20+"],
        ["Database", "MongoDB + Mongoose ODM"],
        ["Auth", "JWT (15min) + HttpOnly refresh cookies (7d)"],
        ["Images", "Cloudinary (with local disk fallback)"],
        ["Deployment", "Render.com (with keep-alive pinger)"],
        ["Testing", "Vitest + Testing Library (minimal coverage)"],
    ]
    col_w = [30 * mm, 115 * mm]
    t = Table(data, colWidths=col_w)
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("BACKGROUND", (0, 1), (0, -1), GRAY_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("ROWBACKGROUNDS", (1, 1), (-1, -1), [white, GRAY_LIGHT]),
    ]))
    return t


# ── Main Build ──
def build_report():
    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=25 * mm, bottomMargin=20 * mm,
    )
    styles = get_styles()
    story = []

    # ═══════════════════════════════════════════════
    # COVER / INTRO (after the header drawn by first page template)
    # ═══════════════════════════════════════════════
    story.append(Spacer(1, 55 * mm))  # Space below the cover header

    story.append(Paragraph("Executive Summary", styles["h1"]))
    story.append(Paragraph(
        "This report presents a comprehensive code audit of the <b>Aaro</b> e-commerce platform, "
        "covering both the React/TypeScript frontend and the Node.js/Express backend. The analysis "
        "identified <b>55 issues</b> across security, performance, code quality, UX, and architecture. "
        "Of these, <b>5 are critical</b> and <b>14 are high severity</b>, requiring immediate attention.",
        styles["body"]
    ))
    story.append(Spacer(1, 3 * mm))

    # Summary table
    story.append(summary_table(styles))
    story.append(Spacer(1, 6 * mm))

    story.append(KeepTogether([
        Paragraph("Project Overview", styles["h1"]),
        Paragraph(
            "Aaro is a full-stack e-commerce application for selling phones, laptops, and accessories. "
            "It targets the Indian market with WhatsApp-based order confirmation. The codebase spans "
            "~10,400 lines of frontend TypeScript/React and a well-structured Express.js backend with "
            "11 MongoDB collections, JWT authentication, and Cloudinary image management.",
            styles["body"]
        ),
        Spacer(1, 3 * mm),
        tech_stack_table(styles),
    ]))

    # ═══════════════════════════════════════════════
    # STRENGTHS
    # ═══════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Strengths", styles["h1"]))

    strengths = [
        ("<b>Solid Authentication Architecture</b> - In-memory JWT storage with HttpOnly refresh cookie rotation. "
         "Bcrypt at 12 rounds. Separate access/refresh token lifecycle."),
        ("<b>Comprehensive Admin Panel</b> - 10 management tabs covering products, variants, categories, brands, "
         "orders, reviews, offers, banners, contact settings, and user management."),
        ("<b>Production-Ready Infrastructure</b> - Helmet CSP headers, MongoDB sanitization, rate limiting, "
         "gzip compression, graceful shutdown, health checks, and keep-alive pinger for Render."),
        ("<b>Good Performance Foundations</b> - Lazy-loaded routes, code splitting with manual Rollup chunks, "
         "debounced search, lean Mongoose queries, and route-level cache headers."),
        ("<b>Thorough Data Modeling</b> - 40+ MongoDB indexes, unique constraints on slugs/SKUs, "
         "compound indexes on frequently filtered fields, cascade delete patterns."),
        ("<b>Polished UX</b> - Branded loader animation, error boundaries, scroll-to-top, responsive "
         "mobile navigation, offer popup system, and WhatsApp deep-link integration."),
    ]
    for s in strengths:
        story.append(Paragraph(f"&#8226;  {s}", styles["bullet"]))

    # ═══════════════════════════════════════════════
    # CRITICAL ISSUES
    # ═══════════════════════════════════════════════
    story.append(Paragraph("Critical Issues (5)", styles["h1"]))
    story.append(Paragraph(
        "These issues can cause data corruption, financial loss, or security breaches and should be fixed immediately.",
        styles["body"]
    ))
    story.append(Spacer(1, 2 * mm))

    story.append(issue_block(styles, 1,
        "Token Refresh Race Condition",
        "Critical",
        "src/context/DataContext.tsx",
        "When multiple API calls receive 401 simultaneously, each triggers an independent token refresh. "
        "This creates duplicate refresh requests that can corrupt auth state, invalidate tokens, and "
        "log users out unexpectedly.",
        "Auth state corruption, random logouts, failed API calls"
    ))

    story.append(issue_block(styles, 2,
        "Order Total Amount Can Be Manipulated",
        "Critical",
        "server/routes/orders.js",
        "The order endpoint accepts totalAmount from the client. While it computes a server-side total, "
        "it does not strictly enforce it. A client could submit manipulated prices in the items array "
        "since item prices are never validated against actual product/variant prices in the database.",
        "Customers can place orders at arbitrary prices, causing financial loss"
    ))

    story.append(issue_block(styles, 3,
        "Only Admins Can Post Reviews",
        "Critical",
        "server/routes/reviews.js",
        "The review creation endpoint requires isAdmin middleware, meaning regular customers cannot "
        "submit reviews. Combined with the auto-generation of 3 fake 5-star reviews per new product, "
        "the review system is entirely artificial.",
        "No genuine customer reviews possible; all reviews are admin-fabricated"
    ))

    story.append(issue_block(styles, 4,
        "No Stock Validation or Inventory Management",
        "Critical",
        "server/routes/orders.js",
        "Order creation never checks if product variants have sufficient stock, nor does it decrement "
        "stock on order placement. Variants track stock counts but the values are never enforced, "
        "allowing unlimited overselling.",
        "Overselling products, accepting orders for out-of-stock items"
    ))

    story.append(issue_block(styles, 5,
        "Variant Price Integrity Not Validated",
        "Critical",
        "server/routes/products.js",
        "When creating or updating variants, there is no validation that sale price is less than or "
        "equal to originalPrice. This can result in negative discount displays and pricing confusion.",
        "Negative discounts shown to customers, pricing inconsistencies"
    ))

    # ═══════════════════════════════════════════════
    # HIGH SEVERITY
    # ═══════════════════════════════════════════════
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("High Severity Issues (14)", styles["h1"]))

    high_issues = [
        ("N+1 Query Problem in Product Grid", "src/components/ProductCard.tsx",
         "Each ProductCard independently calls fetchVariants() if variants are not embedded. A grid of 20 products triggers 20 separate API calls, causing severe network congestion and slow page loads.",
         "Page load times multiply linearly with product count"),

        ("Excessive 'any' Types Defeat TypeScript Safety", "Multiple frontend files",
         "Critical functions like mapProduct, mapBrand, getLowestPrice, and variant handling use 'any' types extensively. Type errors hide at compile time and surface as runtime crashes.",
         "Runtime errors that TypeScript should have caught at build time"),

        ("Profile Email Update Allows Duplicates", "server/routes/auth.js",
         "The profile update endpoint allows changing email without checking for duplicates against other users. Race conditions can create two users with the same email.",
         "Duplicate email accounts, login confusion, auth bypass"),

        ("IDOR: Admin Can Deactivate Themselves", "server/routes/users.js",
         "The user toggle endpoint prevents modifying other admins but does not prevent an admin from deactivating their own account, potentially locking out the only admin.",
         "Complete loss of admin access"),

        ("Review Rating NaN Bug", "server/routes/reviews.js",
         "In the review update handler, the rating fallback references an undefined variable. If no reviews remain after an update, the product rating becomes NaN in the database.",
         "Product displays NaN rating, breaks sorting and filtering"),

        ("Missing Pagination on User List", "server/routes/users.js",
         "GET /api/admin/users returns ALL users without pagination. With thousands of users, this causes memory bloat, slow responses, and potential OOM crashes.",
         "Server crashes on large user bases"),

        ("No CSRF Protection on State-Changing Endpoints", "server/routes/auth.js",
         "Admin email/password change endpoints lack dedicated rate limiters or CSRF tokens. The global rate limiter is insufficient for these critical operations.",
         "Brute-force attacks on admin credentials"),

        ("Unsafe JSON.parse in Cart Initialization", "src/context/CartContext.tsx",
         "Cart data from localStorage is parsed without structure validation. Corrupted or tampered cart data can inject unexpected objects into the application state.",
         "Application crashes or unexpected behavior from malformed cart data"),

        ("Missing Error Boundary Coverage for Lazy Routes", "src/App.tsx",
         "Lazy-loaded route components wrapped in Suspense may throw errors during rendering that are not caught by the outer ErrorBoundary, resulting in white screens.",
         "White screen of death on route loading failures"),

        ("localStorage Token Fallback Creates Security Gap", "src/context/DataContext.tsx",
         "getToken() falls back to localStorage when the in-memory token is null. This undermines the security benefit of in-memory token storage and can use expired tokens.",
         "Stale/expired tokens used for authentication"),

        ("Shop Page Filter Sync Breaks on Browser Navigation", "src/pages/Shop.tsx",
         "URL parameters sync on state changes but manual URL edits or browser back/forward do not update filter state, causing UI and URL to become out of sync.",
         "Broken browser navigation, confusing filter state"),

        ("Heavy useMemo Dependencies in Shop Page", "src/pages/Shop.tsx",
         "Product filtering logic depends on 9+ state variables, causing recalculations on nearly every render. The memoization provides minimal benefit with this many dependencies.",
         "Sluggish Shop page performance, especially on mobile"),

        ("MongoDB Query Parameters Not Validated", "server/routes/products.js",
         "Category and brand query parameters are used directly in MongoDB filters without explicit enum validation. While mongo-sanitize handles body, query params receive less protection.",
         "Potential NoSQL injection via query parameters"),

        ("Unhandled Promise Rejection in Logo Fetching", "server/routes/brands.js",
         "The bulk logo fetch endpoint iterates brands sequentially. If brand.save() throws mid-loop, subsequent brands are skipped without logging or error recovery.",
         "Silent failures in brand logo updates"),
    ]

    for i, (title, fpath, desc, impact) in enumerate(high_issues, 6):
        story.append(issue_block(styles, i, title, "High", fpath, desc, impact))

    # ═══════════════════════════════════════════════
    # MEDIUM SEVERITY
    # ═══════════════════════════════════════════════
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Medium Severity Issues (27)", styles["h1"]))
    story.append(Paragraph(
        "These issues affect reliability, maintainability, and user experience but do not pose immediate critical risk.",
        styles["body"]
    ))
    story.append(Spacer(1, 2 * mm))

    medium_issues = [
        ("API error messages exposed to users", "DataContext.tsx - raw backend errors shown in toasts"),
        ("No loading states for cart operations", "Cart.tsx - add/remove/update have no visual feedback"),
        ("Session storage used for order state", "OrderForm.tsx - multi-tab conflicts possible"),
        ("No cart validation before checkout", "OrderForm.tsx - items may be deleted/out of stock"),
        ("Missing image upload error feedback", "ImageUpload.tsx - silent failures on upload errors"),
        ("Navbar is a god component (471 lines)", "Navbar.tsx - handles search, menu, auth, responsive, profile"),
        ("Duplicate token refresh logic", "AuthContext + DataContext both implement refresh independently"),
        ("Missing API response type definitions", "api.ts - generic apiFetch mostly returns 'any'"),
        ("Cart key collisions possible", "Cart.tsx - empty color creates duplicate React keys"),
        ("Auth context initialization race", "AuthContext.tsx - DataProvider may load before auth resolves"),
        ("OfferPopup timer cleanup race", "OfferPopup.tsx - potential setState on unmounted component"),
        ("Prop drilling in Shop page", "Shop.tsx - quickViewProduct drilled through multiple levels"),
        ("Missing cleanup in search effects", "Navbar.tsx - not memoized, re-renders on every parent change"),
        ("Hardcoded API_URL repeated across files", "Multiple files import.meta.env.VITE_API_URL independently"),
        ("Order items schema is untyped", "Order.js - items: Array with no structure validation"),
        ("No MongoDB transactions for cascading deletes", "products.js - product + reviews + variants deleted separately"),
        ("Open redirect via banner links", "banners.js - link field accepts any URL without validation"),
        ("Auto-generated fake reviews", "products.js - 3 fake 5-star reviews created per new product"),
        ("No rate limiting on contact settings", "contactSettings.js - PUT endpoint uses only global limiter"),
        ("Upload rate limiter applied after file processing", "upload.js - multer runs before rate check"),
        ("Inconsistent cache-control headers", "Different endpoints use 60s vs 300s with no strategy"),
        ("Missing index for review aggregation", "reviews.js - $avg aggregation without compound index"),
        ("Gmail-only email restriction", "schemas.ts - enforces @gmail.com, blocks all other providers"),
        ("Price range filter can be inverted", "Shop.tsx - [max,min] range causes silent filter failure"),
        ("No pagination on admin order queries at scale", "orders.js - pagination exists but no max limit enforcement"),
        ("Mongoose lean queries skip virtuals", "Multiple - .lean() used everywhere, future virtuals will break"),
        ("Offer promo codes not unique", "Offer.js - code field has no uniqueness constraint"),
    ]

    # Render as compact table with text wrapping
    cell_style = ParagraphStyle("Cell", fontSize=8, leading=10, textColor=DARK, fontName="Helvetica")
    cell_style_loc = ParagraphStyle("CellLoc", fontSize=7.5, leading=10, textColor=GRAY, fontName="Helvetica")
    table_data = [["#", "Issue", "Location"]]
    for i, (issue, loc) in enumerate(medium_issues, 20):
        table_data.append([str(i), Paragraph(issue, cell_style), Paragraph(loc, cell_style_loc)])

    col_w = [8 * mm, 75 * mm, 65 * mm]
    t = Table(table_data, colWidths=col_w, repeatRows=1)
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, GRAY_LIGHT]),
        ("GRID", (0, 0), (-1, -1), 0.3, BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 2 * mm),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)

    # ═══════════════════════════════════════════════
    # LOW SEVERITY
    # ═══════════════════════════════════════════════
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph("Low Severity Issues (9)", styles["h2"]))

    low_issues = [
        "Search debounce inconsistency - search debounced at 250ms but filter changes are instant",
        "Missing loading timeout on auth redirect - infinite spinner if auth never resolves",
        "Missing request validation for pagination limits - no max cap on limit parameter",
        "Brand logo error response leaks system info - raw fetch errors exposed",
        "Mongoose lean queries silently skip future virtuals",
        "Offer promo code field has no uniqueness constraint",
        "Inconsistent error logging in catch blocks - many log generic messages only",
        "Dead code in schemas - Gmail-only validation is a business logic issue, not a bug",
        "Missing null checks in brand logo fetch error responses",
    ]
    for l in low_issues:
        story.append(Paragraph(f"&#8226;  {l}", styles["bullet"]))

    # ═══════════════════════════════════════════════
    # RECOMMENDATIONS
    # ═══════════════════════════════════════════════
    story.append(PageBreak())
    story.append(Paragraph("Recommendations", styles["h1"]))

    story.append(Paragraph("Immediate Priorities (Week 1)", styles["h2"]))
    recs_p1 = [
        "<b>Fix order price validation</b> - Validate all item prices against actual product/variant prices in the database before creating orders. Use server-computed totals exclusively.",
        "<b>Add stock management</b> - Check variant stock before order creation. Decrement stock atomically using MongoDB findOneAndUpdate with $inc. Reject orders for out-of-stock items.",
        "<b>Fix token refresh race condition</b> - Implement a refresh token queue/mutex. If a refresh is in-flight, subsequent 401 retries should wait for the single refresh to complete.",
        "<b>Open reviews to customers</b> - Change review creation from isAdmin to authMiddleware. Remove auto-generated fake reviews from product creation.",
        "<b>Add variant price validation</b> - Enforce price <= originalPrice on create and update.",
    ]
    for r in recs_p1:
        story.append(Paragraph(f"&#8226;  {r}", styles["bullet"]))

    story.append(Paragraph("Short-Term Improvements (Weeks 2-4)", styles["h2"]))
    recs_p2 = [
        "<b>Split DataContext into domain contexts</b> - Create ProductContext, OrderContext, CategoryContext etc. to reduce unnecessary re-renders across the component tree.",
        "<b>Adopt React Query / TanStack Query</b> - Replace manual fetch + state + cache logic with a dedicated data-fetching library. Eliminates caching bugs and reduces boilerplate.",
        "<b>Add comprehensive test coverage</b> - Prioritize backend route tests (auth, orders, products) and frontend integration tests for checkout flow. Target 70% coverage.",
        "<b>Fix all 'any' types</b> - Define proper TypeScript interfaces for all API responses, context values, and component props. Enable strict mode.",
        "<b>Add MongoDB transactions</b> - Wrap cascading operations (product deletion, order creation with stock updates) in transactions to prevent partial failures.",
        "<b>Remove Gmail-only restriction</b> - Allow all valid email domains for registration.",
    ]
    for r in recs_p2:
        story.append(Paragraph(f"&#8226;  {r}", styles["bullet"]))

    story.append(Paragraph("Long-Term Architecture (Month 2+)", styles["h2"]))
    recs_p3 = [
        "<b>Set up CI/CD pipeline</b> - GitHub Actions for automated testing, linting, and deployment on push to main.",
        "<b>Implement email service</b> - Wire up a transactional email provider (Resend, SendGrid) for password resets, order confirmations, and shipping notifications.",
        "<b>Add monitoring and logging</b> - Integrate error tracking (Sentry) and structured logging for production debugging.",
        "<b>Break up god components</b> - Decompose Navbar (471 lines) and ProductsTab (711 lines) into focused sub-components.",
        "<b>Consider API versioning</b> - Prefix routes with /api/v1/ to allow non-breaking API evolution.",
    ]
    for r in recs_p3:
        story.append(Paragraph(f"&#8226;  {r}", styles["bullet"]))

    # ═══════════════════════════════════════════════
    # FINAL SUMMARY
    # ═══════════════════════════════════════════════
    story.append(Spacer(1, 8 * mm))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY))
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Conclusion", styles["h1"]))
    story.append(Paragraph(
        "Aaro is a well-structured e-commerce application with solid security foundations, a comprehensive "
        "admin panel, and polished user experience. The architecture is sound for a small-to-medium store. "
        "However, the critical issues around order price validation, stock management, and the review system "
        "need immediate attention before scaling further. Addressing the high-severity items around auth race "
        "conditions, TypeScript safety, and N+1 queries will significantly improve reliability and performance. "
        "With the recommended improvements, Aaro can confidently scale to handle larger product catalogs "
        "and higher traffic volumes.",
        styles["body"]
    ))

    # Build
    doc.build(story, onFirstPage=draw_first_page, onLaterPages=draw_page)
    print(f"Report saved to: {output_path}")


if __name__ == "__main__":
    build_report()
