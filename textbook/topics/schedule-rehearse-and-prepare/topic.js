(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "schedule-rehearse-and-prepare",
  "minutes": 12,
  "bigIdea": "A plan for time saves the shoot.",
  "hook": {
    "svg": D.editCards("Half-hour shoot  •  two plans", [["Plan A", "Hall → Library", "Library → Hall", "Hall → Library"], ["Plan B", "Hall shots together", "Move once", "Library shots together"]]),
    "alt": "Plan A changes rooms three times. Plan B changes once.",
    "question": "Which plan leaves more of the half hour for recording?",
    "options": [
      "Plan B",
      "Plan A"
    ],
    "answer": 0,
    "reveal": "Plan B moves the kit once. A [[schedule]] groups compatible shots and respects when people and rooms are available."
  },
  "notes": {
    "sketch": "Map a half-hour shoot in two locations.",
    "frames": 2,
    "frameLabels": [
      "First location",
      "Second location"
    ],
    "think": "Which constraint determined your first setup?"
  },
  "vocab": [
    "schedule",
    "call-sheet",
    "rehearsal",
    "blocking"
  ],
  "review": [],
  "objectives": [
    "Read a call sheet to find time, place, people and kit.",
    "Group shots around access limits and rehearse their blocking."
  ],
  "sections": [
    {
      "title": "Read tomorrow’s call sheet",
      "intro": "Everyone needs the same meeting time and first setup.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A [[schedule]] sets the filming order. A [[call sheet]] gives the crew the plan for one day. Include call time, location, people, gear, shots and the next move.</p><p>For The Note, film both hallway angles while the hall is quiet. Bring the backpack and keep the walk screen right from both angles.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("The Note  •  morning call", [["10:00   Hall", "Reader + camera", "S02 wide / S03 medium"], ["10:12   Library", "Bring book + note", "S04 master / S06 close"]]),
          "alt": "Call sheet with two locations, times and shot assignments.",
          "caption": "Build in time to move the kit."
        }
      ]
    },
    {
      "title": "Walk the action without rolling",
      "intro": "Agree on the movements before setting the close shot.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>[[Blocking]] is where people stand and move. During [[rehearsal]], have the Reader enter screen left, sit and reach with the right hand. Mark the chair and time the move.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Half-hour shoot  •  two plans", [["Plan A", "Hall → Library", "Library → Hall", "Hall → Library"], ["Plan B", "Hall shots together", "Move once", "Library shots together"]]),
          "alt": "Two ways of grouping locations.",
          "caption": "Grouping setups saves travel and reset time."
        },
        {
          "type": "callout",
          "kind": "onset",
          "html": "Before the crew leaves the hallway, check that the wide and medium both show the Reader crossing toward screen right."
        }
      ]
    },
    {
      "title": "Schedule the half hour",
      "intro": "Honor the location windows and keep the closer shots consistent.",
      "blocks": [
        {
          "type": "sorter",
          "mode": "order",
          "prompt": "The hall closes at 10:10. The library opens at 10:12. The master establishes the movements for the closer repeats. Order this half hour.",
          "items": [
            {
              "text": "Library: film S06 book detail, matching the master.",
              "clue": "Which earlier shot sets the hand and timing?"
            },
            {
              "text": "Hall: rehearse the screen-right walk, then record S02 and S03.",
              "clue": "Consider when the hall becomes unavailable."
            },
            {
              "text": "Library: reset the book and record S04 master.",
              "clue": "Which setup shows the complete movement?"
            },
            {
              "text": "Pack the hallway kit and walk to the library.",
              "clue": "Finish both shots on the hall access window first."
            }
          ],
          "correct": [
            1,
            3,
            2,
            0
          ],
          "success": "The crew makes one move and has a master to match before filming the detail."
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which plan has three equipment moves?",
      "options": [
        {
          "text": "Plan B",
          "clue": "Follow each arrow between rooms."
        },
        "Plan A"
      ],
      "answer": 1,
      "explain": "Plan A returns to each location.",
      "svg": D.editCards("Half-hour shoot  •  two plans", [["Plan A", "Hall → Library", "Library → Hall", "Hall → Library"], ["Plan B", "Hall shots together", "Move once", "Library shots together"]]),
      "alt": "Plan A returns to each location."
    },
    {
      "q": "A substitute crew member needs the arrival time and gear list. What should you send?",
      "options": [
        {
          "text": "Just the finished storyboard",
          "clue": "Which document names where and when to meet?"
        },
        "The day’s call sheet"
      ],
      "answer": 1,
      "explain": "The call sheet gives practical instructions for this shoot day."
    },
    {
      "q": "What should the Reader repeat in rehearsal for the master and close-up?",
      "options": [
        "The chair position and right-hand pickup",
        {
          "text": "The camera file number",
          "clue": "Look for visible movement that must match."
        }
      ],
      "answer": 0,
      "explain": "Blocking fixes the action that both shots need."
    }
  ],
  "remember": [
    "A [[schedule]] groups shots by availability and location.",
    "Share the [[call sheet]] before the shoot.",
    "Use [[rehearsal]] to settle the [[blocking]]."
  ],
  "realCameraTitle": "Try it",
  "realCamera": "Make a half-hour call sheet with two setups, crew arrival, travel and a rehearsal. Check it against the room schedule."
});
})();
