import React, { useState } from "react";
import { 
  Trophy, 
  BookMarked, 
  Clock, 
  HelpCircle, 
  History, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Bookmark, 
  Flame, 
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { ProgressLog, BookmarkedQuestion } from "../types";

interface DashboardProps {
  onSelectCategory: (category: string) => void;
  logs: ProgressLog[];
  bookmarks: BookmarkedQuestion[];
  onRemoveBookmark: (id: string) => void;
  onReviewBookmarkQuestion: (bookmark: BookmarkedQuestion) => void;
  isGenerating: boolean;
  selectedCategory: string | null;
}

export default function Dashboard({
  onSelectCategory,
  logs,
  bookmarks,
  onRemoveBookmark,
  onReviewBookmarkQuestion,
  isGenerating,
  selectedCategory,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"practice" | "bookmarks" | "history" | "rules">("practice");

  // Category schema
  const categories = [
    {
      id: "rc",
      label: "Reading Comprehension",
      sub: "Advanced Exam Standard Passage + 10 Premium MCQs",
      mains: "SSC CGL / Banking Mains",
      color: "border-l-4 border-l-sky-500",
      bg: "bg-sky-50 outline-sky-100",
      text: "Read unseen editorial style extracts naturally covering dynamic topics with Tone, Theme, Inference and context vocabulary rules."
    },
    {
      id: "se_ranimam",
      label: "Spotting Error from Rani Mam 2.0",
      sub: "Concept targeted errors based on the Premium 60 Rules",
      mains: "SSC Mains Essential",
      color: "border-l-4 border-l-amber-500",
      bg: "bg-amber-50 outline-amber-100",
      text: "Spot complex errors matching Rule 15 [Many/Number], Rule 1-2 [Since/For], Gerunds, Participles, and Infinitives. Fully zero-doubt Hinglish tutored analysis."
    },
    {
      id: "se_hard",
      label: "Spotting Error Hard Level",
      sub: "Camouflaged grammatical trap errors for advanced aspirants",
      mains: "UPSC CDS/CDS/NDA & CGL Prep",
      color: "border-l-4 border-l-red-500",
      bg: "bg-red-50 outline-red-100",
      text: "Lengthy sentences with multiple clauses, conditional traps, negative inversion, subjective/objective pronouns, subjunctive mood, and built-in 'No Error' traps."
    },
    {
      id: "cloze",
      label: "Cloze Test",
      sub: "High Level Fill-the-Passage Editorial test with 10 Blanks",
      mains: "UPSC & CGL Editorial standard",
      color: "border-l-4 border-l-emerald-500",
      bg: "bg-emerald-50 outline-emerald-100",
      text: "Tests vocabulary choice, phrasal verbs, idioms, and context. Hinglish breakdowns teach correct choices clearly."
    },
    {
      id: "pqrs",
      label: "Para Jumble (PQRS) Hard Level",
      sub: "Chronological Rearrangements with subtle transitions",
      mains: "Mains Advanced Parajumble",
      color: "border-l-4 border-l-indigo-500",
      bg: "bg-indigo-50 outline-indigo-100",
      text: "Includes 5 Prelims jumbles and 5 advanced Mains style fixed (S1/S6) rearrangements. Clear explanation of logical mandatory pairs."
    },
    {
      id: "fillers",
      label: "Fill in the Blanks (Fillers)",
      sub: "Single & Double blank contextual grammar and vocabulary drills",
      mains: "CGL / Bank PO Level",
      color: "border-l-4 border-l-purple-500",
      bg: "bg-purple-50 outline-purple-100",
      text: "Train on fixed prepositions, collocations, phrasal verbs, and word tone matching. Highly effective vocabulary booster."
    },
    {
      id: "improvement",
      label: "Sentence Improvement",
      sub: "Substitute bracketed parts for grammatical accuracy",
      mains: "EPFO / CDS / CGL Mains standard",
      color: "border-l-4 border-l-pink-500",
      bg: "bg-pink-50 outline-pink-100",
      text: "Improve highlighted segments with alternatives. Perfects parallelism, tense sequencing, subjunctive triggers, and correct auxiliary usage."
    },
    {
      id: "narration",
      label: "Narration (Direct & Indirect)",
      sub: "Advanced Direct/Indirect Conversions with concept-targeted Hinglish guidance",
      mains: "SSC CGL Mains / TCS Traps",
      color: "border-l-4 border-l-teal-500",
      bg: "bg-teal-50 outline-teal-100",
      text: "Master tense backshifting, SON pronoun rules, interrogatives, imperatives, exclamatories, optatives, 'Let' formulas, modal exceptions, vocative situations, and tag deletions."
    },
    {
      id: "voice",
      label: "Active & Passive Voice",
      sub: "Active/Passive conversions strictly covering the 12 core rules in Hinglish",
      mains: "SSC CGL / TCS Elite level",
      color: "border-l-4 border-l-rose-500",
      bg: "bg-rose-50 outline-rose-100",
      text: "Practice tense preservation, drop of vague subjects, 'Who' to 'By whom' traps, simple and perfect modals, fixed prepositions, di-transitive verbs, and bare infinitives."
    }
  ];

  // Selected Rani Mam's rules parsed nicely for offline study on the phone screen!
  const studyRules = [
    {
      id: 1,
      title: "SINCE vs FOR",
      core: "Since is used for a Point of Time (e.g., 2018, Monday, Childhood, Since morning). For is used for a Duration / Length of Time (e.g., 3 hours, ten years, a long time).",
      examples: [
        { bad: "They have lived in this apartment since ten years.", good: "They have lived in this apartment for ten years." },
        { bad: "Smita lived in this house since she was five years old.", good: "Smita has lived/has been living in this house since she was five years old." }
      ],
      tip: "Tutor Tip: Since marks a specific starting point. Perfect or Perfect Continuous tense is strictly required."
    },
    {
      id: 2,
      title: "Each / Every / Either / Neither / Any / None",
      core: "'Each' is an Adjective & Pronoun (can act as subject). 'Every' is ONLY an Adjective (never a subject on its own). Always use singular verbs & possessives.",
      examples: [
        { bad: "Every of the five children is dexterous in painting.", good: "Each of the five children is dexterous in painting." },
        { bad: "Every soldier and every officer was in their place.", good: "Every soldier and every officer was in his/her place (singular possessive!)." }
      ],
      tip: "Tutor Tip: 'Each of' / 'Neither of' + Plural Noun takes a Singular Verb!"
    },
    {
      id: 3,
      title: "Relative Pronouns: Who vs Whom vs Whose vs Which vs That",
      core: "Who is Singular/Plural Subject check ('He' test). Whom is Object check ('Him' test). Whose represents possession. Which/That represents non-living or animal assets.",
      examples: [
        { bad: "The girl which is wearing a blue shirt is my sister.", good: "The girl who is wearing a blue shirt is my sister." },
        { bad: "The university has ordered an inquiry into the leak who will submit...", good: "The university has ordered an inquiry into the leak which will submit..." }
      ],
      tip: "Tutor Tip: If verb count exceeds subject count, use 'Who' as subject helper, else use 'Whom'."
    },
    {
      id: 4,
      title: "Modal Verb Omissions",
      core: "Always use base bare verb V1 directly after models (can, should, would, must, may). Do not combine 'could/can' with 'able to' as they represent redundant ability.",
      examples: [
        { bad: "Because of the heavy rain, students could not be able to attend.", good: "Because of the heavy rain, students could not attend / were unable to attend." },
        { bad: "Radha woke up early so that she should watched the beautiful sunrise.", good: "Radha woke up early so that she should watch the beautiful sunrise." }
      ],
      tip: "Tutor Tip: 'Lest' triggers subjunctive or 'should', never utilize future will/not!"
    },
    {
      id: 5,
      title: "Singular & Plural Noun Traps (Uncountable nouns)",
      core: "Certain nouns are always Uncountable and take singular verbs support: Advice, Furniture, Luggage, Information, Hair, Work, Scenery. Never append direct 's' pluralizers.",
      examples: [
        { bad: "This furnitures has been taken on hire for the function.", good: "This furniture has been taken on hire for the function." },
        { bad: "The manager told the staff to complete all the works.", good: "The manager told the staff to complete all the work / pieces of work." }
      ],
      tip: "Tutor Tip: Cattle, Gentry, Poultry, Police are plural nouns. Never say 'cattles'!"
    },
    {
      id: 6,
      title: "Errors Related to Infinitives (To + V1)",
      core: "After prepositions, verbs usually take Gerund form (V1+ing), not infinitive. Some verbs like let, make, bid take bare infinitive (without 'to') in active voice.",
      examples: [
        { bad: "They are planning for settling in Mumbai with their son.", good: "They are planning to settle in Mumbai with their son." },
        { bad: "The instructor made the students to solve the problem.", good: "The instructor made the students solve the problem (bare infinitive!)." }
      ],
      tip: "Tutor Tip: 'Prevent from', 'prohibit from', 'abstain from' are always followed by V1+ing."
    },
    {
      id: 8,
      title: "Uses of Participles & Dangling Modifiers",
      core: "A participle clause must have a clear subject. If unstated, it mistakenly defaults to the subject of the main clause, causing logical absurdities.",
      examples: [
        { bad: "Being a rainy day, we didn't go out.", good: "It being a rainy day, we didn't go out." },
        { bad: "Walking on the road, a rickshaw hit him.", good: "While he was walking on the road, a rickshaw hit him." }
      ],
      tip: "Tutor Tip: Give an independent pronoun check like 'It being' to avoid dangling modification traps."
    },
    {
      id: 14,
      title: "Much / Many vs Little / Few",
      core: "Much (uncountable quantity) and Many (countable number). Little (negligible uncountable) vs Few (negligible countable). A little/few indicates at least something.",
      examples: [
        { bad: "There is not many traffic along the street where I live.", good: "There is not much traffic along the street where I live." },
        { bad: "Because of the strike, less men will be recruited.", good: "Because of the strike, fewer men will be recruited (countable!)." }
      ],
      tip: "Tutor Tip: Number of = use Few. Quantity/Amount of = use Little."
    },
    {
      id: 15,
      title: "\"The Number Of\" vs \"A Number Of\"",
      core: "\"The number of\" refers to a singular specific aggregate -> takes a Singular Verb. \"A number of\" means 'many' -> takes a Plural Verb.",
      examples: [
        { bad: "The number of fatal accidents have forced the police to be stringent.", good: "The number of fatal accidents has forced the police to be stringent." },
        { bad: "A number of boys is reading this novel.", good: "A number of boys are reading this novel." }
      ],
      tip: "Tutor Tip: 'Accidents' is the object of preposition 'of'; main subject is 'The number'."
    },
    {
      id: 16,
      title: "Double Comparatives & Double Superlatives",
      core: "Do not combine two comparative modifiers (e.g. more better) or two superlative modifiers (e.g. most smartest) together in the same qualifier block.",
      examples: [
        { bad: "It is more better if one of the parents stays at home.", good: "It is better if one of the parents stays at home." },
        { bad: "I am more lonelier here than I was in the USA.", good: "I am lonelier here than I was in the USA." }
      ],
      tip: "Tutor Tip: Adjectives like 'Cleverer', 'Better', 'Denser' are already comparative. Do not prefix 'more'!"
    },
    {
      id: 18,
      title: "\"With\", \"As Well As\", \"Together With\" Subject Conjunctions",
      core: "When two subjects are joined by with, together with, along with, besides, including, as well as, accompanied by, verb agrees strictly with the FIRST subject.",
      examples: [
        { bad: "The teacher as well as the students have gone on an excursion.", good: "The teacher as well as the students has gone on an excursion." },
        { bad: "The priest together with his followers were fatally injured.", good: "The priest together with his followers was fatally injured." }
      ],
      tip: "Tutor Tip: Ignore the middle comma phrase, target first noun as subject!"
    },
    {
      id: 20,
      title: "Hardly / Scarcely (When) & No Sooner (Than)",
      core: "Always pair Hardly/Scarcely with 'when'. Pair No Sooner with comparative 'than'. If placed at sentence start, they trigger auxiliary Subject-Verb Inversion.",
      examples: [
        { bad: "No sooner did Priya get her report card when she started jumping.", good: "No sooner did Priya get her report card than she started jumping." },
        { bad: "Hardly we had reached the platform when the train started.", good: "Hardly had we reached the platform when the train started (Inversion!)." }
      ],
      tip: "Tutor Tip: Ensure spelling of 'than' (comparative), do not use 'then' or 'when'."
    },
    {
      id: 21,
      title: "Verbs Form Traps (Lie vs Lay, Hung vs Hanged)",
      core: "Lie (to rest) has forms: lie - lay - lain. Lay (to put down) has forms: lay - laid - laid. Hang (person/execution) is hanged-hanged. Hang (object) is hung-hung.",
      examples: [
        { bad: "The prisoner was sentenced to death and was hung.", good: "The prisoner was sentenced to death and was hanged." },
        { bad: "He has laid on the beach for sun-basking.", good: "He has lain on the beach for sun-basking (past participle of lie!)." }
      ],
      tip: "Tutor Tip: 'Broadcast', 'Cast', 'Telecast', 'Shut', 'Spread' are identical in V1, V2, and V3. Never say 'broadcasted'!"
    },
    {
      id: 24,
      title: "Verbs of Sensation vs Adverbs",
      core: "Verbs of sensation/perception (taste, smell, look, feel, sound) are linking verbs and take Adjectives (not adverbs) to describe the subject status.",
      examples: [
        { bad: "He did not eat the apple because it tasted bitterly.", good: "He did not eat the apple because it tasted bitter." },
        { bad: "Mangoes taste more sweetly than any other fruits.", good: "Mangoes taste more sweet than any other fruits." }
      ],
      tip: "Tutor Tip: Say 'I feel bad', not 'I feel badly'. Linking verbs express state, not action."
    },
    {
      id: 25,
      title: "Fast vs Fastly",
      core: "There is NO word such as 'Fastly' in the English dictionary. 'Fast' functions as both an Adjective and an Adverb.",
      examples: [
        { bad: "He ran so fastly that he caught the running train.", good: "He ran so fast that he caught the running train." },
        { bad: "My heart is beating very fastly.", good: "My heart is beating very fast." }
      ],
      tip: "Tutor Tip: Trap warning! Do not get fooled by symmetry of other adverbs ending in '-ly'!"
    },
    {
      id: 27,
      title: "Farther vs Further",
      core: "Farther refers to physical distance (comparative of far). Further refers to additional, extra, or next stage of progression.",
      examples: [
        { bad: "If he wants farther information, send him to me.", good: "If he wants further information, send him to me." },
        { bad: "Mumbai is further from Delhi than Patna.", good: "Mumbai is farther from Delhi than Patna." }
      ],
      tip: "Tutor Tip: Further can act as both adjective/verb; 'Farther' belongs strictly to physical span."
    },
    {
      id: 30,
      title: "Main Subject vs Qualifier Noun Agreement",
      core: "Verb must agree strictly with the actual central Main Subject noun, not the intervening qualifiers, prepositions, or plurals.",
      examples: [
        { bad: "One-to-one interaction with parents are known to be important.", good: "One-to-one interaction with parents is known to be important." },
        { bad: "The box containing the fresh apples from Kashmir were thrown away.", good: "The box containing the fresh apples from Kashmir was thrown away." }
      ],
      tip: "Tutor Tip: Cut out the descriptive prepositional values to spot the core noun."
    },
    {
      id: 32,
      title: "Superfluous Redundancies",
      core: "Certain word pairings repeat the same meaning and are strictly incorrect. E.g., Return + back, Repeat + again, Discuss + about, Supposing + if, Bag and baggage + with.",
      examples: [
        { bad: "Supposing if all your problems are solved, what will you do?", good: "Supposing all your problems are solved / If all your problems are solved..." },
        { bad: "He returned back to school because he forgot his book.", good: "He returned to school because he forgot his book." }
      ],
      tip: "Tutor Tip: Also note, 'fled' means 'ran away', so 'fled away' is strictly redundant and incorrect."
    },
    {
      id: 33,
      title: "Conditional Clause structures",
      core: "Type 1: If + present, will + V1. Type 2: If + past (were/V2), would + V1. Type 3: If + Past Perfect (had + V3), would have + V3.",
      examples: [
        { bad: "If I will work hard, I will secure good marks.", good: "If I work hard, I will secure good marks (No will/shall in conditional clause)." },
        { bad: "If children had paid attention, they would not miss the bus.", good: "If children had paid attention, they would not have missed the bus (Type 3)." }
      ],
      tip: "Tutor Tip: Conditional conjunction clauses (if, when, after, unless, until) never take future auxiliaries."
    },
    {
      id: 34,
      title: "Two Nouns Joined by Preposition",
      core: "When two identical nouns are joined by a preposition, both nouns must be singular. Never use plural format.",
      examples: [
        { bad: "She read pages after pages of the holy Bible.", good: "She read page after page of the holy Bible." },
        { bad: "Towns after towns were conquered, but he found no peace.", good: "Town after town was conquered, but he found no peace." }
      ],
      tip: "Tutor Tip: These paired structures strictly govern a Singular Verb!"
    },
    {
      id: 37,
      title: "Inspite of vs Despite / Consist of vs Comprise",
      core: "'Despite' never takes the preposition 'of'. 'Comprise' never takes 'of' in active voice.",
      examples: [
        { bad: "Despite of being a close friend, he did not help me.", good: "Despite being a close friend / In spite of being a close friend, he did not help." },
        { bad: "The question paper comprises of fifty questions.", good: "The question paper comprises fifty questions / consists of fifty questions." }
      ],
      tip: "Tutor Tip: Note that 'be comprised of' is correct in passive voice context."
    },
    {
      id: 39,
      title: "Arrangement of Personal Pronouns Order",
      core: "Good sense / Normal circumstances: Use order 2nd (plural/singular) -> 3rd -> 1st Person (231 rule). Negative sense / Admission of fault: Use order 1st -> 2nd -> 3rd (123 rule).",
      examples: [
        { bad: "I, he and you will arrange the library books.", good: "You, he and I will arrange the library books (231 order)." },
        { bad: "You, he and I are guilty of this mischief.", good: "I, you and he are guilty of this mischief (123 confession order)." }
      ],
      tip: "Tutor Tip: For plural pronouns (We, You, They), order is always 123 under all conditions."
    },
    {
      id: 40,
      title: "Negative words: Until vs Unless / Lest",
      core: "Until (time indicator) and Unless (condition indicator) are already negative terms. Do not use negative 'not' inside their dependent clause. Do not use future simple inside these clauses.",
      examples: [
        { bad: "Unless you do not take care of your health, you will suffer.", good: "Unless you take care of your health, you will suffer." },
        { bad: "Lest you may not repent in the long run.", good: "Lest you should repent in the long run (Lest = should/subjunctive + positive verb!)." }
      ],
      tip: "Tutor Tip: Do not use future simple tense inside until/unless clauses."
    },
    {
      id: 42,
      title: "\"Both\" and \"Between\" Coordination",
      core: "Both and Between are strictly coordinated with 'and'. Do not pair them with 'as well as', 'or', or 'with' in standard CGL grammar.",
      examples: [
        { bad: "Choose between staying or leaving the room.", good: "Choose between staying and leaving the room." },
        { bad: "The event was attended by both the manager as well as the staff.", good: "The event was attended by both the manager and the staff." }
      ],
      tip: "Tutor Tip: In negative sentences, do not use 'Both'. Use 'Neither/Nor' instead."
    },
    {
      id: 43,
      title: "Conjunction \"THAT\" in Indirect speech before WH-words",
      core: "Do not use the conjunction 'that' before interrogative wh-words (who, how, why, when) or conditional helpers (if, whether) in indirect speech.",
      examples: [
        { bad: "He asked her that why she was late to the examination.", good: "He asked her why she was late to the examination." },
        { bad: "She asked her teacher that if she could repeat the term.", good: "She asked her teacher if/whether she could repeat the term." }
      ],
      tip: "Tutor Tip: Wh-words and if/whether act as joiners themselves, so 'that' is superfluous."
    },
    {
      id: 45,
      title: "Inversion",
      core: "When a sentence starts with a restrictive or negative adverb (Seldom, Rarely, Never, Hardly, Scarcely, Under no circumstances), apply auxiliary subject-verb inversion.",
      examples: [
        { bad: "Never I have listened to such beautiful music.", good: "Never have I listened to such beautiful music." },
        { bad: "Under no circumstances I will share your personal details.", good: "Under no circumstances will I share your personal details." }
      ],
      tip: "Tutor Tip: This creates emphasize. Make sure verb comes before the subject noun."
    },
    {
      id: 47,
      title: "Confusing Word Pairs: Practice vs Practise etc.",
      core: "Noun (-ce) vs Verb (-se): Practice (Noun) vs Practise (Verb), Advice (Noun) vs Advise (Verb). Affect (Verb meaning to influence) vs Effect (Noun meaning result).",
      examples: [
        { bad: "The doctor adviced me to rest.", good: "The doctor advised me to rest (Advised is Verb!)." },
        { bad: "The bad weather can effect the crop yield.", good: "The bad weather can affect the crop yield." }
      ],
      tip: "Tutor Tip: Lose (Verb, 'khona') vs Loose (Adjective, 'dhila'). Breath (Noun) vs Breathe (Verb)."
    },
    {
      id: 56,
      title: "Causative Verbs (Make, Let, Have, Get)",
      core: "Active voice: Make/Let/Have + Bare Infinitive (V1 without 'to'). Passive voice: 'Make' takes full infinitive (To + V1). 'Get' takes person to + V1, otherwise object + V3.",
      examples: [
        { bad: "I made him to do the research work.", good: "I made him do the research work." },
        { bad: "He was made do the research work by me.", good: "He was made to do the research work by me (Passive!)." }
      ],
      tip: "Tutor Tip: 'Have' active takes V1 (e.g. have mechanic check). Passive takes third form V3."
    },
    {
      id: 58,
      title: "Adjective Order: Cardianls & Ordinals (OCM Rule)",
      core: "When multiple numerals qualify a noun, place them strictly in the order: Ordinal (first, second) -> Cardinal (one, two) -> Multiplicative (single, double).",
      examples: [
        { bad: "The two first chapters of this book are interesting.", good: "The first two chapters of this book are interesting (Ordinal first, then Cardinal!)." },
        { bad: "The single two first rooms of this complex...", good: "The first two single rooms of this complex..." }
      ],
      tip: "Tutor Tip: Remember the mnemonic abbreviation: O-C-M."
    },
    {
      id: 59,
      title: "OSASCOMP Adjective Arrangement",
      core: "When multiple descriptive adjectives qualify a noun, order them as: Opinion -> Size -> Age -> Shape -> Color -> Origin -> Material -> Purpose.",
      examples: [
        { bad: "I saw a red, small, leather bag on the table.", good: "I saw a small (Size), red (Color), leather (Material) bag on the table." },
        { bad: "My friend started a restaurant in a wooden big building.", good: "My friend started a restaurant in a big (Size), wooden (Material) building." }
      ],
      tip: "Tutor Tip: Purpose tags (e.g., swimming, gardening) always sit immediately adjacent to the noun."
    },
    {
      id: 60,
      title: "Made Of vs Made From",
      core: "Made of: Used when the source material retains its original state physical status (physical change). Made from: Used when material transforms status chemically (chemical change).",
      examples: [
        { bad: "Flour is made of wheat.", good: "Flour is made from wheat (chemical/transformative change!)." },
        { bad: "The table is made from wood.", good: "The table is made of wood (retains physical wood quality!)." }
      ],
      tip: "Tutor Tip: Paper is made from wood. Ring is made of gold."
    }
  ];

  // Aggregated scores
  const totalTests = logs.length;
  const avgAccuracy = totalTests > 0 
    ? Math.round(logs.reduce((acc, log) => acc + log.accuracy, 0) / totalTests) 
    : 0;
  const highestScore = totalTests > 0 
    ? Math.max(...logs.map(log => log.score)) 
    : 0;

  return (
    <div id="dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Top Banner with custom encouragement */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-mono font-medium inline-block">
            Target Exam Mode Active
          </span>
          <h2 className="text-base sm:text-lg font-sans font-black text-white tracking-wide">Mock Practice Arena</h2>
          <p className="text-slate-400 max-w-xl text-[11px] sm:text-xs">
            India's most interactive English mock arena. Tap on any competitive exam category below to generate fresh, custom AI tests, with line-by-line Hindi translation and real-time grammar tutoring!
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative z-10 self-stretch sm:self-center justify-center">
          <Flame className="w-10 h-10 text-orange-500 animate-pulse" />
          <div>
            <div className="text-xs text-slate-400 font-mono">My Daily Streak</div>
            <div className="text-xl font-black text-white">5-Day Active!</div>
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex items-center space-x-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium font-sans">Total Mocks</div>
            <div className="text-2xl font-black text-slate-800 font-mono">{totalTests}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex items-center space-x-3.5">
          <div className="p-3 bg-sky-500/10 text-sky-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium font-sans">Avg Accuracy</div>
            <div className="text-2xl font-black text-slate-800 font-mono">{avgAccuracy}%</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex items-center space-x-3.5 col-span-2 sm:col-span-1">
          <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-lg">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium font-sans">Saved Questions</div>
            <div className="text-2xl font-black text-slate-800 font-mono">{bookmarks.length}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex items-center space-x-3.5 col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium font-sans">Highest Mock Score</div>
            <div className="text-2xl font-black text-slate-800 font-mono">{highestScore} correct</div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("practice")}
          className={`px-4 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "practice" 
              ? "border-b-amber-500 text-slate-900" 
              : "border-b-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Mock Practice Arena
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "rules" 
              ? "border-b-amber-500 text-slate-900" 
              : "border-b-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Rani Mam's Study Sheet <span className="bg-amber-500/10 text-amber-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">PDF Extract</span>
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`px-4 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "bookmarks" 
              ? "border-b-amber-500 text-slate-900" 
              : "border-b-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Bookmarked Questions ({bookmarks.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 font-sans text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "history" 
              ? "border-b-amber-500 text-slate-900" 
              : "border-b-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          History logs
        </button>
      </div>

      {/* TABS CONTENT */}
      {activeTab === "practice" && (
        <div id="practice-tab-content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans font-bold text-slate-900">Select Practice Drill</h3>
            <span className="text-xs text-slate-400 font-sans font-medium">Click to generate fresh live tests with high standards</span>
          </div>

          {isGenerating && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 p-4 rounded-xl flex items-center space-x-3 mb-4 animate-pulse">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              <div className="text-sm font-sans font-medium">
                Bhai, please wait! AI is crafting your customized exam test for: <b className="capitalize text-slate-900">{selectedCategory?.replace('_', ' ')}</b>... (Will take less than 15 seconds)
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div 
                  key={cat.id}
                  className={`bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative ${cat.color} ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                          {cat.mains}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-800 font-sans mt-1.5 group-hover:text-amber-500 transition-colors">
                          {cat.label}
                        </h4>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {cat.text}
                    </p>
                  </div>
                  
                  <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono font-medium">
                      {cat.sub}
                    </span>
                    <button
                      disabled={isGenerating}
                      onClick={() => onSelectCategory(cat.id)}
                      className={`text-xs px-4 py-2 rounded-lg font-sans font-bold cursor-pointer select-none flex items-center gap-1.5 transition-all text-white ${
                        isGenerating 
                          ? "bg-slate-300 pointer-events-none" 
                          : "bg-slate-900 hover:bg-amber-500 active:scale-95"
                      }`}
                    >
                      <span>Start test</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "rules" && (
        <div id="rules-tab" className="space-y-6 bg-slate-50 border border-slate-200/50 rounded-2xl p-4 sm:p-6 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-sans font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Rani Mam's Grammar Study Sheet
              </h3>
              <p className="text-xs text-slate-500 font-sans mt-0.5">Quick references extracted directly from the syllabus pages 1-29.</p>
            </div>
            <div className="text-[11px] font-mono bg-amber-500 text-slate-900 font-black px-2 py-1 rounded self-start sm:self-center">
              60 Rules of Grammar 2.0
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {studyRules.map((rule) => (
              <div 
                key={rule.id}
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-100 text-amber-800 text-xs font-black font-mono w-7 h-7 flex items-center justify-center rounded-lg">
                    {rule.id}
                  </span>
                  <h4 className="text-sm font-sans font-bold text-slate-800">
                    {rule.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50/80 p-2.5 rounded-lg border-l-2 border-l-amber-400">
                  {rule.core}
                </p>

                <div className="space-y-2 mt-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase font-sans tracking-wider">Common Errors vs Correct:</div>
                  {rule.examples.map((ex, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="text-red-600 font-medium flex items-start gap-1">
                        <span className="font-bold font-mono">❌ Incorrect:</span>
                        <span>{ex.bad}</span>
                      </div>
                      <div className="text-emerald-700 font-bold flex items-start gap-1">
                        <span className="font-bold font-mono">✅ Correct:</span>
                        <span>{ex.good}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-50 border border-amber-100 text-amber-800 p-2.5 rounded-lg text-xs font-medium font-sans flex items-start gap-1.5">
                  <span className="text-amber-500">💡</span>
                  <span>{rule.tip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "bookmarks" && (
        <div id="bookmarks-tab-content" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500" />
              Bookmarked Critical Questions
            </h3>
            <span className="text-xs text-slate-500 font-sans">
              Tricky questions saved for concept drill/revision
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
              <BookMarked className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-600 font-sans text-sm font-medium">Bhai, no questions bookmarked yet!</p>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                Whenever you take a practice test, tap the Bookmark icon on any tricky error or filler so it shows up here for review and similar question drills.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <div 
                  key={bookmark.id}
                  className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-black px-2 py-0.5 rounded">
                          {bookmark.categoryLabel}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          From: {bookmark.quizTitle}
                        </span>
                      </div>
                      <h4 className="text-sm font-sans font-bold text-slate-800 mt-2 leading-relaxed">
                        {bookmark.question.text}
                      </h4>
                    </div>

                    <button
                      title="Remove Bookmark"
                      onClick={() => onRemoveBookmark(bookmark.id)}
                      className="text-amber-500 hover:text-slate-400 transition-colors p-1"
                    >
                      <Bookmark className="w-5 h-5 fill-amber-500" />
                    </button>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {bookmark.question.options.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const isCorrect = letter === bookmark.question.correctAnswer;
                      return (
                        <div 
                          key={i} 
                          className={`text-xs p-2 rounded border font-sans ${
                            isCorrect 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold" 
                              : "bg-slate-50 border-slate-100 text-slate-600"
                          }`}
                        >
                          <span className="font-mono font-extrabold mr-1">({letter})</span> {opt}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                    <span className="text-xs text-slate-500 font-sans font-bold">
                      Rule: {bookmark.question.explanation.rule || "General Grammar Logic"}
                    </span>
                    <button
                      onClick={() => onReviewBookmarkQuestion(bookmark)}
                      className="text-xs bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 font-bold font-sans px-3 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer select-none"
                    >
                      <span>Review / Tutoring Chat</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div id="history-tab" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" />
              Practice Progress Logs
            </h3>
            <span className="text-xs text-slate-500 font-sans">Track your CGL/PO evaluation standards</span>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
              <History className="w-12 h-12 text-slate-400 mx-auto" />
              <p className="text-slate-600 font-sans text-sm font-medium">Bhai, no mocks submitted yet!</p>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                Once you select any grammar or comprehension challenge and click "Submit Quiz," detailed records of your accuracy and score are preserved here. Keep going!
              </p>
            </div>
          ) : (
            <div className="border border-slate-200/50 bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-sans">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-black tracking-wider">
                    <tr>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Quiz Session</th>
                      <th className="px-6 py-3">Attempted At</th>
                      <th className="px-6 py-3 text-center">Score</th>
                      <th className="px-6 py-3 text-center">Accuracy (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 font-medium font-sans">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase font-mono">
                            {log.categoryLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4">{log.title}</td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold whitespace-nowrap text-slate-900">
                          {log.score} / {log.totalQuestions}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            log.accuracy >= 80 
                              ? "bg-emerald-50 text-emerald-800" 
                              : log.accuracy >= 50 
                                ? "bg-amber-50 text-amber-800" 
                                : "bg-red-50 text-red-800"
                          }`}>
                            {log.accuracy}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
