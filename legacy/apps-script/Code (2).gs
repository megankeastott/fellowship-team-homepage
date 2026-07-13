// ============================================================
// THE FELLOWSHIP OF THE FIX — WEB APP ROUTER
// ============================================================
//
// One Apps Script web app serves every page. The page key comes
// from the URL: ...?page=announcements, ...?page=fraud-flags, etc.
// The default page (no param) is Home.
//
// SETUP:
//   1. Create a new Apps Script project at script.google.com.
//   2. Replace the default Code.gs with this file.
//   3. Create HTML files (File -> New -> HTML file) named exactly:
//        Shell, Home, DocPage, Hub, TeamHub
//      and paste in the matching templates from this package.
//   4. Create one Google Doc per doc-driven page (Announcements,
//      Archives, Work Expectations, Scheduling, Fraud Flags,
//      Documentation, Micro Trainings, Training Materials).
//      Paste their IDs into the DOC_IDS map below.
//   5. Update BINGO_URL to point to your Bingo deployment.
//   6. Deploy: Deploy -> New deployment -> Web app
//        Execute as: Me
//        Who has access: Anyone (or your domain)
// ============================================================


// ============================================================
// CONFIG — edit these
// ============================================================

// Doc IDs. Leave as 'TODO' until the Doc exists; the page will
// show a setup message rather than erroring out.
const DOC_IDS = {
  announcements:      'TODO',
  archives:           'TODO',
  workExpectations:   'TODO',
  scheduling:         'TODO',
  fraudFlags:         'TODO',
  documentation:      'TODO',
  microTrainings:     'TODO',
  trainingMaterials:  'TODO'
};

// External URLs (apps that live outside this web app).
const BINGO_URL = 'TODO';  // paste the Bingo deployment URL here

// Cache duration for doc-driven pages (seconds).
const CACHE_DURATION_SECONDS = 300;


// ============================================================
// ROUTES — the site map
// ============================================================

const ROUTES = {
  'home': {
    kind: 'home',
    title: 'Home'
  },
  'announcements': {
    kind: 'doc',
    title: 'Announcements',
    docId: DOC_IDS.announcements,
    sectionAsset: 'candle'
  },
  'archives': {
    kind: 'doc',
    title: 'The Archives',
    docId: DOC_IDS.archives,
    archive: true,
    sectionAsset: 'candle',
    parent: 'announcements'
  },
  'reminders': {
    kind: 'hub',
    title: 'Reminders',
    sectionAsset: 'tome',
    children: ['work-expectations', 'scheduling', 'fraud-flags']
  },
  'work-expectations': {
    kind: 'doc',
    title: 'Work Expectations',
    description: 'Hours, attendance, conduct, and core team expectations.',
    docId: DOC_IDS.workExpectations,
    parent: 'reminders',
    color: 'hearth'
  },
  'scheduling': {
    kind: 'doc',
    title: 'Scheduling & Time Off',
    description: 'How to request time off, shift swaps, and schedule changes.',
    docId: DOC_IDS.scheduling,
    parent: 'reminders',
    color: 'evenstar'
  },
  'fraud-flags': {
    kind: 'doc',
    title: 'Fraud Flags',
    description: 'Red flags to watch for and what to do when you spot them.',
    docId: DOC_IDS.fraudFlags,
    parent: 'reminders',
    color: 'shadow'
  },
  'resources': {
    kind: 'hub',
    title: 'Resources',
    sectionAsset: 'tome',
    children: ['documentation', 'micro-trainings', 'training-materials']
  },
  'documentation': {
    kind: 'doc',
    title: 'Documentation',
    description: 'Reference docs, process guides, and procedural how-tos.',
    docId: DOC_IDS.documentation,
    parent: 'resources',
    color: 'evenstar'
  },
  'micro-trainings': {
    kind: 'doc',
    title: 'Micro Trainings',
    description: 'Short, focused training modules — quick wins.',
    docId: DOC_IDS.microTrainings,
    parent: 'resources',
    color: 'shire'
  },
  'training-materials': {
    kind: 'doc',
    title: 'Training Materials',
    description: 'Onboarding materials and longer-form training content.',
    docId: DOC_IDS.trainingMaterials,
    parent: 'resources',
    color: 'earthen'
  },
  'team-hub': {
    kind: 'team-hub',
    title: 'The Shire — Team Hub'
  }
};


