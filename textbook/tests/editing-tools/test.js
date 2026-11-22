/* Part 8 student test. Keys are stored separately. */
window.TEXTBOOK_TEST = {
  "part": "editing-tools",
  "minutes": 45,
  "printNote": "Prints on US Letter. Black and white is fine.",
  "instructions": "Answer every question. For matching, write a letter. For multiple choice, fill in the circle next to the one best answer.",
  "sections": [
    {
      "title": "Section A · Words and facts",
      "note": "(Level 1)",
      "items": [
        {
          "id": "a-match",
          "type": "match",
          "level": 1,
          "topic": "file-types-and-relationships",
          "obj": 0,
          "targets": [
            {
              "topic": "file-properties",
              "obj": 1
            },
            {
              "topic": "editor-layout",
              "obj": 0
            },
            {
              "topic": "file-types-and-relationships",
              "obj": 0
            },
            {
              "topic": "restore-and-relink-media",
              "obj": 1
            },
            {
              "topic": "import-and-place-clips",
              "obj": 0
            },
            {
              "topic": "ingest-and-verify-media",
              "obj": 0
            },
            {
              "topic": "tape-workflows-and-nonlinear-editing",
              "obj": 0
            },
            {
              "topic": "opacity-picture-fades-and-keyframes",
              "obj": 0
            }
          ],
          "stem": "Match each description to one term. Two terms are unused.",
          "terms": [
            "codec",
            "media pool",
            "file extension",
            "relink",
            "clip",
            "ingest",
            "linear editing",
            "opacity",
            "track",
            "ripple edit"
          ],
          "defs": [
            "The area of an editor listing imported source clips.",
            "Letters or numbers after the last dot in a filename.",
            "Bring the camera or recorder files into the project.",
            "Tell a project where a source file has moved.",
            "A method for encoding or decoding the picture or sound.",
            "How solid a picture looks over the layer below.",
            "A piece of picture or sound in an editor.",
            "Assembling a cut in order, such as when editing from one tape to another."
          ]
        },
        {
          "id": "a2",
          "type": "mc",
          "level": 1,
          "topic": "file-types-and-relationships",
          "obj": 1,
          "stem": "Which file normally keeps your timeline edits and links to the source clips?",
          "options": [
            "A JPG still",
            "The editor’s project file",
            "The original WAV sound",
            "The exported MP4 video"
          ]
        },
        {
          "id": "a3",
          "type": "mc",
          "level": 1,
          "topic": "tape-workflows-and-nonlinear-editing",
          "obj": 1,
          "stem": "Why can you try a new shot order quickly in a nonlinear edit?",
          "options": [
            "You have to dub the tape again from the first frame.",
            "The editor has to cut the original film into pieces.",
            "Rearranging makes the editor record new footage.",
            "A timeline can move references to digitized clips."
          ]
        },
        {
          "id": "a4",
          "type": "mc",
          "level": 1,
          "topic": "move-and-reorder-clips",
          "obj": 0,
          "stem": "Where do you grab to move an entire clip in Selection mode?",
          "options": [
            "The body of the clip",
            "The left trim handle",
            "The right trim handle",
            "The time ruler"
          ]
        },
        {
          "id": "a5",
          "type": "mc",
          "level": 1,
          "topic": "playback-scrubbing-and-frame-stepping",
          "obj": 1,
          "stem": "At 24 fps, what does the last field in 00:00:03:12 show?",
          "options": [
            "12 seconds past the mark",
            "12 copies of the clip",
            "12 frames past the 3-second mark",
            "A 12 fps timeline"
          ]
        }
      ]
    },
    {
      "title": "Section B · Recognize it",
      "note": "(Level 2)",
      "items": [
        {
          "id": "b1",
          "type": "mc",
          "level": 2,
          "topic": "editor-layout",
          "obj": 1,
          "stem": "The viewer should show one second later. Which part do you move?",
          "options": [
            "The Media Pool list",
            "The playhead (vertical line)",
            "The entire V1 clip",
            "The A1 track label"
          ],
          "alt": "Media Pool left, viewer top right, the orange playhead crossing V1 and A1.",
          "svg": Textbook.draw.editorLayout(false)
        },
        {
          "id": "b2",
          "type": "mc",
          "level": 2,
          "topic": "file-properties",
          "obj": 0,
          "stem": "Which clip has the larger pixel resolution?",
          "options": [
            "Clip B",
            "Clip A",
            "Both pixel sizes match.",
            "The resolutions can’t be read here."
          ],
          "alt": "A: 1920×1080, 24 fps. B: 3840×2160, 30 fps.",
          "svg": Textbook.draw.editCards("Details", [["A","1920 × 1080","24 fps"],["B","3840 × 2160","30 fps"]])
        },
        {
          "id": "b3",
          "type": "mc",
          "level": 2,
          "topic": "playback-scrubbing-and-frame-stepping",
          "obj": 0,
          "stem": "You stopped on the frame just before contact. What moves you to the next frame?",
          "options": [
            "Fast-forward for a second.",
            "Trim the clip’s right edge.",
            "Append the clip a second time.",
            "Step right by one frame."
          ],
          "alt": "A: hands apart. B: palms touch. C: hands apart.",
          "svg": Textbook.draw.editCards("Find contact", [["A","Hands apart"],["B","Palms touch"],["C","Hands apart"]])
        },
        {
          "id": "b4",
          "type": "mc",
          "level": 2,
          "topic": "timeline-zoom-and-sizing",
          "obj": 0,
          "stem": "The whole edit fits, but its cuts are tiny. What setting helps you see the exact cut?",
          "options": [
            "Increase viewer zoom.",
            "Increase clip duration.",
            "Increase timeline zoom.",
            "Make every clip brighter."
          ],
          "alt": "Five short cuts sit very close on a 30-second ruler.",
          "svg": Textbook.draw.editTimeline({"title":"Whole edit on screen","length":30,"lanes":[{"name":"V1","clips":[["A",0,1.5],["B",1.5,3],["C",3,6]]}]})
        },
        {
          "id": "b5",
          "type": "mc",
          "level": 2,
          "topic": "trim-beginnings-and-endings",
          "obj": 0,
          "stem": "There are two seconds of waiting before the start mark. How should you keep the action?",
          "options": [
            "Trim the right edge to In.",
            "Trim the left edge to In.",
            "Move the whole clip later.",
            "Cut out the action and keep the head."
          ],
          "alt": "Waiting 0–2 seconds, action 2–8.",
          "svg": Textbook.draw.editTimeline({"title":"Waiting then action","length":8,"lanes":[{"name":"V1","clips":[["Wait",0,2,"gap"],["Action",2,8]]}],"marks":[["In",2]]})
        },
        {
          "id": "b6",
          "type": "mc",
          "level": 2,
          "topic": "split-remove-and-close-gaps",
          "obj": 0,
          "stem": "To keep both useful sections, where must you split?",
          "options": [
            "Only where the cough starts.",
            "Only where the cough ends.",
            "At the end of the whole recording.",
            "At both edges of the cough."
          ],
          "alt": "Part 1 ends at 2.5 seconds; the cough ends at 3.5; Part 2 follows.",
          "svg": Textbook.draw.editTimeline({"title":"An interruption","length":8,"lanes":[{"name":"V1","clips":[["Part 1",0,2.5],["Cough",2.5,3.5,"detail"],["Part 2",3.5,8]]}],"marks":[["Cut",2.5],["Cut",3.5]]})
        },
        {
          "id": "b7",
          "type": "mc",
          "level": 2,
          "topic": "ripple-trimming",
          "obj": 0,
          "stem": "The middle clip was removed. Which result is this?",
          "options": [
            "A normal delete that leaves a gap.",
            "A ripple delete that closes the gap.",
            "A clip inserted into a cut.",
            "A new track placed under the first."
          ],
          "alt": "Cut with a gap between 2 and 4 seconds.",
          "svg": Textbook.draw.editTimeline({"title":"After delete","length":6,"lanes":[{"name":"V1","clips":[["A",0,2],["Gap",2,4,"gap"],["C",4,6]]}]})
        },
        {
          "id": "b8",
          "type": "mc",
          "level": 2,
          "topic": "layers-and-b-roll-tracks",
          "obj": 0,
          "stem": "What picture and sound play at the mark?",
          "options": [
            "The interview picture and the detail’s sound.",
            "Only the detail with silence.",
            "The detail over the interview’s sound.",
            "The interview picture and its sound."
          ],
          "alt": "The interview fills V1 from 0 to 8 seconds. There is a detail on V2 from 2 to 4. The interview sound runs underneath on A1.",
          "svg": Textbook.draw.editTimeline({"title":"Tracks at 3 seconds","length":8,"lanes":[{"name":"V2","clips":[["Detail",2,4,"detail"]]},{"name":"V1","clips":[["Interview",0,8]]},{"name":"A1","clips":[["Interview sound",0,8]]}],"marks":[["3 s",3]]})
        }
      ]
    },
    {
      "title": "Section C · Solve it",
      "note": "(Level 3)",
      "items": [
        {
          "id": "c1",
          "type": "mc",
          "level": 3,
          "topic": "ingest-and-verify-media",
          "obj": 1,
          "stem": "Source and the card both have 18 clips. One Source clip won’t play. What should you do first?",
          "options": [
            "Format the card because the counts match.",
            "Copy that clip again and play it before clearing the card.",
            "Rename the clip and delete the original.",
            "Only watch another clip with the same extension."
          ],
          "alt": "Card: 18 clips. Source: 18 clips, 04 fails to play.",
          "svg": Textbook.draw.editCards("Camera to drive", [["Card","18 clips"],["Source","18 clips","04 won’t open"]])
        },
        {
          "id": "c2",
          "type": "mc",
          "level": 3,
          "topic": "import-and-place-clips",
          "obj": 1,
          "stem": "A sequence should show the hall, the table, then the detail. What should you append to this cut?",
          "options": [
            "The book detail",
            "The hall a second time",
            "The table a second time",
            "The sound recorder file on V1"
          ],
          "alt": "Hall 0 to 2, Table 2 to 4, then empty on V1.",
          "svg": Textbook.draw.editTimeline({"title":"The cut so far","length":6,"lanes":[{"name":"V1","clips":[["Hall",0,2],["Table",2,4]]}]})
        },
        {
          "id": "c3",
          "type": "mc",
          "level": 3,
          "topic": "move-and-reorder-clips",
          "obj": 1,
          "stem": "Your timeline plays Walk, React, Open, Sit. What order lets a viewer see the cause of the reaction?",
          "options": [
            "Walk, Open, React, Sit",
            "Sit, React, Walk, Open",
            "React, Open, Walk, Sit",
            "Walk, Sit, Open, React"
          ]
        },
        {
          "id": "c4",
          "type": "mc",
          "level": 3,
          "topic": "trim-beginnings-and-endings",
          "obj": 1,
          "stem": "The important action ends at 6 seconds, with 3 more seconds of waiting. Which trim takes away the wait?",
          "options": [
            "Move the In point to 6 seconds.",
            "Move the Out point to 9 seconds.",
            "Move the Out point to 6 seconds.",
            "Move the entire clip to 6 seconds."
          ],
          "alt": "Action from 0 to 6, blank tail from 6 to 9.",
          "svg": Textbook.draw.editTimeline({"title":"End of the action","length":9,"lanes":[{"name":"V1","clips":[["Action",0,6],["Wait",6,9,"gap"]]}],"marks":[["Action ends",6]]})
        },
        {
          "id": "c5",
          "type": "mc",
          "level": 3,
          "topic": "insert-versus-overwrite",
          "obj": 1,
          "stem": "A six-second cut must stay six seconds. At the two-second mark, replace the next two seconds with the book shot. Which action fits?",
          "options": [
            "Insert the book shot at 2 seconds.",
            "Overwrite with the two-second book shot at 2 seconds.",
            "Append the book shot after the last clip.",
            "Replace the entire four-second shot with two seconds."
          ],
          "alt": "Hall 0–2 seconds, Sit 2–6 seconds, marker at second 2.",
          "svg": Textbook.draw.editTimeline({"title":"6-second draft","length":6,"lanes":[{"name":"V1","clips":[["Hall",0,2],["Sit",2,6]]}],"marks":[["Edit",2]]}),
          "targets": [
            {
              "topic": "insert-versus-overwrite",
              "obj": 0
            }
          ]
        },
        {
          "id": "c6",
          "type": "mc",
          "level": 3,
          "topic": "timeline-zoom-and-sizing",
          "obj": 1,
          "stem": "You need to see the waveform and catch the cut edge as a clip approaches. What combination helps?",
          "options": [
            "Increase audio gain and turn off snapping.",
            "Zoom the viewer in and lock the timeline.",
            "Mute A1 and adjust the Media Pool zoom.",
            "Make A1 taller and enable snapping."
          ]
        },
        {
          "id": "c7",
          "type": "mc",
          "level": 3,
          "topic": "linked-video-and-audio",
          "obj": 1,
          "stem": "The hands meet at 2 s and the clap sounds at 2.5 s. What fix keeps the picture where it is?",
          "options": [
            "Unlink, move only A1 half a second earlier, then link again.",
            "Link the pair immediately and play it again.",
            "Move both clips half a second earlier.",
            "Move A1 half a second later and link again."
          ],
          "alt": "Video contact at 2.0 seconds and audio clap at 2.5 seconds.",
          "svg": Textbook.draw.editCards("Check sync", [["V1 contact","2.0 seconds"],["A1 clap","2.5 seconds"]]),
          "targets": [
            {
              "topic": "linked-video-and-audio",
              "obj": 0
            }
          ]
        }
      ]
    },
    {
      "title": "Section D · Explain your decisions",
      "note": "(Level 4)",
      "items": [
        {
          "id": "d1",
          "type": "written",
          "level": 4,
          "topic": "split-remove-and-close-gaps",
          "obj": 1,
          "stem": "A take has a cough between two clear sentences. Describe the two cuts and how you remove the cough. Then explain how to shorten the first sentence without adding a gap.",
          "targets": [
            {
              "topic": "ripple-trimming",
              "obj": 1
            }
          ],
          "lines": 5,
          "sketch": 1
        },
        {
          "id": "d2",
          "type": "written",
          "level": 4,
          "topic": "restore-and-relink-media",
          "obj": 0,
          "stem": "Your timeline shows Media Offline after a folder move. The final cut should begin from black and show one B-roll detail over the interview. Describe how to find and verify the right clip, then set up the fade and B-roll.",
          "targets": [
            {
              "topic": "restore-and-relink-media",
              "obj": 1
            },
            {
              "topic": "opacity-picture-fades-and-keyframes",
              "obj": 1
            },
            {
              "topic": "layers-and-b-roll-tracks",
              "obj": 1
            }
          ],
          "lines": 5,
          "sketch": 1
        }
      ]
    }
  ]
};
