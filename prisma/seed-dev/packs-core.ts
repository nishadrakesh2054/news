import {
  ArticleStatus,
  ArticleType,
  AuRegion,
  LanguageEdition,
} from "@prisma/client";
import { buildBodies } from "./content";
import { SEED_SLUG_PREFIX, type ArticleBlueprint } from "./types";
import type { TopicPack } from "./content";

const PLACE_NP = ["काठमाडौँ", "पोखरा", "विराटनगर", "भैरहवा", "नेपालगञ्ज"] as const;
const PLACE_EN = ["Kathmandu", "Pokhara", "Biratnagar", "Bhairahawa", "Nepalgunj"] as const;

function pad(n: number) {
  return String(n).padStart(3, "0");
}

function hoursFor(index: number, total: number): number {
  // Spread across ~90 days
  const span = 24 * 90;
  return Math.floor((index / Math.max(total, 1)) * span) + (index % 17) * 3;
}

const PACKS: TopicPack[] = [
  {
    categorySlug: "politics",
    imageQuery: "politics parliament government",
    tagSlugs: ["nepal-politics", "government", "parliament", "explainer"],
    topics: [
      {
        title: "How parliamentary committees shape everyday policy follow-up",
        titleNp: "संसदीय समितिले दैनिक नीति फलोअप कसरी आकार दिन्छन्",
        focusEn: [
          "A feature-style explainer looks at how committee calendars, briefings and public submissions influence later debate.",
          "Civic educators say clearer committee summaries help citizens track bills without relying on rumour.",
          "Demo notes highlight transparency tools newsrooms can surface beside politics coverage.",
          "Regional desks can localise the same structure for province assemblies.",
          "Readers are pointed to official gazettes for any operational change.",
          "The piece closes with a checklist for verifying political claims online.",
        ],
        focusNp: [
          "समिति तालिका, ब्रिफिङ र सार्वजनिक सुझावले पछिल्लो बहसलाई कसरी प्रभाव पार्छ भन्ने फिचर शैलीको व्याख्या छ।",
          "नागरिक शिक्षाले स्पष्ट समिति सारांशले अफवाहबिना विधेयक ट्र्याक गर्न सहयोग गर्ने बताउँछ।",
          "डेमो नोटले राजनीति कभरेजसँग पारदर्शिता उपकरण जोड्ने तरिका देखाउँछ।",
          "प्रदेश सभाका लागि पनि उही संरचना स्थानीयकरण गर्न सकिन्छ।",
          "कुनै सञ्चालन परिवर्तनका लागि आधिकारिक राजपत्र हेर्न सुझाव दिइएको छ।",
          "अनलाइन राजनीतिक दाबी जाँच्ने चेकलिस्टसहित लेख टुंगिएको छ।",
        ],
      },
      {
        title: "Youth voter outreach programmes expand civic workshops",
        titleNp: "युवा मतदाता पहुँच कार्यक्रममा नागरिक कार्यशाला विस्तार",
        focusEn: [
          "Campus and community workshops are framed as civic education rather than campaign messaging.",
          "Organisers emphasise registration deadlines, ballot secrecy and media literacy.",
          "Development copy avoids inventing election results or candidate quotes.",
          "Volunteers practise Q&A formats useful for explainers.",
          "Municipal examples show how logistics differ between urban and rural wards.",
          "Editors can reuse the outline for future election-year education packages.",
        ],
        focusNp: [
          "क्याम्पस र समुदाय कार्यशालालाई अभियान होइन नागरिक शिक्षाका रूपमा प्रस्तुत गरिएको छ।",
          "आयोजकहरूले दर्ता म्याद, मतदान गोपनीयता र मिडिया साक्षरतामा जोड दिएका छन्।",
          "डेमो सामग्रीले निर्वाचन परिणाम वा उम्मेदवार उद्धरण बनाउँदैन।",
          "स्वयंसेवकहरूले व्याख्यात्मक प्रश्नोत्तर अभ्यास गर्छन्।",
          "सहरी र ग्रामीण वडामा फरक हुने व्यवस्थापकीय पाटो उदाहरण दिइएको छ।",
          "सम्पादकहरूले भविष्यको निर्वाचन शिक्षा प्याकेजमा यो रूपरेखा पुनः प्रयोग गर्न सक्छन्।",
        ],
      },
      {
        title: "Local government service desks trial digital queue tickets",
        titleNp: "स्थानीय सेवा डेस्कमा डिजिटल क्यू टिकट परीक्षण",
        focusEn: [
          "A process story examines appointment tokens, waiting times and accessibility for elderly residents.",
          "IT officers discuss offline fallbacks when connectivity drops.",
          "No vendor contracts or budget figures are presented as confirmed awards.",
          "Photograph prompts focus on public counters rather than individuals.",
          "Province-level comparisons remain illustrative for UX testing.",
          "Feedback forms are suggested as a recurring reporting angle.",
        ],
        focusNp: [
          "अपोइन्टमेन्ट टोकन, प्रतीक्षा समय र ज्येष्ठ नागरिक पहुँचबारे प्रक्रिया कथा छ।",
          "आईटी अधिकारीले कनेक्टिभिटी जाँदा अफलाइन विकल्प छलफल गर्छन्।",
          "कुनै विक्रेता सम्झौता वा बजेट अंकलाई पुष्टि पुरस्कार भनिएको छैन।",
          "तस्बिर सुझाव व्यक्तिभन्दा सार्वजनिक काउन्टरमा केन्द्रित छ।",
          "प्रदेश तुलना यूएक्स परीक्षणका लागि उदाहरण मात्र हुन्।",
          "प्रतिक्रिया फारमलाई नियमित रिपोर्टिङ कोण बनाउन सकिन्छ।",
        ],
      },
      {
        title: "Political literacy series: reading a bill summary without jargon",
        titleNp: "राजनीतिक साक्षरता: जटिल भाषाबिना विधेयक सारांश बुझ्ने तरिका",
        focusEn: [
          "This explainer teaches readers to scan purpose clauses, definitions and commencement notes.",
          "Sideboxes list common mistranslations between English and Nepali legal phrasing.",
          "Classroom packs can adapt the same structure for civic clubs.",
          "Fact boxes stress that demo bills are fictional templates.",
          "Journalists are reminded to link primary documents whenever available.",
          "The series will continue with budget-reading and petition-tracking guides.",
        ],
        focusNp: [
          "उद्देश्य दफा, परिभाषा र प्रारम्भ नोट कसरी स्क्यान गर्ने भन्ने व्याख्या छ।",
          "अङ्ग्रेजी–नेपाली कानुनी शब्दावलीका सामान्य भ्रम साइडबक्समा छन्।",
          "नागरिक क्लबका लागि कक्षा सामग्री बनाउन सकिन्छ।",
          "डेमो विधेयक काल्पनिक टेम्प्लेट हुन् भनी स्पष्ट पारिएको छ।",
          "पत्रकारलाई प्राथमिक दस्तावेज लिंक गर्न स्मरण गराइएको छ।",
          "श्रृंखलाले बजेट पढाइ र निवेदन ट्र्याकिङ गाइड जारी राख्नेछ।",
        ],
      },
      {
        title: "Coalition communication playbooks: what newsrooms watch for",
        titleNp: "गठबन्धन सञ्चार प्लेबुक: समाचार कक्षले के हेर्छन्",
        focusEn: [
          "A backgrounder maps typical press-note patterns without naming invented ministers.",
          "Reporters look for consistency across spokespeople and published agendas.",
          "Demo scenarios practise correction workflows when statements change.",
          "Social media amplification risks are outlined for editors.",
          "Readers get tips to distinguish analysis from advocacy.",
          "Archive tags help compare similar briefings over months.",
        ],
        focusNp: [
          "बनावटी मन्त्री नखुलाई सामान्य प्रेस नोट ढाँचाको पृष्ठभूमि दिइएको छ।",
          "प्रवक्ता र प्रकाशित एजेन्डाबीच एकरूपता खोजिन्छ।",
          "बयान परिवर्तन हुँदा सच्याउने कार्यप्रवाह अभ्यास गरिएको छ।",
          "सम्पादकका लागि सामाजिक सञ्जाल विस्तारका जोखिम उल्लेख छन्।",
          "विश्लेषण र वकालत छुट्याउने सुझाव पाठकलाई दिइएको छ।",
          "अभिलेख ट्यागले महिनौंको ब्रिफिङ तुलना गर्न सहज बनाउँछ।",
        ],
      },
      {
        title: "Ward-level transparency boards and public notice literacy",
        titleNp: "वडा स्तरीय पारदर्शिता बोर्ड र सार्वजनिक सूचना साक्षरता",
        focusEn: [
          "Community reporters document how notice boards, SMS alerts and radio spots complement each other.",
          "Accessibility includes large-print and audio options in the demo checklist.",
          "No municipality is accused of wrongdoing; the tone stays instructional.",
          "Photo guidance prefers empty notice boards and generic street scenes.",
          "NGOs can reuse the literacy tips in training decks.",
          "Follow-up ideas include budget posters and project milestone cards.",
        ],
        focusNp: [
          "सूचना बोर्ड, एसएमएस र रेडियो कसरी पूरक बन्छन् भन्ने दस्तावेजीकरण छ।",
          "डेमो चेकलिस्टमा ठूलो अक्षर र अडियो विकल्प समावेश छन्।",
          "कुनै नगरपालिकालाई दोष लगाइएको छैन; स्वर शिक्षामूलक छ।",
          "तस्बिरका लागि खाली सूचना बोर्ड र सामान्य सडक दृश्य सुझाइएको छ।",
          "एनजीओले तालिम सामग्रीमा साक्षरता सुझाव प्रयोग गर्न सक्छन्।",
          "बजेट पोस्टर र आयोजना माइलस्टोन कार्ड फलोअप विचार हुन्।",
        ],
      },
    ],
  },
  {
    categorySlug: "economy-business",
    imageQuery: "economy finance banking markets",
    tagSlugs: ["markets", "banking", "explainer"],
    topics: [
      {
        title: "Understanding remittance dashboards without overclaiming trends",
        titleNp: "रेमिट्यान्स ड्यासबोर्ड कसरी पढ्ने: अति दाबी नगरी",
        focusEn: [
          "An explainer walks through inflows, fees and seasonal patterns using illustrative ranges only.",
          "Household budgeting tips stay general and non-advisory.",
          "Banks and money-transfer firms are discussed as categories, not named deals.",
          "Charts in production can swap demo numbers for live feeds later.",
          "Risk notes discourage sharing unverified rate rumours.",
          "Editors may pair this with diaspora community features.",
        ],
        focusNp: [
          "प्रवाह, शुल्क र मौसमी ढाँचा उदाहरण अंकसहित व्याख्या गरिएको छ।",
          "घरायसी बजेट सुझाव सामान्य र गैर-सल्लाहकारी छन्।",
          "बैंक र मनी ट्रान्सफरलाई वर्गका रूपमा मात्र छलफल गरिएको छ।",
          "प्रोडक्शन चार्टमा पछि लाइभ डेटा राख्न सकिन्छ।",
          "अपुष्टि दर अफवाह नफैलाउन चेतावनी छ।",
          "डायस्पोरा फिचरसँग जोड्न सकिन्छ।",
        ],
      },
      {
        title: "SME cash-flow primers for festival trading weeks",
        titleNp: "चाडबाड व्यापार हप्ताका लागि साना व्यवसाय नगद प्रवाह आधार",
        focusEn: [
          "Retailers review inventory pacing, supplier terms and digital payment readiness.",
          "Accountants stress separating personal and business wallets in training notes.",
          "No loan product is endorsed.",
          "Case sketches are composite, not identifiable shops.",
          "Municipal market committees appear as process actors only.",
          "A closing box lists documents useful for later verification stories.",
        ],
        focusNp: [
          "खुद्रा व्यवसायीले मौज्दात, आपूर्तिकर्ता सर्त र डिजिटल भुक्तानी तयारी समीक्षा गर्छन्।",
          "लेखापालले व्यक्तिगत र व्यवसाय खाता छुट्याउन जोड दिन्छन्।",
          "कुनै ऋण उत्पादन सिफारिस गरिएको छैन।",
          "केस स्केच मिश्रित उदाहरण हुन्, पहिचानयोग्य पसल होइनन्।",
          "नगर बजार समिति प्रक्रियाका अभिनेता मात्र हुन्।",
          "पछिल्लो अनुसन्धान कथाका लागि उपयोगी कागजात सूची छ।",
        ],
      },
      {
        title: "Hydropower calendar literacy for energy beat reporters",
        titleNp: "ऊर्जा रिपोर्टरका लागि जलविद्युत् पात्रो साक्षरता",
        focusEn: [
          "Seasonal generation, maintenance windows and transmission bottlenecks are explained at a high level.",
          "Demo copy avoids claiming specific project delays or tariffs.",
          "Safety messaging around sites remains generic.",
          "Province tags help filter national energy explainers.",
          "Photograph motifs include turbines and grid landscapes from stock libraries.",
          "Further reading points to regulator glossaries.",
        ],
        focusNp: [
          "मौसमी उत्पादन, मर्मत अवधि र प्रसारण अवरोध उच्च स्तरमा व्याख्या छ।",
          "विशिष्ट आयोजना ढिलाइ वा महसुल दाबी गरिएको छैन।",
          "साइट सुरक्षा सन्देश सामान्य छ।",
          "प्रदेश ट्यागले ऊर्जा व्याख्या फिल्टर गर्न सहयोग गर्छ।",
          "स्टक लाइब्रेरीका टर्बाइन र ग्रिड दृश्य प्रयोग हुन्छन्।",
          "नियामक शब्दकोश थप पढाइका लागि सुझाइएको छ।",
        ],
      },
      {
        title: "Inflation explainers: baskets, base years and media caveats",
        titleNp: "मुद्रास्फीति व्याख्या: बास्केट, आधार वर्ष र मिडिया सावधानी",
        focusEn: [
          "Reporters practise describing CPI components without alarming language.",
          "Side notes clarify why month-to-month swings need context.",
          "No forecast is presented as official guidance.",
          "Household examples use rounded illustrative prices.",
          "Graphics teams can test sparkline components with this copy.",
          "Corrections policy reminders close the piece.",
        ],
        focusNp: [
          "सीपीआई घटकलाई भयभीत भाषाबिना वर्णन गर्ने अभ्यास छ।",
          "मासिक उतारचढावलाई सन्दर्भ चाहिने कुरा स्पष्ट पारिएको छ।",
          "कुनै पूर्वानुमान आधिकारिक मार्गदर्शन होइन।",
          "घरपरिवार उदाहरण गोलमटोल उदाहरण मूल्यमा आधारित छन्।",
          "ग्राफिक्स टोलीले स्पार्कलाइन परीक्षण गर्न सक्छ।",
          "सच्याउने नीति स्मरणसहित लेख सकिएको छ।",
        ],
      },
      {
        title: "Cooperative reporting standards for sensitive finance stories",
        titleNp: "संवेदनशील वित्तीय कथाका लागि सहकारी रिपोर्टिङ मापदण्ड",
        focusEn: [
          "Guidelines discourage naming alleged victims without verification pathways.",
          "Document checklists include registration extracts and audit summaries when publicly available.",
          "Tone stays educational for newsroom onboarding.",
          "Legal review triggers are listed without dramatisation.",
          "Community radio adaptations are suggested.",
          "Editors should keep demo cases clearly labelled in CMS.",
        ],
        focusNp: [
          "पुष्टि मार्गबिना आरोपित पीडितको नाम नप्रकाशन गर्न दिशानिर्देश छ।",
          "सार्वजनिक रूपमा उपलब्ध दर्ता र लेखा परीक्षण सारांश चेकलिस्टमा छन्।",
          "स्वर समाचार कक्ष अभिमुखीकरणका लागि शैक्षिक छ।",
          "कानुनी समीक्षा ट्रिगर नाटकीकरणबिना सूचीकृत छन्।",
          "सामुदायिक रेडियो अनुकूलन सुझाइएको छ।",
          "सीएमएसमा डेमो केस स्पष्ट लेबल राख्न भनिएको छ।",
        ],
      },
      {
        title: "Tourism revenue narratives and off-season planning notes",
        titleNp: "पर्यटन आम्दानी कथा र अफ-सिजन योजना नोट",
        focusEn: [
          "Hospitality associations discuss staffing, training and digital bookings in general terms.",
          "Trek safety reminders stay evergreen.",
          "No hotel occupancy percentages are invented as official stats.",
          "Photo sets favour landscapes suitable for 16:9 cards.",
          "Cross-links to tourism category articles improve related modules.",
          "Closing lines invite reader tips for service journalism.",
        ],
        focusNp: [
          "आतिथ्य संघले जनशक्ति, तालिम र डिजिटल बुकिङ सामान्य भाषामा छलफल गर्छन्।",
          "ट्रेक सुरक्षा स्मरण सधैं उपयोगी रहन्छ।",
          "आधिकारिक तथ्यांकका रूपमा होटल अधिभोग प्रतिशत बनाइएको छैन।",
          "१६:९ कार्डका लागि ल्यान्डस्केप तस्बिर रोजिएको छ।",
          "पर्यटन श्रेणीसँग क्रस-लिंकले सम्बन्धित मोड्युल सुधार्छ।",
          "सेवा पत्रकारिताका लागि पाठक सुझाव मागिएको छ।",
        ],
      },
    ],
  },
];

// Additional packs will be imported from packs-extra to keep file size manageable
export { PLACE_EN, PLACE_NP, pad, hoursFor, PACKS };