// ============================================================
// NAV ITEMS — top nav row, same on every page
// ============================================================
// Plain text labels. Order = left-to-right. Current page highlights in gold.
const NAV_ITEMS = [
  { page: 'home',          label: 'Home' },
  { page: 'announcements', label: 'Announcements' },
  { page: 'reminders',     label: 'Reminders' },
  { page: 'resources',     label: 'Resources' },
  { page: 'team-hub',      label: 'Team Hub' },
  { page: 'archives',      label: 'The Archives' }
];


// ============================================================
// HOME PAGE DATA — Team Leads & Seniors + LOD Schedule
// ============================================================
//
// Edit these directly when something changes. Then redeploy:
//   Deploy -> Manage deployments -> pencil icon -> Version: New version -> Deploy
// The URL stays the same.

const TEAM_LEADS = [
  {
    name: 'Megan',
    role: 'Team Lead',
    color: 'shire',
    medallion: 'https://i.imgur.com/QKYlfoy.png',
    bio: [
      'I am Megan. My focus is all things tutor support and tutor support related projects.',
      'I am constantly doing something, but my DMs and Google Meets are available. If you need to discuss something, have a question, or concern — feel free to reach out.'
    ],
    link: { text: 'Book time with me', url: 'https://calendar.app.google/Khen98WJU9yC1koz5' }
  },
  {
    name: 'Gus',
    role: 'Team Lead',
    color: 'evenstar',
    medallion: 'https://i.imgur.com/GU50Mlg.png',
    bio: [
      'Lead with a major focus on Platform Support and all things tech. Jack of all trades, master of none.',
      'I do things outside of work that do not include my computer.'
    ],
    funFact: 'I was an extra in the movie Hitch and Indiana Jones.'
  },
  {
    name: 'Andrezza',
    role: 'Senior Specialist',
    color: 'twilight',
    medallion: 'https://i.imgur.com/h2aJ4wL.png',
    bio: [
      'I am a Senior Operations Support Specialist (from Brazil), Buffy expert, mother of four beautiful cats, and retired musician.',
      'If you ever need me my DMs are open and so is my Google Meets!'
    ]
  },
  {
    name: 'Erika',
    role: 'Senior Specialist',
    color: 'hearth',
    medallion: 'https://i.imgur.com/0kgXhBw.png',
    bio: [
      "Hi team! I'm Erika, Senior Operations Support Specialist—an anxious person at heart, but actively trying not to be.",
      "If you need me, I'm usually on Slack—maybe overthinking something, maybe trying not to drown, or just checking for updates. Either way, feel free to reach out anytime."
    ]
  }
];

