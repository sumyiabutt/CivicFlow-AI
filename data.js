/* CivicFlow AI — demo dataset.
   Every clause below is SAMPLE text written for this prototype.
   It is not the text of any real by-law and must be replaced by a verified
   corpus before the product is used for real applications.
   The `ur` fields are demo Urdu glosses of the same sample text. */
window.CF_DATA = {
  contact: {
    team: "Team Naqsha",
    members: "Team Naqsha · BS Computer Science",
    school: "",
    demo: "https://civicflow-ai-i4vnn3ckt63.qoder.website/",
    email: "civicflow.naqsha.pk@gmail.com",
    phone: ""
  },

  authority: {
    code: "LDA",
    name: "Lahore Development Authority",
    scheme: "Notified LDA schemes, Lahore",
    corpusVersion: "sample-2026.02",
    verified: "Sample corpus"
  },

  clauses: [
    {
      ref: "By-law 3.1",
      title: "Jurisdiction",
      requirement: "LDA-notified schemes",
      summary: "Which authority processes a building plan in a notified Lahore scheme.",
      body: "\u201cAn application for construction within a notified scheme shall be submitted to the Authority having jurisdiction over that scheme.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["jurisdiction", "authority", "lda", "scheme", "approve", "permission"],
      ur: {
        title: "دائرہ اختیار",
        summary: "نوٹیفائیڈ لاہور سکیم میں بلڈنگ پلان کون سی اتھارٹی پروسیس کرتی ہے۔",
        requirement: "LDA نوٹیفائیڈ سکیمز",
        keywords: ["دائرہ", "اختیار", "اتھارٹی", "سکیم", "اجازت", "پرمیشن"]
      }
    },
    {
      ref: "By-law 4.3",
      title: "Front setback",
      requirement: "15 ft minimum",
      summary: "Open space between the building and the road-side plot boundary.",
      body: "\u201cEvery building shall leave an open front court of not less than fifteen feet measured from the road-side boundary of the plot.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["front", "setback", "road", "boundary", "open", "space", "court"],
      ur: {
        title: "سامنے کا سیٹ بیک",
        summary: "سڑک کی طرف پلاٹ کی حد اور عمارت کے درمیان کھلی جگہ۔",
        requirement: "کم از کم 15 فٹ",
        keywords: ["سامنے", "فرنٹ", "سیٹ", "بیک", "سڑک", "حد", "کھلی"]
      }
    },
    {
      ref: "By-law 4.4",
      title: "Side setbacks",
      requirement: "4 ft each side minimum",
      summary: "Minimum open space along both side boundaries of the plot.",
      body: "\u201cA side open space of not less than four feet shall be maintained along each side boundary, except where the plot abuts another plot under the same ownership.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["side", "setback", "boundary", "neighbour", "neighbor"],
      ur: {
        title: "اطراف کے سیٹ بیک",
        summary: "پلاٹ کی دونوں سائیڈ حدود پر کم از کم کھلی جگہ۔",
        requirement: "ہر طرف کم از کم 4 فٹ",
        keywords: ["اطراف", "سائیڈ", "سیٹ", "بیک", "بارڈر", "حد"]
      }
    },
    {
      ref: "By-law 4.6",
      title: "Rear setback",
      requirement: "5 ft minimum",
      summary: "Open space at the rear boundary, used for light and ventilation.",
      body: "\u201cA rear open space of not less than five feet shall be maintained along the rear boundary of the plot and shall not be covered by any permanent structure.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["rear", "back", "setback", "boundary", "open", "space", "ventilation"],
      ur: {
        title: "پچھلا سیٹ بیک",
        summary: "پچھلی حد پر روشنی اور ہوا کے لیے کھلی جگہ۔",
        requirement: "کم از کم 5 فٹ",
        keywords: ["پچھلا", "پچھلی", "پیچھے", "ریئر", "سیٹ", "بیک"]
      }
    },
    {
      ref: "By-law 5.1",
      title: "Ground coverage",
      requirement: "65% of plot area",
      summary: "Share of the plot that may be covered by a building footprint.",
      body: "\u201cThe area covered at ground level by a building shall not exceed sixty-five percent of the total plot area.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["coverage", "footprint", "covered", "plot", "area", "ground"],
      ur: {
        title: "گراؤنڈ کوریج",
        summary: "پلاٹ کا وہ حصہ جس پر عمارت کی بنیاد بن سکتی ہے۔",
        requirement: "پلاٹ کا 65 فیصد",
        keywords: ["کوریج", "کور", "گراؤنڈ", "پلاٹ", "رقبہ", "فیصد"]
      }
    },
    {
      ref: "By-law 6.2",
      title: "Floor area ratio",
      requirement: "1.0 for plots up to 10 marla",
      summary: "Total covered floor area allowed relative to the plot area.",
      body: "\u201cThe covered area of a residential building shall not exceed one times the plot area for plots of ten marla or less, and one and a quarter times for larger plots.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["floor", "area", "ratio", "far", "covered", "marla", "kanal"],
      ur: {
        title: "فلور ایریا ریشو",
        summary: "پلاٹ کے رقبے کے مقابلے میں کل بنی ہوئی منزل کا رقبہ۔",
        requirement: "10 مارلہ تک 1.0",
        keywords: ["فلور", "ایریا", "ریشو", "مارلہ", "رقبہ", "منزل"]
      }
    },
    {
      ref: "By-law 7.1",
      title: "Building height",
      requirement: "38 ft for ground plus one",
      summary: "Maximum permitted height by number of storeys.",
      body: "\u201cThe height of a building shall not exceed twenty-two feet for a ground storey structure, thirty-eight feet for ground plus one storey, and fifty feet for ground plus two storeys.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["height", "tall", "storey", "story", "floors", "feet", "limit"],
      ur: {
        title: "عمارت کی اونچائی",
        summary: "منزلوں کی تعداد کے حساب سے زیادہ سے زیادہ اونچائی۔",
        requirement: "گراؤنڈ پلس ایک کے لیے 38 فٹ",
        keywords: ["اونچائی", "اونچا", "منزل", "منزلیں", "اسٹوری", "فٹ", "پلس"]
      }
    },
    {
      ref: "By-law 7.4",
      title: "Basement",
      requirement: "1 level, 50% of plot area",
      summary: "Basement depth, coverage and ventilation conditions.",
      body: "\u201cNot more than one basement shall be permitted, and its covered area shall not exceed half of the plot area. The basement shall be ventilated and shall not extend beyond the building line.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["basement", "cellar", "underground", "level"],
      ur: {
        title: "بیسمنٹ",
        summary: "بیسمنٹ کی گہرائی، کوریج اور ہوا کی شرائط۔",
        requirement: "ایک سطح، پلاٹ کا 50 فیصد",
        keywords: ["بیسمنٹ", "تہہ", "خانہ", "زیر", "زمین"]
      }
    },
    {
      ref: "By-law 8.2",
      title: "Parking",
      requirement: "1 space per residential unit",
      summary: "Off-street parking space requirement inside the plot.",
      body: "\u201cAt least one off-street car parking space shall be provided within the plot for each residential unit. Plots of one kanal or larger shall provide two spaces.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["parking", "car", "garage", "vehicle", "kanal"],
      ur: {
        title: "پارکنگ",
        summary: "پلاٹ کے اندر گاڑی کھڑی کرنے کی جگہ۔",
        requirement: "فی رہائشی یونٹ ایک جگہ",
        keywords: ["پارکنگ", "گاڑی", "کار", "گیراج", "اسپیس", "کنال", "جگہ"]
      }
    },
    {
      ref: "By-law 9.3",
      title: "Staircase",
      requirement: "3 ft clear width",
      summary: "Minimum staircase width and enclosure for residential buildings.",
      body: "\u201cEvery building above one storey shall have an enclosed staircase with a clear width of not less than three feet.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["staircase", "stairs", "width", "enclosed", "escape"],
      ur: {
        title: "سیڑھیاں",
        summary: "رہائشی عمارت میں سیڑھی کی کم از کم چوڑائی۔",
        requirement: "3 فٹ چوڑی، بند سیڑھی",
        keywords: ["سیڑھی", "سیڑھیاں", "زینہ", "اسٹیئر", "چوڑائی"]
      }
    },
    {
      ref: "By-law 10.1",
      title: "Submission set",
      requirement: "3 documents",
      summary: "Documents that must accompany a building-plan application.",
      body: "\u201cAn application shall be accompanied by the site plan, proof of ownership, and architectural drawings signed by a registered architect.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["document", "documents", "submit", "submission", "drawing", "drawings", "ownership", "plan", "attach"],
      ur: {
        title: "جمع کرانے والی دستاویزات",
        summary: "بلڈنگ پلان درخواست کے ساتھ لازمی کاغذات۔",
        requirement: "3 دستاویزات",
        keywords: ["دستاویز", "دستاویزات", "کاغذ", "کاغذات", "نقشہ", "نقشے", "جمع"]
      }
    },
    {
      ref: "By-law 10.4",
      title: "Approval validity",
      requirement: "2 years",
      summary: "How long an approved building plan stays valid.",
      body: "\u201cA sanctioned plan shall remain valid for a period of two years from the date of sanction, after which it shall require renewal.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["validity", "valid", "expire", "renewal", "how", "long", "approval", "sanction"],
      ur: {
        title: "منظوری کی مدت",
        summary: "منظور شدہ نقشہ کتنی مدت تک کارآمد رہتا ہے۔",
        requirement: "2 سال",
        keywords: ["مدت", "کارآمد", "منظوری", "تجدید", "سال", "کب"]
      }
    },
    {
      ref: "Schedule B",
      title: "Document checklist",
      requirement: "Site plan, ownership, drawings",
      summary: "The three-item document set used by the checker.",
      body: "\u201cSchedule B lists the site plan, proof of ownership, and architect-signed drawings as the minimum documents for a building-plan application.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["schedule", "checklist", "document", "documents", "site", "ownership", "drawings"],
      ur: {
        title: "دستاویز چیک لسٹ",
        summary: "چیکر میں استعمال ہونے والے تین لازمی کاغذات۔",
        requirement: "سائٹ پلان، ملکیت، نقشے",
        keywords: ["لسٹ", "چیک", "فہرست", "دستاویزات", "سائٹ", "ملکیت"]
      }
    },
    {
      ref: "Schedule C",
      title: "Fee schedule",
      requirement: "Per marla, by use",
      summary: "Where the fee table for each plot size and use is published.",
      body: "\u201cScrutiny and sanction fees shall be charged at the rates given in Schedule C for the relevant plot size and building use.\u201d",
      version: "sample-2026.02",
      verified: "Sample clause",
      keywords: ["fee", "fees", "cost", "charge", "price", "schedule", "scrutiny"],
      ur: {
        title: "فیس شیڈول",
        summary: "ہر پلاٹ سائز اور استعمال کے مطابق فیس کہاں درج ہے۔",
        requirement: "فی مارلہ، استعمال کے حساب سے",
        keywords: ["فیس", "فیسوں", "قیمت", "چارج", "شیڈول", "خرچ"]
      }
    }
  ],

  suggestions: [
    "What is the rear setback for a 5 marla house?",
    "Do I need two parking spaces for a 1 kanal plot?",
    "Which documents must I submit with a building plan?",
    "How long is an approved plan valid?",
    "What is the maximum height for ground plus one?"
  ],

  suggestionsUr: [
    "5 مارلہ گھر کا پچھلا سیٹ بیک کتنا ہے؟",
    "کیا 1 کنال پلاٹ کے لیے دو پارکنگ جگہیں چاہیے؟",
    "بلڈنگ پلان کے ساتھ کون سی دستاویزات جمع کرنی ہیں؟",
    "منظور شدہ نقشہ کب تک کارآمد رہتا ہے؟",
    "گراؤنڈ پلس ایک کی زیادہ سے زیادہ اونچائی کتنی ہے؟"
  ],

  docTypes: [
    { key: "plans", name: "Architectural drawings", note: "Plan set signed by a registered architect", fields: 18 },
    { key: "ownership", name: "Ownership documents", note: "Allotment letter or transfer record", fields: 9 },
    { key: "site", name: "Site plan", note: "Plot dimensions, setbacks and access", fields: 12 }
  ],

  /* Sample fee and timeline table for the estimator.
     Rounded sample values — not an official fee notification. */
  feeSchedule: {
    ref: "Schedule C",
    note: "Sample rates for this prototype — not an official fee notification.",
    base: { "5 marla": 18500, "10 marla": 31000, "1 kanal": 55000, "2 kanal": 92000 },
    use: { "Residential house": 1, "Commercial building": 2.4, "Warehouse / industrial": 1.6 },
    floors: { "Ground only": 0, "Ground + 1": 0.18, "Ground + 2": 0.35 },
    days: { "5 marla": 21, "10 marla": 28, "1 kanal": 35, "2 kanal": 45 },
    commercialExtraDays: 7
  },

  /* Fields as read from the three sample documents.
     Fixed sample values — the prototype does not run OCR or real extraction. */
  docSample: {
    plans: { owner: "Ahmed Raza", plotNo: "142-A", plot: "5 marla", floors: "Ground + 1", dimensions: "25 ft × 50 ft" },
    ownership: { owner: "Ahmed Raza", plotNo: "142-A", plot: "5 marla", floors: "—", dimensions: "—" },
    site: { owner: "Ahmed Raza", plotNo: "142-B", plot: "5 marla", floors: "—", dimensions: "25 ft × 50 ft" }
  },

  seedApps: [
    {
      id: "CV-1042",
      project: { type: "Residential house", plot: "5 marla", floors: "Ground + 1", society: "Model Town" },
      updated: "2 hours ago",
      created: "18 Nov 2026", docsDate: "18 Nov 2026", checkedDate: "19 Nov 2026"
    },
    {
      id: "CV-1039",
      project: { type: "Commercial building", plot: "10 marla", floors: "Ground + 2", society: "DHA Phase 5" },
      updated: "Yesterday",
      created: "17 Nov 2026", docsDate: "17 Nov 2026", checkedDate: "18 Nov 2026"
    },
    {
      id: "CV-1031",
      project: { type: "Residential house", plot: "10 marla", floors: "Ground + 1", society: "Johar Town" },
      updated: "3 days ago",
      created: "15 Nov 2026", docsDate: "15 Nov 2026", checkedDate: "16 Nov 2026"
    },
    {
      id: "CV-1027",
      project: { type: "Warehouse / industrial", plot: "1 kanal", floors: "Ground only", society: "Badami Bagh" },
      updated: "Last week",
      submitted: true,
      created: "11 Nov 2026", docsDate: "11 Nov 2026", checkedDate: "12 Nov 2026",
      submittedAt: "12 Nov 2026"
    }
  ]
};
