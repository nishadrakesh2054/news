export type RashifalPeriodKey = "today" | "weekly" | "monthly" | "yearly";

export type PeriodForecast = {
  overview: string;
  health: string;
  business: string;
  love: string;
  remedy: string;
};

export type DetailedRashi = {
  name: string;
  enName: string;
  slug: string;
  symbol: string;
  element: string;
  rashiSwami: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  luckyPercent: number;
  /** @deprecated flat fields — prefer periods.today */
  overview?: string;
  health?: string;
  business?: string;
  love?: string;
  remedy?: string;
  periods: Record<RashifalPeriodKey, PeriodForecast>;
};

export const RASHIFAL_PERIODS: { key: RashifalPeriodKey; labelNp: string; labelEn: string }[] = [
  { key: "today", labelNp: "आजको", labelEn: "Today" },
  { key: "weekly", labelNp: "साप्ताहिक", labelEn: "Weekly" },
  { key: "monthly", labelNp: "मासिक", labelEn: "Monthly" },
  { key: "yearly", labelNp: "वार्षिक", labelEn: "Yearly" },
];

/** Traditional starting letters for each rashi (homepage grid). */
export const RASHI_LETTERS: Record<string, string> = {
  मेष: "चु, चे, चो, ला, लि, लु, ले, लो, अ",
  वृष: "इ, उ, ए, ओ, वा, वि, वु, वे, वो",
  मिथुन: "का, कि, कु, घ, ङ, छ, के, को, हा",
  कर्कट: "हि, हु, हे, हो, डा, डि, डु, डे, डो",
  सिंह: "मा, मि, मु, मे, मो, टा, टि, टु, टे",
  कन्या: "टो, पा, पि, पु, ष, ण, ठ, पे, पो",
  तुला: "रा, रि, रु, रे, रो, ता, ति, तु, ते",
  वृश्चिक: "तो, ना, नि, नु, ने, नो, या, यि, यु",
  धनु: "ये, यो, भा, भि, भु, धा, फा, ढा, भे",
  मकर: "भो, जा, जि, जु, जे, जो, ख, खि, खु, खे, खो, गा, गि",
  कुम्भ: "गु, गे, गो, सा, सि, सु, से, सो, दा",
  मीन: "दि, दु, थ, झ, ञ, दे, दो, चा, चि",
};

const EMPTY_PERIOD: PeriodForecast = {
  overview: "",
  health: "",
  business: "",
  love: "",
  remedy: "",
};

function periodFrom(
  overview: string,
  health: string,
  business: string,
  love: string,
  remedy: string
): PeriodForecast {
  return { overview, health, business, love, remedy };
}

function buildPeriods(
  today: PeriodForecast,
  weekly: PeriodForecast,
  monthly: PeriodForecast,
  yearly: PeriodForecast
): Record<RashifalPeriodKey, PeriodForecast> {
  return { today, weekly, monthly, yearly };
}

type LegacySeed = {
  name: string;
  enName: string;
  slug: string;
  symbol: string;
  element: string;
  rashiSwami: string;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  luckyPercent: number;
  today: PeriodForecast;
  weekly: PeriodForecast;
  monthly: PeriodForecast;
  yearly: PeriodForecast;
};