// LOD Schedule. Each day has slots; time + agent.
// agentKey controls the name color (see AGENT_COLORS).
const LOD_SCHEDULE = [
  { day: 'Sunday',    color: 'shadow',   slots: [
    { time: '07:00 – 11:00', agent: 'Andrezza', agentKey: 'andrezza' },
    { time: '11:00 – 15:00', agent: 'Joao',     agentKey: 'joao' },
    { time: '15:00 – 19:00', agent: 'Andro',    agentKey: 'andro' },
    { time: '19:00 – 21:00', agent: 'Megan',    agentKey: 'megan' }
  ]},
  { day: 'Monday',    color: 'twilight', slots: [
    { time: '07:00 – 11:00', agent: 'Andrezza', agentKey: 'andrezza' },
    { time: '11:00 – 14:00', agent: 'Megan',    agentKey: 'megan' },
    { time: '14:00 – 16:00', agent: 'Andro',    agentKey: 'andro' },
    { time: '16:00 – 21:00', agent: 'Joao',     agentKey: 'joao' }
  ]},
  { day: 'Tuesday',   color: 'evenstar', slots: [
    { time: '07:00 – 10:00', agent: 'Andrezza', agentKey: 'andrezza' },
    { time: '10:00 – 13:00', agent: 'Erika',    agentKey: 'erika' },
    { time: '13:00 – 15:00', agent: 'Joao',     agentKey: 'joao' },
    { time: '15:00 – 18:00', agent: 'Andro',    agentKey: 'andro' },
    { time: '18:00 – 21:00', agent: 'Lu',       agentKey: 'lu' }
  ]},
  { day: 'Wednesday', color: 'shire',    slots: [
    { time: '07:00 – 11:00', agent: 'Erika',    agentKey: 'erika' },
    { time: '11:00 – 14:00', agent: 'Andro',    agentKey: 'andro' },
    { time: '14:00 – 16:00', agent: 'Lu',       agentKey: 'lu' },
    { time: '16:00 – 21:00', agent: 'Andrezza', agentKey: 'andrezza' }
  ]},
  { day: 'Thursday',  color: 'hearth',   slots: [
    { time: '07:00 – 10:00', agent: 'Erika',    agentKey: 'erika' },
    { time: '10:00 – 14:00', agent: 'Andrezza', agentKey: 'andrezza' },
    { time: '14:00 – 17:00', agent: 'Lu',       agentKey: 'lu' },
    { time: '17:00 – 21:00', agent: 'Andro',    agentKey: 'andro' }
  ]},
  { day: 'Friday',    color: 'earthen',  slots: [
    { time: '07:00 – 11:00', agent: 'Erika',    agentKey: 'erika' },
    { time: '11:00 – 14:00', agent: 'Joao',     agentKey: 'joao' },
    { time: '14:00 – 17:00', agent: 'Lu',       agentKey: 'lu' },
    { time: '17:00 – 21:00', agent: 'Gus',      agentKey: 'gus' }
  ]},
  { day: 'Saturday',  color: 'shadow',   fullWidth: true, slots: [
    { time: '07:00 – 10:00', agent: 'Gus',      agentKey: 'gus' },
    { time: '10:00 – 14:00', agent: 'Joao',     agentKey: 'joao' },
    { time: '14:00 – 18:00', agent: 'Lu',       agentKey: 'lu' },
    { time: '18:00 – 21:00', agent: 'Erika',    agentKey: 'erika' }
  ]}
];

// Agent medallion images (used in Home's "Now On Duty" hero and Team
// Leads footer). Agents not listed here fall back to a colored initial
// circle on the home page.
const AGENT_MEDALLIONS = {
  megan:    'https://i.imgur.com/QKYlfoy.png',
  gus:      'https://i.imgur.com/GU50Mlg.png',
  andrezza: 'https://i.imgur.com/h2aJ4wL.png',
  erika:    'https://i.imgur.com/0kgXhBw.png'
};

// ============================================================
// TEAM HUB DATA — edit here, redeploy to update the Team Hub page.
// ============================================================

// The Red Book. Leadership is always shown first as a separate ledger.
// fellowship[].team values:
//   'guardians' = Guardians of the Living Platform (LLP Support)
//   'wardens'   = Wardens of the Tutor Realm (TES Support)
// Reorder, rename, or split as needed.
const TEAM_ROSTER = {
  leadership: [
    { name: 'Megan Keast-Ott',  title: 'Team Lead — Tutor Support' },
    { name: 'Gus Duran',        title: 'Team Lead — Platform Support' },
    { name: 'Andrezza Ribeiro', title: 'Senior Operations Support Specialist' },
    { name: 'Erika Sanchez',    title: 'Senior Operations Support Specialist' }
  ],
  fellowship: [
    // TODO: confirm sub-team for each agent below — guess based on LOD schedule.
    { name: 'Joao Pimenta',       title: 'Operations Support Specialist', team: 'guardians' },
    { name: 'Luciana Zaracho',    title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Bianca Correia',     title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Marvin Beltre',      title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Yulennys Medina',    title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Rusking Gonzalez',   title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Nhadinne MenaYema',  title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Giovanna Capanema',  title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Rebeca Gardie',      title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Deivid Zatti',       title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Mariefaye Lat',      title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Beatriz Vinas',      title: 'Operations Support Specialist', team: 'wardens'   },
    { name: 'Dalia Agramonte',    title: 'Operations Support Specialist', team: 'wardens'   }
  ]
};

// The Dragon's Hoard. Current prizes & incentive structure.
// Add/remove items freely. Each item appears as a row in the Hoard card.
const INCENTIVES = {
  period: 'Monthly',
  items: [
    {
      name: 'End-of-Month Raffle',
      prize: '$50',
      detail: 'Drawn from raffle entries earned across the month. Extra entries come from Bingo wins and superlative nominations.'
    },
    {
      name: 'Things Tutors Say — Bingo',
      prize: '$25 × 2 winners',
      detail: 'Five rounds. Win three out of five to claim a prize.'
    }
  ]
};

