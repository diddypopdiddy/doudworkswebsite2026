window.TEXTBOOK_PROJECT = {
  "part": "plan-and-shoot",
  "title": "Phones Down at Lunch: shoot packet",
  "time": "About 3 class periods: plan, rehearse, shoot and hand off",
  "brief": "<p>Plan and shoot a 30-second <strong>Phones Down at Lunch</strong> PSA. A student notices friends at lunch, puts a phone face down and joins the conversation. Help a viewer understand what changes by showing the phone, the student and the group.</p><p>One crew will plan and record the action. Another editor must be able to assemble it from your footage and packet. Keep the same shot number on the storyboard, shot list, slate and continuity log. Include directions for finding the preferred takes.</p>",
  "requirements": [
    "A 6-panel [[storyboard]] and a numbered [[shot list]] that match.",
    "A [[sound plan]] naming dialogue or [[voiceover]], room tone, effects and any [[music cue]].",
    "Crew roles: [[director]], [[camera operator]], [[sound recordist]] and a location check.",
    "A [[call sheet]] with time, place, people, gear and props.",
    "A rehearsal with [[blocking]] before the first take.",
    "A [[pre-take check]], [[sound check]] and [[test shot]] before recording.",
    "A master, two closer shots, a [[safety take]] and useful [[B-roll]].",
    "A [[continuity log]] that marks the best take, problems and any [[pickup shot]] needed for handoff."
  ],
  "shotListColumns": [
    "#",
    "Size / angle",
    "Action / purpose",
    "Location",
    "Sound"
  ],
  "shotListRows": 10,
  "storyboardFrames": 6,
  "checklist": [
    "My storyboard, shot list and call sheet name the same shots.",
    "Crew roles and gear are clear before setup.",
    "We rehearsed the blocking.",
    "We checked frame, focus, exposure and sound before each setup.",
    "Every take number is on the log.",
    "We have master, closer coverage and B-roll.",
    "The log names the preferred take and any pickup.",
    "Another editor can find every file and note."
  ],
  "rubricLevels": [
    "4 · Strong",
    "3 · Solid",
    "2 · Developing",
    "1 · Beginning"
  ],
  "rubric": [
    {
      "criterion": "Storyboard",
      "levels": [
        "Six panels show a clear opening, decision and change.",
        "Six panels show the decision with one unclear transition.",
        "Several panels leave the decision or outcome ambiguous.",
        "Panels do not show a usable sequence."
      ]
    },
    {
      "criterion": "Shot list",
      "levels": [
        "Each numbered panel has a filmable size, angle, action and purpose.",
        "All required setups appear with one missing detail.",
        "Several rows lack a clear purpose or frame.",
        "Crew cannot identify the setups."
      ]
    },
    {
      "criterion": "Schedule and kit",
      "levels": [
        "Call sheet groups setups, allows resets, assigns people and includes every needed prop.",
        "Crew can follow the schedule with one small clarification.",
        "Location access, roles or gear need several fixes.",
        "Crew lacks enough information to begin."
      ]
    },
    {
      "criterion": "On-set checks",
      "levels": [
        "Test recordings verify picture, voice and complete blocking at every setup.",
        "Picture and sound checked with one recorded gap.",
        "Only one signal checked or no follow-up after a fault.",
        "Takes recorded without a usable test."
      ]
    },
    {
      "criterion": "Coverage and handoff",
      "levels": [
        "Master and details match. Log identifies preferred takes, sound, paths and any pickups.",
        "An editor can assemble the PSA with one minor gap.",
        "A missing detail or incomplete log limits the edit.",
        "The editor cannot reconstruct the planned action."
      ]
    }
  ],
  "reflection": [
    "Which document saved the most time on set? Give a specific example.",
    "What would an editor still need from you after reading your continuity log?"
  ],
  "requirementsTitle": "Hand in the packet and original footage",
  "worksheets": [
    {
      "title": "Sound plan",
      "columns": [
        "Shot / beat",
        "Voice or room sound",
        "Effect / music trigger",
        "Who records it?"
      ],
      "rows": 4
    },
    {
      "title": "Gear and props",
      "columns": [
        "Shot",
        "Gear or prop",
        "Person responsible",
        "Checked"
      ],
      "rows": 4
    },
    {
      "title": "Call sheet",
      "columns": [
        "Call time",
        "Location / setups",
        "People",
        "Equipment / props"
      ],
      "rows": 4
    },
    {
      "title": "Continuity and pickups",
      "columns": [
        "Shot / take",
        "Matching detail",
        "Picture / sound issue",
        "Best / pickup / path"
      ],
      "rows": 6
    }
  ]
};

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', () => {
  const sheets = document.createElement('section');
  sheets.className = 'test-section page-break';
  const el = Textbook.el;
  for (const sheet of window.TEXTBOOK_PROJECT.worksheets) {
    const head = el('thead', {}, el('tr', {}, sheet.columns.map(c => el('th', { text: c }))));
    const body = el('tbody', {}, Array.from({ length: sheet.rows }, () =>
      el('tr', {}, sheet.columns.map(() => el('td')))));
    sheets.append(el('h2', { text: sheet.title }), el('table', { className: 'plan-table' }, head, body));
  }
  const before = [...document.querySelectorAll('.project .test-section')].find(section => section.querySelector('h2')?.textContent === 'Before you hand it in');
  before.before(sheets);
});
