(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "alice-guy-blach-and-production-work",
  "minutes": 12,
  "bigIdea": "One of the first directors ran a whole studio.",
  "hook": {
    "svg": D.editCards("Falling Leaves  •  production credits", [["Director", "Alice Guy-Blaché", "1912"], ["Production company", "Solax", "United States"]]),
    "alt": "A credit card names Alice Guy-Blaché as director and Solax as production company.",
    "question": "Which name identifies the person who directed Falling Leaves?",
    "options": [
      "Alice Guy-Blaché",
      "Solax"
    ],
    "answer": 0,
    "reveal": "The director credit names Alice Guy-Blaché. At Solax the filmmaker also led a [[studio]] and worked as a [[producer]]."
  },
  "notes": {
    "sketch": "Place two productions on a timeline.",
    "frames": 2,
    "frameLabels": [
      "Gaumont",
      "Solax"
    ],
    "think": "What evidence in a credit tells you who organized or directed a film?"
  },
  "vocab": [
    "producer",
    "studio"
  ],
  "review": [
    "director"
  ],
  "objectives": [
    "Connect Guy-Blaché’s directing at Gaumont and leadership at Solax.",
    "Distinguish directing a scene from organizing a production."
  ],
  "sections": [
    {
      "title": "From Gaumont to Solax",
      "intro": "Follow the same filmmaker across two companies.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Alice Guy directed early story films for Gaumont in France. Guy later described an 1896 version of <em>The Cabbage Fairy</em>. Gaumont catalogs the surviving film here as 1900.</p><p>In 1910 Guy-Blaché helped found Solax in the United States. As a [[producer]], Guy-Blaché organized work and resources. As a director, the filmmaker shaped performances and staged the action. A [[studio]] could support both jobs.</p>"
        },
        {
          "type": "figure",
          "svg": D.editCards("Alice Guy-Blaché", [["France  •  Gaumont", "Early story films", "Cabbage Fairy: 1900 version"], ["US  •  Solax", "Co-founded 1910", "Falling Leaves: 1912"]]),
          "alt": "Timeline of the Gaumont and Solax periods.",
          "caption": "Two companies, two countries and several production roles. <a href=\"https://blogs.loc.gov/headlinesandheroes/2022/01/alice-guy-blache/\">Library of Congress career history</a>."
        }
      ]
    },
    {
      "title": "A fairy presents a discovery",
      "intro": "The staging directs our attention inside one frame.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>A performer reveals babies among the cabbages. Think about where the props must sit and when the performer should lift one into view.</p>"
        },
        {
          "type": "video-segments",
          "media": "pd-p7-cabbage-fairy",
          "caption": "The Cabbage Fairy, Alice Guy, Gaumont. Surviving 1900 version. <a href=\"https://www.gaumont.com/en/movie/la-fee-aux-choux\">Gaumont catalogue</a>.",
          "pauses": [
            {
              "at": 4,
              "prompt": "What does the performer do to draw attention to a prop?"
            }
          ],
          "segments": []
        }
      ]
    },
    {
      "title": "A child tries to stop autumn",
      "intro": "An action makes an invisible idea visible.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>In <em>Falling Leaves</em>, a child hears that a sister may die when the last leaf falls. Tying leaves to a tree shows how literally the child understands those words.</p>"
        },
        {
          "type": "video-segments",
          "media": "pd-p7-falling-leaves",
          "caption": "Falling Leaves, Alice Guy-Blaché, Solax, 1912. <a href=\"https://catalog.afi.com/Film/66063-FALLING-LEAVES\">AFI catalogue and synopsis</a>.",
          "pauses": [
            {
              "at": 4,
              "prompt": "Which gesture lets us infer what the child believes?"
            }
          ],
          "segments": []
        }
      ]
    },
    {
      "title": "Read the production credits",
      "intro": "Identify the job from the decision.",
      "blocks": [
        {
          "type": "quick-check",
          "q": "A crew has a location and cast but needs direction for the child’s action. Who shapes the performance?",
          "options": [
            {
              "text": "Producer booking the location",
              "clue": "The question asks about what appears on camera."
            },
            "Director"
          ],
          "answer": 1,
          "explain": "The director guides what the performer does in the shot."
        }
      ]
    }
  ],
  "check": [
    {
      "q": "In this credit card, which entry names the studio?",
      "options": [
        {
          "text": "Alice Guy-Blaché",
          "clue": "Find the production-company column."
        },
        "Solax"
      ],
      "answer": 1,
      "explain": "Solax is identified as the company.",
      "svg": D.editCards("Falling Leaves  •  production credits", [["Director", "Alice Guy-Blaché", "1912"], ["Production company", "Solax", "United States"]]),
      "alt": "Solax is identified as the company."
    },
    {
      "q": "Which decision is mainly producing work?",
      "options": [
        "Organize crew, locations and resources",
        {
          "text": "Ask the performer to wait before lifting a prop",
          "clue": "Which choice arranges the production?"
        }
      ],
      "answer": 0,
      "explain": "Coordinating resources makes the shoot possible."
    },
    {
      "q": "Which description connects the two companies?",
      "options": [
        {
          "text": "Solax hired Guy before the Gaumont films",
          "clue": "Check the order of the timeline."
        },
        "Guy directed for Gaumont and later led Solax"
      ],
      "answer": 1,
      "explain": "The French work preceded the American studio."
    }
  ],
  "remember": [
    "A [[studio]] can support many productions.",
    "A [[producer]] arranges the people and resources for filming.",
    "Guy-Blaché led a [[studio]] and also directed the action on screen."
  ],
  "realCameraTitle": "Look for it",
  "realCamera": "Look at the credits of a show you know. Find one producer and one director. Write one decision each role might make."
});
})();