// Tales Told at the Green Dragon. Most recent superlative round results.
// Update after each round closes — edit `round` number, prompt, and winners.
const SUPERLATIVES = {
  round: 4,
  prompt: 'Round 4 — nominated by the team via Slack thread.',
  // Leave winners[] empty to show a "tallying in progress" placeholder.
  winners: [
    // { tale: 'Most Likely to Make You Laugh During a Rough Shift', name: 'TODO' },
    // { tale: 'Most Likely to Survive a Zombie Apocalypse', name: 'TODO' },
    // { tale: 'Most Likely to Remember Your Birthday', name: 'TODO' },
    // { tale: 'Most Likely to Disappear and Come Back With a Wild Story', name: 'TODO' }
  ]
};



// ============================================================
// CONSTANTS — usually don't need to change
// ============================================================

const VALID_COLORS = ['shire', 'hearth', 'evenstar', 'earthen', 'shadow', 'twilight'];

const SECTION_ASSETS = {
  'candle':  { img: 'https://i.imgur.com/ZNXhhfb.png', cls: 'candle-img' },
  'tome':    { img: 'https://i.imgur.com/u4SC2da.png', cls: '' },
  'door':    { img: 'https://i.imgur.com/qQoxF1V.png', cls: '' },
  'quill':   { img: 'https://i.imgur.com/7VdlgsC.png', cls: '' },
  'lantern': { img: 'https://i.imgur.com/jslbRTo.png', cls: '' },
  'mug':     { img: 'https://i.imgur.com/fNOsDGD.png', cls: '' }
};


// ============================================================
// ROUTER — entry point
// ============================================================

function doGet(e) {
  var params = (e && e.parameter) || {};
  var pageKey = params.page || 'home';
  var route = ROUTES[pageKey];
  var forceRefresh = (params.refresh === '1');

  if (!route) {
    return renderError('Page not found',
      'No page is configured for <code>?page=' + escapeHtml(pageKey) + '</code>.');
  }

  var bodyTemplate, bodyData = {};

  if (route.kind === 'doc') {
    bodyTemplate = 'DocPage';
    bodyData.content    = getDocContent(route.docId, forceRefresh);
    bodyData.pageTitle  = route.title;
    bodyData.archive    = !!route.archive;
    bodyData.parent     = route.parent ? {
      page: route.parent,
      title: ROUTES[route.parent].title,
      url: buildPageUrl(route.parent)
    } : null;
  } else if (route.kind === 'hub') {
    bodyTemplate = 'Hub';
    bodyData.pageTitle    = route.title;
    bodyData.sectionAsset = getAssetForKey(route.sectionAsset);
    bodyData.children     = (route.children || []).map(function(key) {
      var r = ROUTES[key];
      return {
        page: key,
        title: r.title,
        description: r.description || '',
        color: r.color || 'shire',
        url: buildPageUrl(key)
      };
    });
  } else if (route.kind === 'home') {
    bodyTemplate = 'Home';
    bodyData.leads             = TEAM_LEADS;
    bodyData.schedule          = LOD_SCHEDULE;
    bodyData.agentMedallions   = AGENT_MEDALLIONS;
    bodyData.latestDispatches  = getLatestDispatches(4);
    bodyData.announcementsUrl  = buildPageUrl('announcements');
  } else if (route.kind === 'team-hub') {
    bodyTemplate = 'TeamHub';
    bodyData.bingoUrl     = BINGO_URL;
    bodyData.roster       = TEAM_ROSTER;
    bodyData.incentives   = INCENTIVES;
    bodyData.superlatives = SUPERLATIVES;
  } else {
    return renderError('Unknown page kind', 'Route kind "' + escapeHtml(route.kind) + '" not implemented.');
  }

  return renderWithShell(bodyTemplate, bodyData, {
    pageKey: pageKey,
    pageTitle: route.title,
    pageKind: route.kind
  });
}

