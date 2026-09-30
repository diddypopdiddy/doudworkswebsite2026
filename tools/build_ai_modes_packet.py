#!/usr/bin/env python3
"""Build the classroom-ready AI Modes competition scorecard packet."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "resources" / "ai-modes-competition-scorecards.pdf"

PAPER = colors.HexColor("#F8F4EA")
INK = colors.HexColor("#20221F")
MUTED = colors.HexColor("#68655E")
RED = colors.HexColor("#A94A3D")
BLUE = colors.HexColor("#6F92A0")
GREEN = colors.HexColor("#244D42")
LINE = colors.HexColor("#C8BEAA")
WHITE = colors.HexColor("#FFFDF7")

MODES = [
    {
        "name": "Idea Mode",
        "label": "generate, narrow, and choose",
        "task": "Come up with a new ______________________________.",
        "positive": [
            ("Clearly Defines the Task", "“Your task is to…”", "+5"),
            (
                "Gives Clear Background Information and Limits",
                "“This is for… and should include… Avoid…”",
                "+5",
            ),
            (
                "Engages in Selective Exploration",
                "“I like #___. What are 5 more ideas related to that?”",
                "+5",
            ),
            ("Defines the Role of AI", "“You are a(n)…”", "+3"),
            (
                "Keeps the Conversation Going",
                "Engages in 5 or more back-and-forths with the chatbot.",
                "+2",
            ),
        ],
        "negative": [
            (
                "Picks the First Idea Too Quickly",
                "“That works. Let’s just go with that.”",
                "-5",
            ),
            (
                "Asks for More Without Choosing",
                "“Give me 20 more ideas.” (repeated)",
                "-5",
            ),
            (
                "Gives No Background Information or Limits",
                "Provides no audience, setting, tone, or boundaries.",
                "-5",
            ),
            (
                "Limited Engagement",
                "Stops engaging with the chatbot after the first request.",
                "-2",
            ),
        ],
    },
    {
        "name": "Learning Mode",
        "label": "build understanding, not a shortcut",
        "task": "Prepare for a presentation on ______________________.",
        "positive": [
            ("Assigns a Role to the Chatbot", "“You are a supportive tutor…”", "+5"),
            ("Clearly Defines the Learning Goal", "“Your task is to…”", "+5"),
            (
                "Explains What They Already Know",
                "“I understand ___, but I’m confused about ___.”",
                "+5",
            ),
            (
                "Actively Steers the Learning",
                "Asks for a connection, simpler explanation, example, or clarification.",
                "+5",
            ),
            (
                "Extended Engagement",
                "Engages in 5 or more back-and-forths with the chatbot.",
                "+2",
            ),
        ],
        "negative": [
            ("Outsources the Final Product", "“Create a presentation on ___.”", "-5"),
            ("Gives No Learning Context", "“Explain ___.”", "-5"),
            (
                "Requests a Script Instead of Understanding",
                "“Write exactly what I should say.”",
                "-5",
            ),
            (
                "Uses AI to Bypass Thinking",
                "“Make it sound like a 10th grader.”",
                "-3",
            ),
            (
                "Limited Engagement",
                "Stops engaging with the chatbot after the first request.",
                "-2",
            ),
        ],
    },
    {
        "name": "Feedback Mode",
        "label": "the student writes; AI helps improve",
        "task": "Write the best possible introduction paragraph on __________.",
        "positive": [
            (
                "Shares Their Own Draft First",
                "“Here is my draft of what I wrote so far…”",
                "+5",
            ),
            (
                "Sets a Boundary",
                "“Do not rewrite my draft. Provide supportive feedback.”",
                "+5",
            ),
            (
                "Asks for Feedback or Suggestions",
                "Requests clear, concise, actionable feedback.",
                "+5",
            ),
            (
                "Assigns a Role to the Chatbot",
                "“You are an expert in providing supportive feedback.”",
                "+3",
            ),
            (
                "Extended Engagement",
                "Engages in more than 1 meaningful back-and-forth.",
                "+2",
            ),
        ],
        "negative": [
            (
                "“Write It All for Me” Request",
                "“Write my entire introduction for me.”",
                "-5",
            ),
            (
                "Copy-Paste Without Revision",
                "Uses exact AI text without rewording or reflection.",
                "-5",
            ),
            (
                "Uses AI to Bypass Thinking",
                "“Make it 1 page long” or “Make it sound like a 10th grader.”",
                "-3",
            ),
            (
                "Limited Engagement",
                "Stops engaging with the chatbot after the first request.",
                "-2",
            ),
        ],
    },
    {
        "name": "Practice Mode",
        "label": "rehearse in a realistic simulation",
        "task": "Prepare for an upcoming ____________________________.",
        "positive": [
            (
                "Clearly Defines the Scenario",
                "Names the situation, setting, and other person.",
                "+5",
            ),
            (
                "Defines Roles and Tone",
                "“You are the ____. Be ____ in your responses.”",
                "+5",
            ),
            (
                "Sets Rules for the Interaction",
                "One question at a time; challenge unclear answers; adjust difficulty.",
                "+5",
            ),
            (
                "Defines the End and Feedback",
                "“After 5 exchanges, provide feedback on my performance.”",
                "+5",
            ),
            (
                "Adjusts an Unrealistic Simulation",
                "Directs the chatbot to make the practice more authentic.",
                "+5",
            ),
        ],
        "negative": [
            ("Makes a Vague Simulation Request", "“Help me prepare…”", "-5"),
            ("Asks for Advice Instead of Simulation", "“What should I say?”", "-5"),
            (
                "Has No Plan for How It Runs or Ends",
                "Does not define the structure or ending.",
                "-5",
            ),
            (
                "Limited Engagement",
                "Stops engaging with the chatbot after the first request.",
                "-2",
            ),
        ],
    },
    {
        "name": "Tool Mode",
        "label": "direct and refine a defined output",
        "task": "Design a new ______________________________________.",
        "positive": [
            (
                "Clearly Explains What Needs to Be Created",
                "“Your task is to…”",
                "+5",
            ),
            (
                "Gives Clear and Specific Directions",
                "“Include… Use… The final output should…”",
                "+5",
            ),
            (
                "Anticipates Missing Information",
                "“Let me know if I need to provide more direction.”",
                "+5",
            ),
            ("Assigns a Role to the Chatbot", "“You are a(n)…”", "+5"),
            (
                "Refines and Directs the Output",
                "“Adjust… Make it more… Remove…”",
                "+5",
            ),
        ],
        "negative": [
            ("Gives Vague Directions", "“Create…”", "-5"),
            ("Outsources Creative Judgment", "“You decide what’s best.”", "-5"),
            (
                "Accepts the First Output Without Refinement",
                "“That’s fine.” (No feedback or changes.)",
                "-3",
            ),
            (
                "Limited Engagement",
                "Stops engaging with the chatbot after the first request.",
                "-2",
            ),
        ],
    },
]


def page_number(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, letter[0], letter[1], stroke=0, fill=1)
    canvas.setStrokeColor(RED)
    canvas.setLineWidth(0.8)
    canvas.line(0.55 * inch, 0.42 * inch, 7.95 * inch, 0.42 * inch)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(
        0.55 * inch,
        0.23 * inch,
        "AI Modes Competition Activity · classroom scorecard",
    )
    canvas.drawRightString(7.95 * inch, 0.23 * inch, f"{doc.page}")
    canvas.restoreState()


styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "ModeTitle",
    parent=styles["Title"],
    fontName="Times-Bold",
    fontSize=24,
    leading=26,
    textColor=INK,
    alignment=TA_LEFT,
    spaceAfter=3,
)
mode_label_style = ParagraphStyle(
    "ModeLabel",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8,
    leading=10,
    textColor=RED,
    spaceAfter=8,
)
task_style = ParagraphStyle(
    "Task",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9,
    leading=11,
    textColor=GREEN,
    backColor=WHITE,
    borderColor=LINE,
    borderWidth=0.6,
    borderPadding=7,
    spaceAfter=7,
)
directions_style = ParagraphStyle(
    "Directions",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.5,
    leading=9,
    textColor=MUTED,
    spaceAfter=7,
)
header_style = ParagraphStyle(
    "TableHeader",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8,
    leading=9,
    textColor=WHITE,
    alignment=TA_CENTER,
)
criterion_style = ParagraphStyle(
    "Criterion",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=7.4,
    leading=8.7,
    textColor=INK,
)
example_style = ParagraphStyle(
    "Example",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=6.8,
    leading=8.1,
    textColor=MUTED,
)
score_style = ParagraphStyle(
    "Score",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8,
    leading=9,
    textColor=INK,
    alignment=TA_CENTER,
)
footer_style = ParagraphStyle(
    "Footer",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.5,
    leading=9,
    textColor=MUTED,
    alignment=TA_CENTER,
)


def score_table(title, entries, band_color):
    data = [
        [
            Paragraph(title, header_style),
            Paragraph("Value", header_style),
            Paragraph("Round 1", header_style),
            Paragraph("Round 2", header_style),
        ]
    ]
    for criterion, example, points in entries:
        data.append(
            [
                Paragraph(
                    f"<b>{criterion}</b><br/><font color='#68655E'>{example}</font>",
                    criterion_style,
                ),
                Paragraph(points, score_style),
                "",
                "",
            ]
        )
    table = Table(
        data,
        colWidths=[5.55 * inch, 0.55 * inch, 0.65 * inch, 0.65 * inch],
        repeatRows=1,
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), band_color),
                ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, LINE),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 1), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 1), (0, -1), 7),
                ("RIGHTPADDING", (0, 1), (0, -1), 7),
                ("TOPPADDING", (0, 1), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
                ("TOPPADDING", (0, 0), (-1, 0), 5),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
            ]
        )
    )
    return table


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.42 * inch,
        bottomMargin=0.58 * inch,
        title="AI Modes Competition Activity Scorecards",
        author="Vince Doud",
        subject="Two-round classroom scorecards for Idea, Learning, Feedback, Practice, and Tool modes",
    )

    story = []
    for index, mode in enumerate(MODES):
        story.extend(
            [
                Paragraph(mode["name"], title_style),
                Paragraph(mode["label"].upper(), mode_label_style),
                Paragraph(f"<b>TASK:</b> {mode['task']}", task_style),
                Paragraph(
                    "Complete the same academic task twice. After each round, a peer scores the conversation—not only the final answer. Add positive points, subtract negative points, and compare what changed.",
                    directions_style,
                ),
                score_table("POSITIVE POINTS", mode["positive"], GREEN),
                Spacer(1, 7),
                score_table("NEGATIVE POINTS", mode["negative"], RED),
                Spacer(1, 7),
            ]
        )

        score_line = Table(
            [
                [
                    Paragraph("<b>Round 1 total:</b> __________", score_style),
                    Paragraph("<b>Round 2 total:</b> __________", score_style),
                    Paragraph("<b>Change:</b> __________", score_style),
                ]
            ],
            colWidths=[2.45 * inch] * 3,
        )
        score_line.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E9E1D1")),
                    ("BOX", (0, 0), (-1, -1), 0.7, LINE),
                    ("INNERGRID", (0, 0), (-1, -1), 0.45, LINE),
                    ("TOPPADDING", (0, 0), (-1, -1), 7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                ]
            )
        )
        story.extend(
            [
                score_line,
                Spacer(1, 5),
                Paragraph(
                    "<b>Exit reflection:</b> What did you change between rounds, and why did it improve the academic interaction? "
                    "________________________________________________________________________________",
                    footer_style,
                ),
            ]
        )

        if index < len(MODES) - 1:
            story.append(PageBreak())

    doc.build(story, onFirstPage=page_number, onLaterPages=page_number)
    print(OUTPUT)


if __name__ == "__main__":
    build()
