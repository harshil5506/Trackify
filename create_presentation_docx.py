import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_presentation_docx():
    doc = Document()
    
    # Page Setup - Margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette Constants
    PRIMARY_COLOR = RGBColor(26, 46, 168)     # #1a2ea8 (Navy/Deep Blue)
    SECONDARY_COLOR = RGBColor(45, 71, 201)   # #2d47c9 (Royal Blue)
    ACCENT_CYAN = RGBColor(6, 182, 212)      # #06b6d4 (Cyan Accent)
    DARK_TEXT = RGBColor(26, 26, 46)         # #1a1a2e (Dark Charcoal)
    MUTED_TEXT = RGBColor(100, 116, 139)     # Slate Muted

    # Helper Functions for Styling
    def set_cell_background(cell, fill_hex):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.color.rgb = PRIMARY_COLOR
        p.paragraph_format.space_after = Pt(4)
        return p

    def add_subtitle(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(text)
        run.font.name = 'Arial'
        run.font.size = Pt(13)
        run.font.color.rgb = MUTED_TEXT
        p.paragraph_format.space_after = Pt(20)
        return p

    def add_slide_header(slide_num, title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        
        run_num = p.add_run(f"SLIDE {slide_num}: ")
        run_num.font.name = 'Arial'
        run_num.font.size = Pt(14)
        run_num.font.bold = True
        run_num.font.color.rgb = SECONDARY_COLOR

        run_title = p.add_run(title)
        run_title.font.name = 'Arial'
        run_title.font.size = Pt(16)
        run_title.font.bold = True
        run_title.font.color.rgb = PRIMARY_COLOR

    def add_bullet(p_or_text, level=0):
        if isinstance(p_or_text, str):
            p = doc.add_paragraph(style='List Bullet')
            run = p.add_run(p_or_text)
        else:
            p = p_or_text
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        return p

    # --- TITLE & HEADER SECTION ---
    add_title("TRACKIFY")
    add_subtitle("Full-Stack Personal Finance & Group Expense Sharing Platform\n3-Week Progress Report Presentation (Weeks 1 to 3)")

    # Metadata Box Table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_data = [
        [("CHAROTAR UNIVERSITY OF SCIENCE & TECHNOLOGY\nDEVANG PATEL INSTITUTE OF ADVANCE TECHNOLOGY (DEPSTAR)", "Semester: 5th | Project ID: PRJ_IT_5_2026_10"),
         ("Student Details", "Student ID: D25DIT083\nInternship ID: INT_2026_D25DIT083")]
    ]

    cell_1 = meta_table.cell(0, 0)
    cell_1.text = "INSTITUTION & PROJECT METADATA\n• Institution: CHARUSAT (DEPSTAR)\n• Semester: 5th | Project ID: PRJ_IT_5_2026_10\n• Domain: Web Development / FinTech"
    set_cell_background(cell_1, "F0F4FF")

    cell_2 = meta_table.cell(0, 1)
    cell_2.text = "STUDENT & MILESTONE DETAILS\n• Student ID: D25DIT083\n• Internship ID: INT_2026_D25DIT083\n• Current Milestone: Checkpoint 1 (v1.0-cp1)\n• Repository: github.com/harshil5506/Trackify"
    set_cell_background(cell_2, "F0F4FF")

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # --- SLIDE 1: EXECUTIVE OVERVIEW ---
    add_slide_header(1, "Executive Summary & 3-Week Progression")
    
    overview_p = doc.add_paragraph()
    overview_p.add_run("Trackify is a comprehensive full-stack web application designed for personal financial management and group expense splitting. Over the course of 3 weeks, the project progressed from core architecture to Checkpoint 1 release.").font.size = Pt(10.5)

    # Overview Table
    summary_table = doc.add_table(rows=4, cols=3)
    summary_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers = ["Week & Dates", "Focus Module", "Key Deliverables & Outcomes"]
    hdr_cells = summary_table.rows[0].cells
    for idx, text in enumerate(headers):
        hdr_cells[idx].text = text
        set_cell_background(hdr_cells[idx], "1A2EA8")
        for p in hdr_cells[idx].paragraphs:
            for r in p.runs:
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.bold = True

    row1 = summary_table.rows[1].cells
    row1[0].text = "Week 1\n(18/07 - 24/07)"
    row1[1].text = "System Architecture & Authentication"
    row1[2].text = "• MERN + Vite setup\n• 6 Mongoose ODM schemas\n• JWT auth & bcryptjs security\n• Security PIN Lock views\n• Google OAuth integration"

    row2 = summary_table.rows[2].cells
    row2[0].text = "Week 2\n(25/07 - 31/07)"
    row2[1].text = "Personal Financial Ledger & Analytics"
    row2[2].text = "• Income/Expense CRUD APIs\n• Category budget overrun alerts\n• Interactive Recharts widgets\n• PDF/CSV/JSON export engine\n• MongoDB test seed generator"

    row3 = summary_table.rows[3].cells
    row3[0].text = "Week 3\n(01/08 - 07/08)"
    row3[1].text = "Multi-Currency & Email Automation"
    row3[2].text = "• Multi-currency support (INR, USD, EUR, GBP)\n• Nodemailer monthly report emails\n• Profile settings unification\n• Tagged release 'checkpoint-1'"

    for row_idx in range(1, 4):
        for cell in summary_table.rows[row_idx].cells:
            set_cell_background(cell, "F9FAFB" if row_idx % 2 == 1 else "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # --- SLIDE 2: WEEK 1 BREAKDOWN ---
    add_slide_header(2, "Week 1: Core System Architecture & Security")
    
    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Full-Stack Environment Setup: ")
    r.bold = True
    p.add_run("Configured React 19 + Vite Single Page Application (SPA) frontend and Node.js + Express backend with CORS and cookie-parser.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Database Schemas Definition (Mongoose ODM): ")
    r.bold = True
    p.add_run("Defined 6 robust models: User, Expense, Budget, Friend, Message, and Group.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Authentication & Session Management: ")
    r.bold = True
    p.add_run("Implemented POST /api/auth/register and POST /api/auth/login using bcryptjs password hashing and 7-day JWT session tokens.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Security PIN Lock Layer: ")
    r.bold = True
    p.add_run("Built SetPin.jsx and PinLock.jsx views to secure sensitive financial records.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Google OAuth Integration: ")
    r.bold = True
    p.add_run("Configured GoogleOAuthProvider wrapper and GoogleLogin frontend workflow with graceful fallback handling.")

    # --- SLIDE 3: WEEK 2 BREAKDOWN ---
    add_slide_header(3, "Week 2: Financial Ledger, Budgets & Multi-Format Exports")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Income & Expense Ledger (CRUD API): ")
    r.bold = True
    p.add_run("Developed expenses.js REST routes supporting transaction titles, category tags, payment methods, date ranges, and pagination.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Category Budgeting System: ")
    r.bold = True
    p.add_run("Created budget.js CRUD endpoints and Budget.jsx view to configure monthly category limits and alert users upon budget overruns.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Summary Analytics Engine: ")
    r.bold = True
    p.add_run("Developed analytics.js aggregation endpoints (GET /summary, GET /monthly, GET /by-category) integrated with interactive Recharts widgets.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Multi-Format Export Engine: ")
    r.bold = True
    p.add_run("Created csvExport.js utility and enhanced Reports.jsx & Transactions.jsx to support PDF (jsPDF + autotable), CSV, and JSON downloads.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Data Seeding & Production Build: ")
    r.bold = True
    p.add_run("Built seed_trackify.js script populating 75+ test transactions and roommate expense split structures.")

    # --- SLIDE 4: WEEK 3 BREAKDOWN ---
    add_slide_header(4, "Week 3: Multi-Currency & Email Automation (Checkpoint 1)")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Multi-Currency Preference & Formatting: ")
    r.bold = True
    p.add_run("Implemented multi-currency preference selection (INR ₹, USD $, EUR €, GBP £, etc.) in User Profile and integrated dynamic currency formatting across transaction tables, summaries, and PDF/CSV reports.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Automated Monthly Reports via Email: ")
    r.bold = True
    p.add_run("Developed Nodemailer mail delivery transport sending formatted HTML monthly summaries and transaction highlights directly to user emails.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Checkpoint 1 Release Tagged: ")
    r.bold = True
    p.add_run("Executed production build verification (npm run build) and tagged release 'checkpoint-1' on GitHub main repository.")

    # --- SLIDE 5: TECHNICAL ARCHITECTURE & STACK ---
    add_slide_header(5, "Technical Architecture & Stack Specifications")

    tech_table = doc.add_table(rows=5, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER

    t_headers = ["Layer", "Technology / Framework", "Core Purpose & Features"]
    t_hdr_cells = tech_table.rows[0].cells
    for idx, text in enumerate(t_headers):
        t_hdr_cells[idx].text = text
        set_cell_background(t_hdr_cells[idx], "1A2EA8")
        for p in t_hdr_cells[idx].paragraphs:
            for r in p.runs:
                r.font.color.rgb = RGBColor(255, 255, 255)
                r.font.bold = True

    t_rows = [
        ("Frontend UI", "React 19 + Vite + Recharts", "Single Page Application (SPA) with fast HMR, responsive layouts, interactive analytics charts, and client routing."),
        ("Backend REST API", "Node.js + Express.js", "RESTful API services, authentication middleware, password hashing, and email transport dispatch."),
        ("Database Layer", "MongoDB + Mongoose ODM", "NoSQL database holding user profiles, financial ledgers, budget caps, direct messages, and group split models."),
        ("Security & Utilities", "JWT, Bcryptjs, jsPDF, Nodemailer", "7-day session tokens, security PIN lock, PDF/CSV multi-format export engine, and automated email dispatch.")
    ]

    for idx, (layer, tech, purpose) in enumerate(t_rows, start=1):
        cells = tech_table.rows[idx].cells
        cells[0].text = layer
        cells[1].text = tech
        cells[2].text = purpose
        set_cell_background(cells[0], "F0F4FF")
        set_cell_background(cells[1], "F9FAFB" if idx % 2 == 1 else "FFFFFF")
        set_cell_background(cells[2], "F9FAFB" if idx % 2 == 1 else "FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # --- SLIDE 6: FUTURE ROADMAP ---
    add_slide_header(6, "Future Roadmap & Upcoming Milestones (Weeks 4+)")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Group Expense & Debt Settlement Simplification: ")
    r.bold = True
    p.add_run("Extend multi-currency support to shared group balances and implement debt minimization algorithms to settle roommate expenses efficiently.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Automated Subscription Tracker: ")
    r.bold = True
    p.add_run("Develop recurring bill detection with spending alert notifications before payment due dates.")

    p = doc.add_paragraph(style='List Bullet')
    r = p.add_run("Mobile UX & Touch Optimizations: ")
    r.bold = True
    p.add_run("Enhance responsive touch gesture controls and swipe actions for quick expense logging.")

    # Save Document
    doc.save("Trackify_Weekly_Reports_Presentation.docx")
    print("SUCCESS: Trackify_Weekly_Reports_Presentation.docx created successfully!")

if __name__ == "__main__":
    create_presentation_docx()