function renderWithShell(bodyFile, bodyData, shellInfo) {
  // 1. Render the body template
  var bodyT = HtmlService.createTemplateFromFile(bodyFile);
  Object.keys(bodyData).forEach(function(k) { bodyT[k] = bodyData[k]; });
  var bodyContent = bodyT.evaluate().getContent();

  // 2. Render the shell, slotting in the body
  var shellT = HtmlService.createTemplateFromFile('Shell');
  shellT.bodyContent = bodyContent;
  shellT.pageTitle   = shellInfo.pageTitle;
  shellT.pageKey     = shellInfo.pageKey;
  shellT.pageKind    = shellInfo.pageKind;
  shellT.navItems    = NAV_ITEMS.map(function(item) {
    return {
      url: buildPageUrl(item.page),
      label: item.label,
      isCurrent: item.page === shellInfo.pageKey
    };
  });
  shellT.refreshUrl = buildRefreshUrl(shellInfo.pageKey);
  shellT.showRefresh = (shellInfo.pageKind === 'doc' || shellInfo.pageKind === 'hub');

  return shellT.evaluate()
    .setTitle('Fellowship of the Fix — ' + shellInfo.pageTitle)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function buildPageUrl(pageKey) {
  var base = ScriptApp.getService().getUrl();
  if (pageKey === 'home') return base;
  return base + '?page=' + pageKey;
}

function buildRefreshUrl(pageKey) {
  var url = buildPageUrl(pageKey);
  return url + (url.indexOf('?') > -1 ? '&' : '?') + 'refresh=1';
}

function renderError(title, body) {
  var t = HtmlService.createTemplateFromFile('Shell');
  t.bodyContent = '<div style="padding:40px;text-align:center;"><h2 style="color:#c07060;font-family:Cinzel,serif;">'
                + escapeHtml(title) + '</h2><p>' + body + '</p></div>';
  t.pageTitle = title;
  t.pageKey = '';
  t.pageKind = 'error';
  t.navItems = NAV_ITEMS.map(function(item) {
    return { url: buildPageUrl(item.page), label: item.label, isCurrent: false };
  });
  t.refreshUrl = '';
  t.showRefresh = false;
  return t.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAssetForKey(key) {
  if (key && SECTION_ASSETS[key]) return SECTION_ASSETS[key];
  return { img: '', cls: '' };
}


// ============================================================
// DOC CONTENT — loading + caching
// ============================================================

function getDocContent(docId, forceRefresh) {
  if (!docId || docId === 'TODO') {
    return setupErrorContent('Setup Required',
      'No Doc has been assigned to this page yet. Open Code.gs and add this page\'s Doc ID to the <code>DOC_IDS</code> map at the top.');
  }

  var cache = CacheService.getScriptCache();
  var key = 'doc_' + docId;

  if (!forceRefresh) {
    var cached = cache.get(key);
    if (cached) {
      try { return JSON.parse(cached); }
      catch (err) { /* fall through */ }
    }
  }

  var parsed;
  try {
    parsed = parseDoc(docId);
  } catch (err) {
    return setupErrorContent('Cannot Open Doc',
      'The script could not open the doc. Check the ID is correct and that the deploying account has access. Error: <code>'
      + escapeHtml(err.toString()) + '</code>');
  }

  try {
    cache.put(key, JSON.stringify(parsed), CACHE_DURATION_SECONDS);
  } catch (err) {
    Logger.log('Cache skipped for ' + docId + ': ' + err);
  }
  return parsed;
}

function forceRefreshAllCaches() {
  // Useful from the script editor.
  var cache = CacheService.getScriptCache();
  Object.keys(DOC_IDS).forEach(function(k) {
    if (DOC_IDS[k] && DOC_IDS[k] !== 'TODO') {
      cache.remove('doc_' + DOC_IDS[k]);
    }
  });
  Logger.log('Caches cleared.');
}

// Pulls the first N cards from the Announcements doc for the
// home page's "Latest Dispatches" column. Returns [] if the doc
// isn't set up yet — the column shows a placeholder in that case.
function getLatestDispatches(n) {
  n = n || 4;
  if (!DOC_IDS.announcements || DOC_IDS.announcements === 'TODO') return [];
  try {
    var content = getDocContent(DOC_IDS.announcements, false);
    if (!content || !content.sections || !content.sections.length) return [];
    var cards = content.sections[0].cards || [];
    return cards.slice(0, n).map(function(c) {
      return { title: c.title, color: c.color };
    });
  } catch (e) {
    Logger.log('getLatestDispatches failed: ' + e);
    return [];
  }
}

function setupErrorContent(title, body) {
  return {
    sections: [{
      title: '',
      assetKey: null,
      cards: [{
        title: title,
        color: 'shadow',
        width: 'full',
        bodyHtml: '<p>' + body + '</p>'
      }]
    }],
    lastUpdated: new Date().toISOString()
  };
}


// ============================================================
// DOC PARSING
// ============================================================
//
// Reads a Google Doc and turns it into a structured tree of
// sections (Heading 1) and cards (Heading 2). See the editing
// guide for the conventions.

function parseDoc(docId) {
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();
  var sections = [];
  var curSection = null;
  var curCard = null;
  var listBuf = [];
  var listType = null;

  function flushList() {
    if (!listBuf.length || !curCard) { listBuf = []; listType = null; return; }
    var html = '<' + listType + '>';
    for (var i = 0; i < listBuf.length; i++) html += '<li>' + listBuf[i] + '</li>';
    html += '</' + listType + '>';
    curCard.bodyHtml += html;
    listBuf = [];
    listType = null;
  }

  function flushCard() {
    flushList();
    if (curCard) {
      if (!curSection) curSection = { title: '', assetKey: null, cards: [] };
      curCard.bodyHtml = postProcessTags(curCard.bodyHtml);
      curSection.cards.push(curCard);
      curCard = null;
    }
  }

  function flushSection() {
    flushCard();
    if (curSection) sections.push(curSection);
    curSection = null;
  }

  var n = body.getNumChildren();
  for (var i = 0; i < n; i++) {
    var child = body.getChild(i);
    var type = child.getType();

    if (type === DocumentApp.ElementType.PARAGRAPH) {
      var para = child.asParagraph();
      var heading = para.getHeading();
      var text = para.getText().trim();

      if (heading === DocumentApp.ParagraphHeading.HEADING1) {
        flushSection();
        var meta = parseHeadingMeta(text);
        curSection = { title: meta.title, assetKey: meta.bracket, cards: [] };
      } else if (heading === DocumentApp.ParagraphHeading.HEADING2) {
        flushCard();
        var cMeta = parseCardMeta(text);
        curCard = { title: cMeta.title, color: cMeta.color, width: cMeta.width, bodyHtml: '' };
      } else if (heading === DocumentApp.ParagraphHeading.HEADING3) {
        flushList();
        if (curCard && text) {
          curCard.bodyHtml += '<p class="subheading">' + renderInline(para) + '</p>';
        }
      } else {
        flushList();
        if (curCard && text) {
          curCard.bodyHtml += '<p>' + renderInline(para) + '</p>';
        }
      }
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      var item = child.asListItem();
      var glyph = item.getGlyphType();
      var newType = isOrderedGlyph(glyph) ? 'ol' : 'ul';
      if (listType && listType !== newType) flushList();
      listType = newType;
      listBuf.push(renderInline(item));
    }
    // Tables, embedded images, etc. — ignored for now.
  }
  flushSection();

  return { sections: sections, lastUpdated: new Date().toISOString() };
}

function isOrderedGlyph(g) {
  if (!g) return false;
  return g === DocumentApp.GlyphType.NUMBER ||
         g === DocumentApp.GlyphType.LATIN_LOWER ||
         g === DocumentApp.GlyphType.LATIN_UPPER ||
         g === DocumentApp.GlyphType.ROMAN_LOWER ||
         g === DocumentApp.GlyphType.ROMAN_UPPER;
}

function parseHeadingMeta(text) {
  var m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, bracket: null };
  return { title: m[1].trim(), bracket: m[2].trim().toLowerCase() };
}

function parseCardMeta(text) {
  var m = text.match(/^(.*?)\s*\[([^\]]+)\]\s*$/);
  if (!m) return { title: text, color: 'shire', width: 'half' };

  var parts = m[2].split(',').map(function(s) { return s.trim().toLowerCase(); });
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (p !== 'full' && p !== 'half' && VALID_COLORS.indexOf(p) === -1) {
      return { title: text, color: 'shire', width: 'half' };
    }
  }

  var color = 'shire', width = 'half';
  for (var j = 0; j < parts.length; j++) {
    if (parts[j] === 'full' || parts[j] === 'half') width = parts[j];
    else if (VALID_COLORS.indexOf(parts[j]) !== -1) color = parts[j];
  }
  return { title: m[1].trim(), color: color, width: width };
}

