(function () {
  const T = window.Textbook, D = T.draw;
  T.topic({
  "slug": "file-explorer-navigation",
  "minutes": 12,
  "bigIdea": "Every file has an address.",
  "hook": {
    "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
    "alt": "A common path ends at The Note. The rows show three branches.",
    "question": "How many folders below This PC do you enter to reach S04_master.mp4?",
    "options": [
      "Four",
      "Three"
    ],
    "answer": 0,
    "reveal": "Documents, Video, The Note and Source are four folders. Together with the drive and filename, they form the [[file path]]."
  },
  "notes": {
    "sketch": "Trace two routes with their shared parent.",
    "frames": 2,
    "frameLabels": [
      "Source route",
      "Exports route"
    ],
    "think": "Why is a filename alone sometimes insufficient?"
  },
  "vocab": [
    "file-explorer",
    "folder",
    "file-path",
    "address-bar"
  ],
  "review": [
    "open"
  ],
  "objectives": [
    "Read the parent folders in a file path.",
    "Reach a named file by following folders or entering an address."
  ],
  "sections": [
    {
      "title": "Read a path from left to right",
      "intro": "The first name tells you which drive to open.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>In Windows, [[File Explorer]] displays the current [[folder]]. Each part of the [[file path]] is one step from the drive.</p><p>Read the [[address bar]] to see where you are. Enter a full folder address to go there directly.</p>"
        },
        {
          "type": "figure",
          "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
          "alt": "Folder tree with Source, Project and Exports below The Note.",
          "caption": "The three folders share a parent."
        },
        {
          "type": "callout",
          "kind": "consider",
          "title": "On a Chromebook",
          "html": "Open Files. My files is on this device. Google Drive is a separate location linked to your account."
        }
      ]
    },
    {
      "title": "Follow a branch",
      "intro": "Try two routes to the same folder.",
      "blocks": [
        {
          "type": "text",
          "html": "<p>Follow the folders to Source. Use Back once. Type This PC > Documents > Video > The Note > Source and choose Go.</p>"
        },
        {
          "type": "desktop-sim",
          "fs": {
            "drives": [
              {
                "id": "pc",
                "label": "This PC",
                "children": [
                  {
                    "name": "Documents",
                    "folder": true,
                    "children": [
                      {
                        "name": "Video",
                        "folder": true,
                        "children": [
                          {
                            "name": "The Note",
                            "folder": true,
                            "children": [
                              {
                                "name": "Source",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "S04_master.mp4"
                                  }
                                ]
                              },
                              {
                                "name": "Project",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "TheNote_edit.prproj"
                                  }
                                ]
                              },
                              {
                                "name": "Exports",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "TheNote_final.mp4"
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "usb",
                "label": "USB Drive",
                "children": [
                  {
                    "name": "S04_master.mp4"
                  },
                  {
                    "name": "S06_book.mp4"
                  }
                ]
              }
            ]
          },
          "start": "pc",
          "tasks": []
        }
      ]
    },
    {
      "title": "Try it yourself",
      "intro": "Follow Documents, Video, The Note, then Source. Open S04_master.mp4.",
      "blocks": [
        {
          "type": "desktop-sim",
          "fs": {
            "drives": [
              {
                "id": "pc",
                "label": "This PC",
                "children": [
                  {
                    "name": "Documents",
                    "folder": true,
                    "children": [
                      {
                        "name": "Video",
                        "folder": true,
                        "children": [
                          {
                            "name": "The Note",
                            "folder": true,
                            "children": [
                              {
                                "name": "Source",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "S04_master.mp4"
                                  }
                                ]
                              },
                              {
                                "name": "Project",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "TheNote_edit.prproj"
                                  }
                                ]
                              },
                              {
                                "name": "Exports",
                                "folder": true,
                                "children": [
                                  {
                                    "name": "TheNote_final.mp4"
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "usb",
                "label": "USB Drive",
                "children": [
                  {
                    "name": "S04_master.mp4"
                  },
                  {
                    "name": "S06_book.mp4"
                  }
                ]
              }
            ]
          },
          "start": "pc",
          "tasks": [
            {
              "text": "Follow Documents, Video, The Note, then Source. Open S04_master.mp4.",
              "check": s => s.previewed.includes("This PC > Documents > Video > The Note > Source > S04_master.mp4"),
              "sticky": true
            },
            {
              "text": "Use Back to reach the other branches. Open TheNote_edit.prproj in Project.",
              "check": s => s.previewed.includes("This PC > Documents > Video > The Note > Project > TheNote_edit.prproj"),
              "sticky": true
            },
            {
              "text": "Type the path to Exports in the address bar, press Go, then open TheNote_final.mp4.",
              "check": s => s.previewed.includes("This PC > Documents > Video > The Note > Exports > TheNote_final.mp4"),
              "sticky": true
            }
          ]
        }
      ]
    }
  ],
  "check": [
    {
      "q": "Which folder directly contains the finished video?",
      "options": [
        {
          "text": "The Note",
          "clue": "Look one step before the filename."
        },
        "Exports"
      ],
      "answer": 1,
      "explain": "The final file sits inside Exports.",
      "svg": "<svg viewBox=\"0 0 320 180\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"Inter,sans-serif\"><rect width=\"320\" height=\"180\" rx=\"8\" fill=\"#f3f1ec\"/><rect x=\"12\" y=\"14\" width=\"296\" height=\"32\" rx=\"5\" fill=\"#263a65\"/><text x=\"22\" y=\"35\" font-size=\"12\" font-weight=\"700\" fill=\"white\">This PC  ›  Documents  ›  Video  ›  The Note</text><rect x=\"20\" y=\"57\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 63h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"74\" font-size=\"12\" fill=\"#171b1f\">Source    ›    S04_master.mp4</text><rect x=\"20\" y=\"86\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 92h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"103\" font-size=\"12\" fill=\"#171b1f\">Project    ›    TheNote_edit.prproj</text><rect x=\"20\" y=\"115\" width=\"278\" height=\"25\" rx=\"3\" fill=\"#fff\" stroke=\"#dbd8d1\"/><path d=\"M29 121h8l3 3h8v10H29z\" fill=\"#b86533\"/><text x=\"58\" y=\"132\" font-size=\"12\" fill=\"#171b1f\">Exports    ›    TheNote_final.mp4</text></svg>",
      "alt": "The final file sits inside Exports."
    },
    {
      "q": "Two drives each contain a folder named Video. What part of the path distinguishes them?",
      "options": [
        {
          "text": "The folder name Video",
          "clue": "Read from the far left."
        },
        "The first name, the drive"
      ],
      "answer": 1,
      "explain": "The drive identifies the starting location."
    },
    {
      "q": "You opened Source instead of Project. Which route stays within The Note?",
      "options": [
        "Back once, then Project",
        {
          "text": "Open the USB drive",
          "clue": "The two destinations share a parent."
        }
      ],
      "answer": 0,
      "explain": "Back returns to The Note, where Project is visible."
    }
  ],
  "remember": [
    "A [[file path]] names each step from the drive.",
    "The [[address bar]] shows the current location.",
    "Use [[File Explorer]] to open a [[folder]] or enter its address."
  ],
  "realCameraTitle": "Try it on your computer",
  "realCamera": "Find a photo on a connected phone or in a school photo folder. Record its path so another person could locate it."
});
})();