const SEEDS: LegacySeed[] = [
  {
    name: "मेष",
    enName: "Aries",
    slug: "aries",
    symbol: "♈",
    element: "अग्नि (Fire)",
    rashiSwami: "मङ्गल (Mars)",
    luckyColor: "रातो / सिन्दूरी",
    luckyNumber: "९",
    luckyDirection: "पूर्व (East)",
    luckyPercent: 85,
    today: periodFrom(
      "आजको दिन कार्यक्षेत्रमा नयाँ अवसर प्राप्त हुनेछ। रोकिएका कामहरू सहजै बन्ने योग छ। सामाजिक पदप्रतिष्ठामा वृद्धि हुनेछ।",
      "स्वास्थ्य सामान्यतया उत्तम रहनेछ। नियमित व्यायाम तथा सन्तुलित खानपानमा ध्यान दिनुहोला।",
      "व्यापार व्यवसायमा सोचेभन्दा बढी आर्थिक लाभ हुनेछ। नयाँ सम्झौता र लगानीका लागि शुभ समय छ।",
      "दाम्पत्य जीवनमा सुमधुरता कायम रहनेछ। प्रेमी-प्रेमिकाबीच आत्मीयता र विश्वास बढ्नेछ।",
      "हनुमान चालिसाको पाठ गर्नाले वा सूर्यलाई तामाको पात्रबाट जल चढाउनाले कार्य सिद्धि हुनेछ।"
    ),
    weekly: periodFrom(
      "यस हप्ता नेतृत्व क्षमता देखिनेछ। नयाँ परियोजना सुरु गर्न अनुकूल समय छ।",
      "साप्ताहिक रूपमा ऊर्जा उच्च रहनेछ; अत्यधिक थकानबाट जोगिनुहोला।",
      "व्यापारिक छलफल र साझेदारीका लागि शुभ योग छ।",
      "परिवारसँग समय बिताउँदा मन प्रसन्न रहनेछ।",
      "मङ्गलवार हनुमान मन्दिर दर्शन गर्नुहोला।"
    ),
    monthly: periodFrom(
      "यो महिना करियरमा प्रगति र नयाँ जिम्मेवारी आउन सक्छ।",
      "मासिक स्वास्थ्य सामान्य; निद्रा र खानपान सन्तुलित राख्नुहोला।",
      "लगानी र सम्पत्ति सम्बन्धी निर्णय विचारपूर्वक लिनुहोला।",
      "सम्बन्धमा स्पष्ट संवादले दूरी कम हुनेछ।",
      "रातो वस्तु दान गर्नाले शुभ फल मिल्नेछ।"
    ),
    yearly: periodFrom(
      "वर्षभरि साहस र उद्यमशीलताले नयाँ उचाइ छुन सहयोग गर्नेछ।",
      "वार्षिक स्वास्थ्य राम्रो रहने सम्भावना; नियमित जाँच गराउनुहोला।",
      "व्यापार विस्तार र पदोन्नतिको योग छ।",
      "पारिवारिक सम्बन्धमा स्थायित्व बढ्नेछ।",
      "वर्षको सुरुमा नवग्रह शान्ति पूजा गर्नुहोला।"
    ),
  },
  {
    name: "वृष",
    enName: "Taurus",
    slug: "taurus",
    symbol: "♉",
    element: "पृथ्वी (Earth)",
    rashiSwami: "शुक्र (Venus)",
    luckyColor: "सेतो / हल्का नीलो",
    luckyNumber: "६",
    luckyDirection: "दक्षिण-पूर्व (South-East)",
    luckyPercent: 78,
    today: periodFrom(
      "आज बुद्धिको प्रयोगले कठिन परिस्थिति पनि अनुकूल बन्नेछ। कला र सिर्जनात्मक क्षेत्रमा सफलता मिल्नेछ।",
      "आँखा तथा घाँटी सम्बन्धी सामान्य समस्या हुनसक्छ, विश्राममा ध्यान दिनुहोला।",
      "आर्थिक स्थिति सुदृढ हुनेछ। पुराना भुक्तानी प्राप्त हुने सम्भावना छ।",
      "पारिवारिक सहयोग र माया मिल्नेछ।",
      "लक्ष्मीजीको आराधना गरी सेतो वस्तु दान गर्दा धन लाभ हुनेछ।"
    ),
    weekly: periodFrom(
      "हप्ताभरि स्थिरता र धैर्यले काममा सफलता मिल्नेछ।",
      "साप्ताहिक स्वास्थ्य सामान्य रहनेछ।",
      "बचत र दीर्घकालीन लगानीमा ध्यान दिनुहोला।",
      "प्रियजनसँग सम्बन्ध मधुर रहनेछ।",
      "शुक्रवार सेतो फूल चढाउनुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि घर-जग्गा वा स्थिर सम्पत्ति सम्बन्धी शुभ समाचार आउन सक्छ।",
      "पाचन प्रणालीको ख्याल राख्नुहोला।",
      "व्यापारमा क्रमिक वृद्धि देखिनेछ।",
      "पारिवारिक उत्सवको योग छ।",
      "लक्ष्मी मन्त्र जप गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि आर्थिक सुरक्षा र सामाजिक प्रतिष्ठा बढ्नेछ।",
      "वार्षिक स्वास्थ्य राम्रो; वजन नियन्त्रणमा ध्यान दिनुहोला।",
      "स्थायी आय स्रोत बलियो हुनेछ।",
      "दाम्पत्य जीवनमा सन्तुलन रहनेछ।",
      "वर्षान्तमा लक्ष्मी पूजा विशेष फलदायी हुनेछ।"
    ),
  },
  {
    name: "मिथुन",
    enName: "Gemini",
    slug: "gemini",
    symbol: "♊",
    element: "वायु (Air)",
    rashiSwami: "बुध (Mercury)",
    luckyColor: "हरियो / पहेँलो",
    luckyNumber: "५",
    luckyDirection: "उत्तर (North)",
    luckyPercent: 90,
    today: periodFrom(
      "सञ्चार र बौद्धिक कार्यमा ठूलो सफलता हात लाग्नेछ। इष्टमित्रसँग भेटघाटले मन प्रसन्न रहनेछ।",
      "मानसिक स्फूर्ति र ऊर्जा उच्च रहनेछ।",
      "शेयर तथा नयाँ लगानीका लागि उपयुक्त समय छ।",
      "भावना स्पष्टसँग व्यक्त गर्दा सम्बन्ध गाढा बन्नेछ।",
      "गणेशजीको दर्शन गरी दुबो चढाउनुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि यात्रा, बैठक र सञ्चारमाध्यम सम्बन्धी काम सफल हुनेछ।",
      "मानसिक थकानबाट जोगिन विश्राम लिनुहोला।",
      "नयाँ व्यवसायिक सम्पर्क बढ्नेछ।",
      "मित्रता र प्रेम सम्बन्धमा उत्साह रहनेछ।",
      "बुधवार हरियो वस्तु दान गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि अध्ययन, लेखन र प्रविधि क्षेत्रमा अवसर आउनेछ।",
      "स्नायु प्रणालीको ख्याल राख्नुहोला।",
      "मार्केटिङ र साझेदारी लाभदायी हुनेछ।",
      "संवादले सम्बन्ध सुधार्नेछ।",
      "सरस्वती पूजा गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि ज्ञान, यात्रा र नयाँ सीपले करियर उचाइमा पुर्‍याउनेछ।",
      "वार्षिक स्वास्थ्य राम्रो; योग नियमित गर्नुहोला।",
      "बहुआय स्रोत सम्भव छ।",
      "सामाजिक सम्बन्ध विस्तार हुनेछ।",
      "वर्षको मध्यमा बुध शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "कर्कट",
    enName: "Cancer",
    slug: "cancer",
    symbol: "♋",
    element: "जल (Water)",
    rashiSwami: "चन्द्रमा (Moon)",
    luckyColor: "दूध जस्तो सेतो / चाँदी",
    luckyNumber: "२",
    luckyDirection: "उत्तर-पश्चिम (North-West)",
    luckyPercent: 72,
    today: periodFrom(
      "भावना प्रधान रहनेछ। महत्त्वपूर्ण निर्णयमा हतार नगर्नुहोला। धार्मिक कार्यमा रुचि बढ्नेछ।",
      "पेट तथा पाचनको ख्याल गर्नुहोला।",
      "अनावश्यक खर्च नियन्त्रण गर्नुहोला।",
      "परिवारसँग समय बिताउँदा मन शान्त रहनेछ।",
      "शिवजीलाई जल तथा दूध चढाउनुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि घरपरिवार र भावनात्मक सुरक्षा महत्त्वपूर्ण रहनेछ।",
      "पानी पिउने बानी बढाउनुहोला।",
      "बचत योजना बनाउन अनुकूल छ।",
      "मातृपक्षसँग सम्बन्ध सुमधुर रहनेछ।",
      "सोमवार चन्द्र दर्शन गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि घर-जग्गा वा पारिवारिक सम्पत्तिमा ध्यान जान्छ।",
      "भावनात्मक स्वास्थ्यको ख्याल राख्नुहोला।",
      "आम्दानी स्थिर रहनेछ।",
      "पारिवारिक मेलमिलाप बढ्नेछ।",
      "दुग्ध दान गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि पारिवारिक सुख र मानसिक शान्ति बढ्नेछ।",
      "वार्षिक स्वास्थ्य सामान्य; तनाव व्यवस्थापन गर्नुहोला।",
      "स्थिर आय र बचत बढ्नेछ।",
      "दाम्पत्य सम्बन्ध गहिरो हुनेछ।",
      "वर्षान्तमा चन्द्र पूजा विशेष फलदायी।"
    ),
  },
  {
    name: "सिंह",
    enName: "Leo",
    slug: "leo",
    symbol: "♌",
    element: "अग्नि (Fire)",
    rashiSwami: "सूर्य (Sun)",
    luckyColor: "गुलाबी / सुनौलो",
    luckyNumber: "१",
    luckyDirection: "पूर्व (East)",
    luckyPercent: 92,
    today: periodFrom(
      "नेतृत्व क्षमताको प्रशंसा हुनेछ। उच्च पदस्थसँग सम्बन्ध विस्तार हुनेछ।",
      "शरीरमा ऊर्जा र आत्मविश्वास भरपूर रहनेछ।",
      "नयाँ योजना कार्यान्वयन गर्न अनुकूल छ।",
      "जोडीबीच आत्मीयता बढ्नेछ।",
      "गायत्री मन्त्र जप र सूर्य नमस्कार गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि सार्वजनिक कार्य र नेतृत्वमा सफलता मिल्नेछ।",
      "हृदय स्वास्थ्यको ख्याल राख्नुहोला।",
      "पदोन्नति वा मान-सम्मानको योग छ।",
      "रोमान्टिक क्षणहरू बढ्नेछन्।",
      "आइतबार सूर्यलाई अर्घ्य दिनुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि करियरमा उचाइ र सामाजिक पहिचान बढ्नेछ।",
      "नियमित व्यायामले ऊर्जा कायम राख्नुहोला।",
      "ठूला सम्झौताको सम्भावना छ।",
      "परिवारमा सम्मान बढ्नेछ।",
      "सुनौलो वस्तु दान गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि नेतृत्व, मान र सफलताको वर्ष रहनेछ।",
      "वार्षिक स्वास्थ्य राम्रो; घमण्डबाट जोगिनुहोला।",
      "व्यापार र पद दुवैमा वृद्धि।",
      "प्रेम सम्बन्धमा स्थिरता।",
      "वर्षको सुरुमा सूर्य शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "कन्या",
    enName: "Virgo",
    slug: "virgo",
    symbol: "♍",
    element: "पृथ्वी (Earth)",
    rashiSwami: "बुध (Mercury)",
    luckyColor: "गाढा हरियो",
    luckyNumber: "५",
    luckyDirection: "दक्षिण (South)",
    luckyPercent: 80,
    today: periodFrom(
      "तार्किक क्षमता र कार्यकुशलता बढ्नेछ। अध्ययन र लेखनमा उत्कृष्ट नतिजा मिल्नेछ।",
      "स्वास्थ्य उत्तम; ध्यान र योगले एकाग्रता बढ्नेछ।",
      "नयाँ लगानीको अवसर प्राप्त हुनेछ।",
      "मित्र तथा जीवनसाथीसँग सम्बन्ध प्रगाढ बन्नेछ।",
      "हरियो कपडा वा मुग दान गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि विवरण र योजनामा ध्यान दिँदा सफलता मिल्नेछ।",
      "पाचन स्वास्थ्यको ख्याल राख्नुहोला।",
      "सेवा व्यवसाय लाभदायी हुनेछ।",
      "सहयोगी सम्बन्ध बढ्नेछ।",
      "बुधवार तुलसी पूजा गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि स्वास्थ्य सेवा, विश्लेषण र प्रशासनिक काममा अवसर।",
      "नियमित खानपान अपनाउनुहोला।",
      "साना लगानी सुरक्षित रहनेछ।",
      "विश्वास बढाउने संवाद गर्नुहोला।",
      "सरस्वती मन्त्र जप गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि सीप विकास र करियर सुधारको वर्ष।",
      "वार्षिक स्वास्थ्य राम्रो रहनेछ।",
      "स्थिर प्रगति र बचत बढ्नेछ।",
      "सम्बन्धमा व्यावहारिक समझदारी।",
      "वर्षान्तमा बुध पूजा गर्नुहोला।"
    ),
  },
  {
    name: "तुला",
    enName: "Libra",
    slug: "libra",
    symbol: "♎",
    element: "वायु (Air)",
    rashiSwami: "शुक्र (Venus)",
    luckyColor: "आकाशीय नीलो / सेतो",
    luckyNumber: "७",
    luckyDirection: "पश्चिम (West)",
    luckyPercent: 84,
    today: periodFrom(
      "सौन्दर्य, कला र सामाजिक कार्यमा रुचि बढ्नेछ। न्याय र सन्तुलन कायम रहनेछ।",
      "मानसिक ताजगी महसुस हुनेछ।",
      "साझेदारी व्यापारमा फाइदा मिल्नेछ।",
      "प्रेम सम्बन्धमा मधुरता बढ्नेछ।",
      "देवी दुर्गाको पूजा गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि सामाजिक सम्बन्ध र कलात्मक काम सफल हुनेछ।",
      "सन्तुलित आहार अपनाउनुहोला।",
      "साझेदारी सम्झौता शुभ छ।",
      "जोडीबीच समझदारी बढ्नेछ।",
      "शुक्रवार सेतो फूल चढाउनुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि कानुनी वा मध्यस्थता सम्बन्धी काममा सफलता।",
      "छाला र एलर्जीको ख्याल राख्नुहोला।",
      "व्यापार सन्तुलनमा रहनेछ।",
      "रोमान्स र विवाह योग बलियो।",
      "लक्ष्मी-नारायण पूजा गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि सन्तुलन, सौन्दर्य र साझेदारीको वर्ष।",
      "वार्षिक स्वास्थ्य राम्रो।",
      "साझेदारीबाट दीर्घकालीन लाभ।",
      "दाम्पत्य सुख बढ्नेछ।",
      "वर्षको मध्यमा शुक्र शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "वृश्चिक",
    enName: "Scorpio",
    slug: "scorpio",
    symbol: "♏",
    element: "जल (Water)",
    rashiSwami: "मङ्गल (Mars)",
    luckyColor: "खैरो / गाढा रातो",
    luckyNumber: "९",
    luckyDirection: "उत्तर (North)",
    luckyPercent: 76,
    today: periodFrom(
      "अध्ययन र अनुसन्धानमा सफलता मिल्नेछ। विरोधी स्वतः परास्त हुनेछन्।",
      "अलस्यता त्यागी व्यायाम अपनाउनुहोला।",
      "गोप्य स्रोतबाट धन प्राप्ति हुनसक्छ।",
      "सम्बन्धमा सत्यतालाई प्राथमिकता दिनुहोला।",
      "हनुमानजीलाई सिन्दूर अर्पण गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि गोप्य योजना र अनुसन्धान सफल हुनेछ।",
      "रक्तचापको ख्याल राख्नुहोला।",
      "बीमा वा साझा लगानी सोचनीय छ।",
      "गहिरो भावनात्मक कुराकानी हुनेछ।",
      "मङ्गलवार हनुमान पूजा गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि रूपान्तरण र नयाँ सुरुवातको योग।",
      "मानसिक तनाव व्यवस्थापन गर्नुहोला।",
      "ऋण फछ्र्यौट वा लगानी फिर्ता सम्भव।",
      "विश्वास पुनर्स्थापना हुनेछ।",
      "काल भैरव मन्त्र जप गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि शक्ति, गोपनीयता र रूपान्तरणको वर्ष।",
      "वार्षिक स्वास्थ्यमा सावधानी आवश्यक।",
      "गोप्य लाभ र पुनर्निर्माणको योग।",
      "सम्बन्ध गहिरो तर परीक्षणमा पनि पर्नेछ।",
      "वर्षान्तमा मङ्गल शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "धनु",
    enName: "Sagittarius",
    slug: "sagittarius",
    symbol: "♐",
    element: "अग्नि (Fire)",
    rashiSwami: "गुरु (Jupiter)",
    luckyColor: "पहेँलो / सुन्तला",
    luckyNumber: "३",
    luckyDirection: "उत्तर-पूर्व (North-East)",
    luckyPercent: 88,
    today: periodFrom(
      "ज्ञान, धर्म र तीर्थयात्राको योग छ। गुरुको आशीर्वादले कार्य सिद्ध हुनेछ।",
      "स्वास्थ्य सुदृढ र ऊर्जावान् रहनेछ।",
      "शिक्षा र परामर्श क्षेत्रमा लाभ।",
      "जोडीबीच सहयोग बढ्नेछ।",
      "विष्णु सहस्रनाम पाठ गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि यात्रा, शिक्षा र धार्मिक कार्य सफल।",
      "कम्मर र जोर्नीको ख्याल राख्नुहोला।",
      "प्रकाशन वा तालिमबाट आय सम्भव।",
      "आशावादी सम्बन्ध रहनेछ।",
      "बिहीबार पहेँलो दान गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि उच्च शिक्षा वा विदेश सम्पर्क बढ्नेछ।",
      "नियमित हिँडडुल गर्नुहोला।",
      "सल्लाह व्यवसाय फस्टाउनेछ।",
      "पारिवारिक यात्राको योग।",
      "गुरु पूजा गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि ज्ञान, विस्तार र आध्यात्मिक उन्नतिको वर्ष।",
      "वार्षिक स्वास्थ्य राम्रो।",
      "शिक्षा/कानुन/यात्रा क्षेत्रमा ठूलो लाभ।",
      "सम्बन्धमा विश्वास बढ्नेछ।",
      "वर्षको सुरुमा गुरु शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "मकर",
    enName: "Capricorn",
    slug: "capricorn",
    symbol: "♑",
    element: "पृथ्वी (Earth)",
    rashiSwami: "शनि (Saturn)",
    luckyColor: "कालो / नीलो",
    luckyNumber: "८",
    luckyDirection: "दक्षिण (South)",
    luckyPercent: 82,
    today: periodFrom(
      "परिश्रमको मूल्याङ्कन हुनेछ। नयाँ दायित्व सफलतापूर्वक पूरा गर्नुहुनेछ।",
      "जोर्नी स्वास्थ्यमा ध्यान दिनुहोला।",
      "घरजग्गा वा निर्माणमा लगानी सोचनीय।",
      "पारिवारिक सम्बन्ध सुमधुर।",
      "शनिदेवलाई तिल/तेल अर्पण गर्नुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि अनुशासन र कडा मेहनतले फल दिनेछ।",
      "हड्डी जोर्नीको ख्याल राख्नुहोला।",
      "दीर्घकालीन परियोजना अघि बढ्नेछ।",
      "जिम्मेवारी बाँडफाँडले सम्बन्ध सहज।",
      "शनिवार कालो तिल दान गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि करियरमा स्थिर प्रगति।",
      "थकान व्यवस्थापन गर्नुहोला।",
      "सरकारी वा ठूला संस्थासँग काम सम्भव।",
      "पारिवारिक दायित्व पूरा हुनेछ।",
      "शनि मन्त्र जप गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि मेहनतको फल र स्थायी सफलताको वर्ष।",
      "वार्षिक स्वास्थ्यमा सावधानी।",
      "पद र सम्पत्ति दुवैमा वृद्धि।",
      "सम्बन्धमा परिपक्वता बढ्नेछ।",
      "वर्षान्तमा शनि शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "कुम्भ",
    enName: "Aquarius",
    slug: "aquarius",
    symbol: "♒",
    element: "वायु (Air)",
    rashiSwami: "शनि (Saturn)",
    luckyColor: "बैजनी / नीलो",
    luckyNumber: "११",
    luckyDirection: "पश्चिम (West)",
    luckyPercent: 86,
    today: periodFrom(
      "नयाँ सोच र प्रविधिमा रुचि बढ्नेछ। सामाजिक समूहमा सहभागिता बढ्नेछ।",
      "मानसिक स्फूर्ति उच्च रहनेछ।",
      "प्रविधि क्षेत्रबाट आम्दानी बढ्नेछ।",
      "साथीभाइबाट सहयोग मिल्नेछ।",
      "पीपलमा जल चढाउनुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि नवप्रवर्तन र सामाजिक कार्य सफल।",
      "नसा र रक्तसञ्चारको ख्याल राख्नुहोला।",
      "स्टार्टअप वा आईटी काम लाभदायी।",
      "मित्रमण्डल विस्तार हुनेछ।",
      "शनिवार नीलो वस्तु दान गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि नेटवर्क र प्रविधि परियोजना अघि बढ्नेछ।",
      "नियमित निद्रा अपनाउनुहोला।",
      "अनलाइन व्यापार बढ्नेछ।",
      "अनमेल विचार आदानप्रदान हुनेछ।",
      "हनुमान चालीसा पाठ गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि नवप्रवर्तन र सामाजिक प्रभावको वर्ष।",
      "वार्षिक स्वास्थ्य राम्रो।",
      "प्रविधि र सामूहिक आय स्रोत बलियो।",
      "सम्बन्धमा स्वतन्त्रता र सम्मान।",
      "वर्षको मध्यमा शनि-राहु शान्ति गर्नुहोला।"
    ),
  },
  {
    name: "मीन",
    enName: "Pisces",
    slug: "pisces",
    symbol: "♓",
    element: "जल (Water)",
    rashiSwami: "गुरु (Jupiter)",
    luckyColor: "सुनौलो पहेँलो",
    luckyNumber: "१२",
    luckyDirection: "उत्तर-पूर्व (North-East)",
    luckyPercent: 79,
    today: periodFrom(
      "अध्यात्म र सामाजिक सेवामा रुचि बढ्नेछ। मानसिक शान्तिको अनुभूति हुनेछ।",
      "पर्याप्त विश्राम र ध्यान गर्नुहोला।",
      "वैदेशिक व्यापार वा दूरगामी लगानीबाट शुभ नतिजा।",
      "गहिरो प्रेम र समर्पण महसुस हुनेछ।",
      "विष्णु मन्त्र जप तथा गाईलाई चारा खवाउनुहोला।"
    ),
    weekly: periodFrom(
      "हप्ताभरि सिर्जनात्मक र आध्यात्मिक काम सफल।",
      "पाउ र सुत्ने बानीको ख्याल राख्नुहोला।",
      "दान-धर्मसँग जोडिएको आय सम्भव।",
      "भावनात्मक सम्बन्ध गहिरो हुनेछ।",
      "बिहीबार पहेँलो मिठाई दान गर्नुहोला।"
    ),
    monthly: periodFrom(
      "महिनाभरि कला, संगीत र सेवा क्षेत्रमा अवसर।",
      "मानसिक स्वास्थ्य प्राथमिकता दिनुहोला।",
      "विदेशी सम्पर्कबाट लाभ।",
      "क्षमा र समझदारीले सम्बन्ध सुधार्नेछ।",
      "गंगाजलले पूजा गर्नुहोला।"
    ),
    yearly: periodFrom(
      "वर्षभरि आध्यात्मिक उन्नति र करुणाको वर्ष।",
      "वार्षिक स्वास्थ्यमा विश्राम आवश्यक।",
      "सेवा र सिर्जनाबाट आय बढ्नेछ।",
      "सम्बन्धमा आत्मिक सामीप्यता।",
      "वर्षान्तमा गुरु-विष्णु पूजा गर्नुहोला।"
    ),
  },
];

export const DEFAULT_DETAILED_RASHIFAL: DetailedRashi[] = SEEDS.map((s) => ({
  name: s.name,
  enName: s.enName,
  slug: s.slug,
  symbol: s.symbol,
  element: s.element,
  rashiSwami: s.rashiSwami,
  luckyColor: s.luckyColor,
  luckyNumber: s.luckyNumber,
  luckyDirection: s.luckyDirection,
  luckyPercent: s.luckyPercent,
  overview: s.today.overview,
  health: s.today.health,
  business: s.today.business,
  love: s.today.love,
  remedy: s.today.remedy,
  periods: buildPeriods(s.today, s.weekly, s.monthly, s.yearly),
}));

function asPeriod(input: unknown): PeriodForecast {
  if (!input || typeof input !== "object") return { ...EMPTY_PERIOD };
  const p = input as Partial<PeriodForecast>;
  return {
    overview: typeof p.overview === "string" ? p.overview : "",
    health: typeof p.health === "string" ? p.health : "",
    business: typeof p.business === "string" ? p.business : "",
    love: typeof p.love === "string" ? p.love : "",
    remedy: typeof p.remedy === "string" ? p.remedy : "",
  };
}

/** Normalize legacy flat rashifal JSON into period-aware records. */
export function normalizeRashifalList(raw: unknown): DetailedRashi[] {
  const defaultsBySlug = new Map(DEFAULT_DETAILED_RASHIFAL.map((r) => [r.slug, r]));
  const defaultsByName = new Map(DEFAULT_DETAILED_RASHIFAL.map((r) => [r.name, r]));

  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
  }

  return DEFAULT_DETAILED_RASHIFAL.map((fallback, index) => {
    const fromArray = raw[index];
    const fromMatch = (raw as Array<{ name?: string; slug?: string }>).find(
      (x) => x?.slug === fallback.slug || x?.name === fallback.name
    );
    const item = (fromArray || fromMatch || {}) as Partial<DetailedRashi> & {
      periods?: Partial<Record<RashifalPeriodKey, PeriodForecast>>;
    };

    const slug =
      (typeof item.slug === "string" && item.slug) ||
      defaultsByName.get(item.name || "")?.slug ||
      fallback.slug;

    const base = defaultsBySlug.get(slug) || fallback;

    const todayFromFlat = periodFrom(
      item.overview || item.periods?.today?.overview || base.periods.today.overview,
      item.health || item.periods?.today?.health || base.periods.today.health,
      item.business || item.periods?.today?.business || base.periods.today.business,
      item.love || item.periods?.today?.love || base.periods.today.love,
      item.remedy || item.periods?.today?.remedy || base.periods.today.remedy
    );

    const periods = {
      today: item.periods?.today ? asPeriod(item.periods.today) : todayFromFlat,
      weekly: item.periods?.weekly ? asPeriod(item.periods.weekly) : structuredClone(base.periods.weekly),
      monthly: item.periods?.monthly
        ? asPeriod(item.periods.monthly)
        : structuredClone(base.periods.monthly),
      yearly: item.periods?.yearly ? asPeriod(item.periods.yearly) : structuredClone(base.periods.yearly),
    };

    // If today period empty but flat exists
    if (!periods.today.overview && todayFromFlat.overview) {
      periods.today = todayFromFlat;
    }

    return {
      name: item.name || base.name,
      enName: item.enName || base.enName,
      slug,
      symbol: item.symbol || base.symbol,
      element: item.element || base.element,
      rashiSwami: item.rashiSwami || base.rashiSwami,
      luckyColor: item.luckyColor || base.luckyColor,
      luckyNumber: item.luckyNumber || base.luckyNumber,
      luckyDirection: item.luckyDirection || base.luckyDirection,
      luckyPercent:
        typeof item.luckyPercent === "number" ? item.luckyPercent : base.luckyPercent,
      overview: periods.today.overview,
      health: periods.today.health,
      business: periods.today.business,
      love: periods.today.love,
      remedy: periods.today.remedy,
      periods,
    };
  });
}

export function getRashiBySlug(list: DetailedRashi[], slug: string): DetailedRashi | null {
  const key = slug.trim().toLowerCase();
  return list.find((r) => r.slug === key) || null;
}

export function getPeriodForecast(
  rashi: DetailedRashi,
  period: RashifalPeriodKey
): PeriodForecast {
  return rashi.periods?.[period] || rashi.periods?.today || EMPTY_PERIOD;
}