function renderInline(element) {
  var html = '';
  var num = element.getNumChildren();
  for (var i = 0; i < num; i++) {
    var child = element.getChild(i);
    if (child.getType() === DocumentApp.ElementType.TEXT) {
      html += renderTextRuns(child.asText());
    }
  }
  return html;
}

function renderTextRuns(textEl) {
  var str = textEl.getText();
  var n = str.length;
  if (n === 0) return '';

  var html = '';
  var start = 0;
  var curB = !!textEl.isBold(0);
  var curI = !!textEl.isItalic(0);
  var curLink = textEl.getLinkUrl(0) || null;

  for (var i = 1; i < n; i++) {
    var b = !!textEl.isBold(i);
    var it = !!textEl.isItalic(i);
    var link = textEl.getLinkUrl(i) || null;
    if (b !== curB || it !== curI || link !== curLink) {
      html += wrapRun(str.substring(start, i), curB, curI, curLink);
      start = i;
      curB = b; curI = it; curLink = link;
    }
  }
  html += wrapRun(str.substring(start, n), curB, curI, curLink);
  return html;
}

function wrapRun(str, bold, italic, link) {
  var out = escapeHtml(str);
  if (bold)   out = '<span class="bold">' + out + '</span>';
  if (italic) out = '<span class="italic">' + out + '</span>';
  if (link)   out = '<a href="' + escapeHtml(link) + '" target="_blank" rel="noopener">' + out + '</a>';
  return out;
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function postProcessTags(html) {
  // Unwrap block-level tags from their <p> wrapper
  html = html.replace(
    /<p>\s*(\[(?:callout|macro|subheading|inset)[^\]]*\][\s\S]*?\[\/(?:callout|macro|subheading|inset)\])\s*<\/p>/g,
    '$1'
  );
  html = html.replace(/<p>\s*\[hr\]\s*<\/p>/g, '[hr]');

  html = html.replace(/\[callout\s+(\w+)\]([\s\S]*?)\[\/callout\]/g, function(_, color, inner) {
    color = color.toLowerCase();
    if (VALID_COLORS.indexOf(color) === -1) color = 'shire';
    return '<div class="callout callout-' + color + '">' + inner.trim() + '</div>';
  });

  html = html.replace(/\[macro(?:\s+(\w+))?\]([\s\S]*?)\[\/macro\]/g, function(_, color, inner) {
    var plain = inner.replace(/<[^>]+>/g, '').trim();
    if (color && VALID_COLORS.indexOf(color.toLowerCase()) !== -1) {
      return '<div class="macro-chip macro-' + color.toLowerCase() + '">' + escapeHtml(plain) + '</div>';
    }
    return '<div class="macro-chip">' + escapeHtml(plain) + '</div>';
  });

  html = html.replace(/\[label\s+(\w+)\]([\s\S]*?)\[\/label\]/g, function(_, color, inner) {
    color = color.toLowerCase();
    if (VALID_COLORS.indexOf(color) === -1) color = 'shire';
    var plain = inner.replace(/<[^>]+>/g, '').trim();
    return '<span class="label label-' + color + '">' + escapeHtml(plain) + '</span>';
  });

  html = html.replace(/\[subheading\]([\s\S]*?)\[\/subheading\]/g, function(_, inner) {
    return '<p class="subheading">' + inner.trim() + '</p>';
  });

  html = html.replace(/\[inset\]([\s\S]*?)\[\/inset\]/g, function(_, inner) {
    var idx = inner.indexOf('|');
    if (idx > -1) {
      return '<div class="inset-box"><p class="bold">' + inner.substring(0, idx).trim()
           + '</p><p>' + inner.substring(idx + 1).trim() + '</p></div>';
    }
    return '<div class="inset-box"><p>' + inner.trim() + '</p></div>';
  });

  html = html.replace(/\[hr\]/g, '<hr class="divider">');

  return html;
}
