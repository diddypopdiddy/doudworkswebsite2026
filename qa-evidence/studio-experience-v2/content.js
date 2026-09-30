export const projectCategories = {
  ai: {
    label: "AI",
    projects: [
      {
        id: "ai-educator-playbook",
        name: "AI Educator Playbook",
        summary: "A practical guide to teaching and learning with AI. The Playbook brings together the AI Production Framework, the Field Guide, and classroom examples for deciding where AI belongs and what the learner still needs to do.",
        highlights: ["Explore AI concepts and responsible-use decisions.", "Use the Framework and Field Guide within one resource.", "Plan for human judgment, verification, and revision."],
        status: "Educator resource",
        action: "Open the Playbook",
        href: "https://ai-educator-playbook-vince-doud.diddypopdiddy.chatgpt.site",
        localHref: "http://127.0.0.1:4194/",
        newTab: true
      },
      {
        id: "ai-road-test",
        name: "The AI Road Test",
        summary: "A driving game about AI decisions. Explore the neighborhood, pull into question stops, and work through choices about prompting, privacy, ethics, and verification before heading back to the testing center.",
        highlights: ["Drive between marked question stops.", "Answer AI-use scenarios and earn fuel and permit stamps.", "Return to the testing center to finish the run."],
        status: "Interactive driving game",
        action: "Play the game",
        href: "https://ai-road-test-vince-doud.diddypopdiddy.chatgpt.site",
        localHref: "http://127.0.0.1:5173/",
        newTab: true
      },
      {
        id: "write-with-ai",
        name: "Write with AI",
        summary: "A two-round writing activity for examining how AI changes the work. Write, review the conversation, discuss the choices, then try again and compare how much of the thinking and revision remains your own.",
        highlights: ["Make a first attempt with AI support.", "Review the conversation and discuss authorship.", "Try a second round, revise, and compare your decisions."],
        status: "Classroom writing activity",
        localNote: "The live AI connection needs configuration before classroom use.",
        action: "Open the activity",
        href: "https://write-with-ai-vince-doud.diddypopdiddy.chatgpt.site",
        localHref: "http://127.0.0.1:4178/",
        newTab: true
      }
    ]
  },
  video: {
    label: "Video",
    projects: []
  },
  music: {
    label: "Music",
    projects: [
      {
        id: "diddy-pop-diddy-bandcamp",
        name: "Diddy Pop Diddy on Bandcamp",
        summary: "Original music by Vince Doud, a multi-instrumentalist working across guitar, drums, keys, and independent recording and production.",
        status: "Bandcamp artist page",
        href: "https://diddypopdiddy.bandcamp.com/",
        newTab: true
      }
    ]
  },
  art: {
    label: "Art",
    projects: []
  },
  teaching: {
    label: "Teaching",
    projects: [
      {
        id: "interactive-video-textbook",
        name: "The Moving Image",
        summary: "An interactive video-production textbook that connects reading with practice. Move from computer and file foundations through film history, camera language, editing, lighting, and sound, then bring those decisions into a production project.",
        highlights: ["Read connected chapters and try focused practice tools.", "Explore framing, continuity, editing, lighting, and sound.", "Develop a project with portable plans and evidence of the process."],
        status: "Interactive digital textbook · In development",
        action: "Open the textbook",
        localHref: "http://localhost:4210/",
        accessNote: "The latest edition is currently available for local review.",
        newTab: true
      },
      {
        id: "sk8maps",
        name: "SK8MAPS",
        summary: "My teaching workspace for keeping the plan connected to the school day. I develop and revise lessons with Codex; SK8MAPS organizes the saved work into calendars, daily lessons, class views, and a resource library.",
        highlights: ["Plan from school schedules, curriculum, and teacher-selected sources.", "See lessons by day, week, class, and project stage.", "Present editable opening slides and run classroom timers.", "Keep resources, class notes, and project timelines together."],
        status: "Private teaching workspace",
        accessNote: "Built for my classroom. This is a project overview; the workspace and classroom records stay private.",
        overview: true
      }
    ]
  },
  custom: {
    label: "Custom Builds",
    projects: [
      {
        id: "dry-eye-clinical-support",
        name: "Dry Eye Clinical Decision Support",
        summary: "De-identified clinical decision support built around deterministic rules, doctor review, and staff voice practice.",
        status: "Hosted clinical platform",
        href: "https://premier-eye-clinical-platform.diddypopdiddy.chatgpt.site",
        newTab: true
      },
      {
        id: "jmcd-hair-extension-preview",
        name: "JMCD Hair Extension Preview Studio",
        summary: "A custom image-editing tool for previewing hair-extension length, fullness, finish, and color while preserving the person’s identity and changing only their hair.",
        status: "Public prototype",
        href: "https://jmcd-extension-preview.diddypopdiddy.chatgpt.site",
        newTab: true
      }
    ]
  }
};


export const previews = {
 'ai-production-framework': 'ai-production-framework-structure-transparent-v1.png',
 'ai-educator-playbook': 'ai-educator-playbook-2026-09-27.png',
 'ai-permit-field-guide': 'ai-permit-field-guide-v4-branded-cover.png',
 'ai-road-test': 'ai-road-test-2026-09-27.png',
 'write-with-ai': 'write-with-ai-2026-09-27.png',
 'interactive-video-textbook': 'moving-image-2026-09-27.png',
 'agentic-continuity': 'continuity-teacher-pilot-current-v2.png',
 'dry-eye-clinical-support': 'premier-eye-clinical-platform.png'
};
export const artworks = [
 {title:'Abstract study', file:'abstract-study.jpg', medium:'Color / composition'},
 {title:'Ink structure', file:'ink-structure.jpg', medium:'Line / form'},
 {title:'Blue door', file:'blue-door-photo.jpg', medium:'Photography'},
 {title:'Sketchbook', file:'sketchbook-spread.jpg', medium:'Works in progress'},
 {title:'Material study', file:'material-object.jpg', medium:'Objects / texture'}
];
export {tracks} from './album-tracks.js?v=20260927-bandcamp';
