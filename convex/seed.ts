import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type SeedUser = {
  clerkId: string;
  name: string;
  school: string;
  bio: string;
  avatarUrl: string;
  preferredAgents: string[];
  modelMix: { opus: number; gpt: number; gemini: number };
  typicalTokenBurn: "low" | "medium" | "high" | "extreme";
};

/**
 * Cursor Campus Leads (Fall 2026) — scraped from
 * https://campus-leads-fall-2026.vercel.app/
 * Fingerprint fields are varied placeholders — not from the source page.
 */
const SEED_USERS: SeedUser[] = [
  {
    clerkId: "seed_aaryanm",
    name: "Aaryan Mehta",
    school: "Berkeley",
    bio: "Undergraduate Student at Berkeley",
    avatarUrl: "https://api.typeform.com/responses/files/6302b199030e8c5b1670005890f17583aa65fc5d36f09c48b3e0ad54e043d53b/profile.png",
    preferredAgents: ["cursor"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "low",
  },
  {
    clerkId: "seed_nithya_app",
    name: "Nithya Appannagaari",
    school: "Berkeley",
    bio: "Cursor has become my default IDE because it lets me focus on solving development problems instead of getting stuck in implementation.",
    avatarUrl: "https://api.typeform.com/responses/files/686702ef8fe00252cbfcf8792dfd652734708f75f77e6df1cd0e802c8f77b35d/100_2275_3.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_fengyi_ruan",
    name: "Victoria Ruan",
    school: "Berkeley",
    bio: "Undergraduate Student at Berkeley",
    avatarUrl: "https://api.typeform.com/responses/files/b77fd290c40a5ab005eed792bef25c9b23d25a2a84a62b0f2e8c3df12c480831/victoria_ruan_headshot.jpg",
    preferredAgents: ["cursor","copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_alanp",
    name: "Alan Pham",
    school: "CMU",
    bio: "I love Cursor because of its familiar IDE and advance agentic workflow. I started using Cursor to kickstart my personal projects during the school year.",
    avatarUrl: "https://api.typeform.com/responses/files/4a0956300e81ea20a924cedc2ad350492cd9b2dd729806f97e7c257dbda517af/alan_pfp.jpg",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_eunsooo",
    name: "Eunsoo Oh",
    school: "CMU",
    bio: "Cursor has changed how I think about building.",
    avatarUrl: "https://api.typeform.com/responses/files/e62c365b2a76a13dbad7224dd127c9ea7966486684c8ded344fc45d24b92942e/IMG_0925.JPG",
    preferredAgents: ["claude_code","copilot"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_iturkmen",
    name: "Idil Doga Turkmen",
    school: "Caltech",
    bio: "I love Cursor because it makes the process of building and experimenting with projects feel much more creative and accessible.",
    avatarUrl: "https://api.typeform.com/responses/files/50a14d00fb83bb8980cf19a4cd71e6abd041379d32cf8d5c4c5675de3e21a86b/Linkedin_Profile.jpg",
    preferredAgents: ["cursor","claude_code","copilot"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_db3654",
    name: "Dina Blachman",
    school: "Columbia",
    bio: "Cursor is the first tool that made me excited to code in my free time again.",
    avatarUrl: "https://api.typeform.com/responses/files/49eac3c2cd250fe350cbf8ec92542352d9d0baf78ea91825363d4da22b4ad36d/IMG_6799.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_pp2920",
    name: "Pooja Prabakaran",
    school: "Columbia",
    bio: "I love Cursor because it's become more than a coding assistant for me, it's a genuine thought partner throughout the entire development process, from initial architecture to final optimization.",
    avatarUrl: "https://api.typeform.com/responses/files/eeac3513f33a2084f56ad6318d848cbd95b24c4231f09052e456a9817363ab93/Cursor_Headshot.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_gjw62",
    name: "Gene Wicaksono",
    school: "Cornell",
    bio: "Hi, I’m Gene, and I’m an Electrical and Computer Engineering and Computer Science student at Cornell.",
    avatarUrl: "https://api.typeform.com/responses/files/4a325cc5e00f9e692b3430d632fd7978e74f2d733c667751d5959e39c057a3cc/edited_2.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_sw2374",
    name: "Sonja Wong",
    school: "Cornell",
    bio: "Before this summer, I loved using Cursor to build personal projects such as a Korean learning webapp with REAL Korean vocab / phrases (WAY better than duolingo) and a EDM translator (make beats by just using symbols and letters from your keyboard), and now…",
    avatarUrl: "https://api.typeform.com/responses/files/90a9947ab0d25c3d44827ce7161c2a6481ac5e3dcf92a3d97cec9d0b54cb1055/IMG_1943.jpeg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_sar344",
    name: "Stefanie Rivera-Osorio",
    school: "Cornell",
    bio: "I love Cursor because it makes my day to day engineering workflow seamless. As a SWE Intern at Datadog, I use Cursor as my primary IDE.",
    avatarUrl: "https://api.typeform.com/responses/files/d3a9c79dd1c22fdd8fb36887aa093b2d358470c6ff7e1a473b473d6de9888046/IMG_3702.JPG",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_asawant43",
    name: "Aamogh Sawant",
    school: "Georgia Tech",
    bio: "Cursor has been such a unique tool for me recently and its agent mode has changed how I build DS@GT monorepo, which showcases the member portal and our Hacklytics tooling.",
    avatarUrl: "https://api.typeform.com/responses/files/93b49779fda78d5909543a4cec40dfdfb26388f4c1af42fd65333656bb423d81/aamoghsawantt_gmail.com_0cc023f9.jpg",
    preferredAgents: ["claude_code","copilot"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_ngupta400",
    name: "Nikunj Gupta",
    school: "Georgia Tech",
    bio: "Nowadays, I use Cursor as my default coding tool, not just as an autocomplete extension.",
    avatarUrl: "https://api.typeform.com/responses/files/ed23527be37d5bf9e1ee0d1dcf40d41f767194c4d46aeed47b4194ab36d43fae/S26_Headshot_121.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_kellyolmos",
    name: "Kelly Olmos",
    school: "Harvard",
    bio: "Cursor is my main IDE for personal projects. Right now I'm using it to work through Django query optimization on an open-source project (fixing N+1 queries in gyrinx).",
    avatarUrl: "https://api.typeform.com/responses/files/4ba85f05933b8d5b3de4f0d8a0e557638697ab12b2fbe08ead495e7c4c9f1303/KellyOlmosHeadshot.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_lbae",
    name: "Lance Bae",
    school: "Harvard",
    bio: "I love using Cursor because it is so deeply integrated into the IDE environment I grew up coding in.",
    avatarUrl: "https://api.typeform.com/responses/files/4bac3084adf16cb36b0a42d74634cdf60269f3656540a2113fc9ca138a0ac42d/lance.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_zachchen",
    name: "Zach Chen",
    school: "Harvard",
    bio: "I literally am the #1 user at Harvard most likely. I have the ultra plan, pro+ plan, and have been using this since the end of 2024.",
    avatarUrl: "https://api.typeform.com/responses/files/336bc87a1cc5c58091fdd0b5c307e1d6143a8c37aa97b5f3b3195a4c6b09bb8f/IMG_5887_2.HEIC",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_nmehrot2",
    name: "Navya Mehrotra",
    school: "Johns Hopkins",
    bio: "I first tried Cursor at HackMIT and haven't built without it since.",
    avatarUrl: "https://api.typeform.com/responses/files/798b72903f09d6633cb403c432f9bf2e3f0b7904d76549d58f77395fdacc38b2/Screenshot_2026_07_21_at_9.05.33_AM.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_sanchali",
    name: "Sanchali Banerjee",
    school: "MIT",
    bio: "I love the integrated nature of Cursor and how easily it allows me to move between planning, implementing, and debugging software, providing a fully integrated workspace that significantly expedites my software development.",
    avatarUrl: "https://api.typeform.com/responses/files/6e3ee6c8e4790aba0ca3efa6ca72743ff412405a9a0f08d5652a97365cbc214c/sanchali_banerjee.jpeg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_tfr9403",
    name: "Tasnia Rafa",
    school: "NYU",
    bio: "As a college student, I juggle a constant stream of emails, lectures, and deadlines. Using Cursor helps me stay on top of it all and make the most of my time.",
    avatarUrl: "https://api.typeform.com/responses/files/33a4343107f47e26d00c6b763732c71b1bb6ea5f0ccd80b7049c7341a610092d/Screenshot_2025_09_16_at_9.28.38_PM.png",
    preferredAgents: ["claude_code","copilot"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_shawnli",
    name: "Shawn Li",
    school: "Princeton",
    bio: "I love using Composer due to it's amazing affordability yet effectiveness. I use Cursor to build fun side projects, such as a multiplayer online tag game I recreated.",
    avatarUrl: "https://api.typeform.com/responses/files/a7282adad841abb38a0a99f110855f0f9be350dd62f8c19c781d9d8c68ddad53/IMG_1994.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_annieee",
    name: "Annie Lee",
    school: "Stanford",
    bio: "Sleek interface. Incredible context understanding.",
    avatarUrl: "https://api.typeform.com/responses/files/adc1adb2079d2365dd4b32eb0f82a976a57ce6d77f5914faf76d0da98d7ab210/Headshot_Annie.PNG",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_shardulm",
    name: "Shardul Marathe",
    school: "Stanford",
    bio: "I am a builder.",
    avatarUrl: "https://api.typeform.com/responses/files/28bbe12b7e058d382d54905aa0017af05cf50f654b66efffe69b5b983f610cd2/Shardul_Marathe_Headshot.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_loreleitang",
    name: "Lorelei Tang",
    school: "UCLA",
    bio: "As a computer science student with a passion for building cool things and expressing my creativity through code, I love how fun and easy it is to bring my ideas to life alongside Cursor.",
    avatarUrl: "https://api.typeform.com/responses/files/6af0884193373a9fe99c25dac957234ca6a35c2c64ed5a6d9c3a5ec0ca0533d8/Lorelei_Tang_Headshot.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_muditmahajan",
    name: "Mudit Mahajan",
    school: "UCLA",
    bio: "I love Cursor because I'm an explorer who's been given an insane tool for exploration.",
    avatarUrl: "https://api.typeform.com/responses/files/d7619b0f8f4461ec3b9cb78d2a83f965728a5c46744e3eebfed5e59a8fef2850/IMG_0401.jpeg",
    preferredAgents: ["cursor","copilot"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_yuliaanashkina",
    name: "Yulia Anashkina",
    school: "UCLA",
    bio: "I use Cursor on all my engineering projects, including personal projects like a stablecoin depeg detector, school projects like my data science senior capstone project, and at my internship as a Data Engineer at Rivian.",
    avatarUrl: "https://api.typeform.com/responses/files/cac633b11ec423577f354010e5c368e40ee1a7f397280ec56302ac38a27746ef/Headshot.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_alihsn",
    name: "Ali Hussain",
    school: "UT Austin",
    bio: "I use Cursor in almost every project now, from my startup Lonyst to class assignments to technical interviews. What I love most is the flexibility of selecting different AI models and leveraging each for its strengths.",
    avatarUrl: "https://api.typeform.com/responses/files/7cf7e8a5570f3bc6fcb5fe461201acffa52535c9c59597adb0fb8d99788083ee/img.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_jenna_snow_lee",
    name: "Jenna Lee",
    school: "UT Austin",
    bio: "Back in 2024, my very first hackathon project was on Cursor. I'd never used an AI coding agent, never shipped anything full-stack, never really believed an idea in my head could become working software that fast.",
    avatarUrl: "https://api.typeform.com/responses/files/d14651b00bccc3a1fade8e3c0b7888a7777075c0ffc904433564485866590edb/DSC06031_6.jpg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_abhatnagar",
    name: "Ansh Bhatnagar",
    school: "University of California, San Diego",
    bio: "Cursor was the first AI-native IDE I really adopted, and it’s become my default way to build.",
    avatarUrl: "https://api.typeform.com/responses/files/3b482200273c8d3bf159bcdf430707e80424a240c821dd45495c73fb62710df8/ansh.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_ddxu",
    name: "Daniel Xu",
    school: "University of California, San Diego",
    bio: "I love Cursor because it’s the best AI integrated editor experience I’ve used.",
    avatarUrl: "https://api.typeform.com/responses/files/a0c1e65a152f764390805adfdfe7af3db4e48a5717ac67d9d4251a513ee44896/headshot.jpeg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_tsitu",
    name: "Tianlin Situ",
    school: "University of California, San Diego",
    bio: "I love Cursor because it's fast and reliable, and it's just become part of how I work. I'm never waiting on it, and I trust it to do what I need.",
    avatarUrl: "https://api.typeform.com/responses/files/ef0926326a470855bd5b907c201e8d2f36965530c6b548e9753866e79f40741e/tianlin.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_hamba2",
    name: "Hita Amba",
    school: "University of Illinois Urbana-Champaign",
    bio: "I love using Cursor because it helps me turn ideas into real projects much faster.",
    avatarUrl: "https://api.typeform.com/responses/files/50a5d466722d787da51d7d093c047b1606f69d5bd90efadd6642580aebcec518/IMG_3556.jpg",
    preferredAgents: ["cursor","copilot"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_aabisa2",
    name: "Syed Aabis Akhtar",
    school: "University of Illinois Urbana-Champaign",
    bio: "I've completely switched to Cursor since last year and I love Cursor tab the most. I use it not only as a coding tool but as a text editor as well when doing research, analysis, and experimentation.",
    avatarUrl: "https://api.typeform.com/responses/files/ac485afb9f14b2654e333d3c16a111b54a82da33450a83b6a5f5a997520b8e5b/Screenshot_2026_07_21_at_11.02.37_AM.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.25, gpt: 0.4, gemini: 0.35 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_nesas",
    name: "Nesa Shamdasani",
    school: "University of Michigan",
    bio: "Most people use Cursor to write code faster. I use it to think better.",
    avatarUrl: "https://api.typeform.com/responses/files/398b3d6c810f755d7afbbb2c9b55a8fcdf7df6bc5645c03394a0d9c6db73a14e/DSC00968.jpg",
    preferredAgents: ["claude_code","copilot"],
    modelMix: { opus: 0.15, gpt: 0.7, gemini: 0.15 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_vedantde",
    name: "Vedant Desai",
    school: "University of Michigan",
    bio: "I really leaned into Cursor because it helped me bring ideas to production-grade systems. I use it as a pair programmer across everything from LangGraph pipelines to Pydantic schemas.",
    avatarUrl: "https://api.typeform.com/responses/files/4c8a8193c9694978082e1eadb3038e1d0dd7773e1cfde9025bfefee823ca0f9f/Headshot_copy.jpeg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.4, gpt: 0.35, gemini: 0.25 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_bliu8",
    name: "Benjamin Liu",
    school: "University of Pennsylvania",
    bio: "I've been using Cursor for over a year now, and it has greatly helped me both learn and build quickly. As an IDE, it helps me understand syntax in context.",
    avatarUrl: "https://api.typeform.com/responses/files/6aa7f60f681c27fd89e0f92d8a8027285c22ef2b509b0abfa98238dfb58feb93/Liu_Benjamin_picture.JPG",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.45, gpt: 0.15, gemini: 0.4 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_mdong126",
    name: "Mingni Dong",
    school: "University of Pennsylvania",
    bio: "I love Cursor because it makes me braver in codebases I am unfamiliar with.",
    avatarUrl: "https://api.typeform.com/responses/files/d1dbcbcd5b8a3e1d7e69944906da7e9fb8ebb02366da080f0c6833e7a6e1fe1b/IMG_6066.heic",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.3, gpt: 0.5, gemini: 0.2 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_sahitid",
    name: "Sahiti Dasari",
    school: "University of Pennsylvania",
    bio: "I love Cursor because it collapses the gap between an idea and a working prototype.",
    avatarUrl: "https://api.typeform.com/responses/files/61ce7583a843a0a59c8b1681284766320a4b2a50a4e5d1a7c63f64a32a1dbf31/3V1A0137_edited.jpeg",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.55, gpt: 0.25, gemini: 0.2 },
    typicalTokenBurn: "high",
  },
  {
    clerkId: "seed_saahilb",
    name: "Saahil Borole",
    school: "University of Washington",
    bio: "I love Cursor because it lets me stay in the flow of building instead of context-switching between writing code and looking things up.",
    avatarUrl: "https://api.typeform.com/responses/files/0e09e03fb942fde9dac428934c2e7e8defd210152b9be7535aaaec44ac69160c/IMG_20260428_232214.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.35, gpt: 0.35, gemini: 0.3 },
    typicalTokenBurn: "extreme",
  },
  {
    clerkId: "seed_smehta6",
    name: "Sangini Mehta",
    school: "University of Washington",
    bio: "I love Cursor because of how beginner-friendly it is. I use it constantly for personal projects, the kind of passion projects that make my life easier or just scratch a random itch I have.",
    avatarUrl: "https://api.typeform.com/responses/files/53b169529cd4b525599a9563bc898fa53ecd905b737e717571d7ad298ad2e18e/IMG_2301.JPG",
    preferredAgents: ["claude_code"],
    modelMix: { opus: 0.2, gpt: 0.55, gemini: 0.25 },
    typicalTokenBurn: "medium",
  },
  {
    clerkId: "seed_filippo_fonseca",
    name: "Filippo Fonseca",
    school: "Yale",
    bio: "I have been using Cursor since my senior year of high school in 2023 (which feels like a small geological era ago! ).",
    avatarUrl: "https://api.typeform.com/responses/files/d5e4c7ace2072501b28aba9a86bf59b15add231498aaf98bcb4cd0dde7fd1ffd/pfp.png",
    preferredAgents: ["cursor","claude_code"],
    modelMix: { opus: 0.7, gpt: 0.2, gemini: 0.1 },
    typicalTokenBurn: "extreme",
  },
];

/**
 * Idempotent seed: clears prior seed_* users (+ their swipes), then inserts fixtures.
 * Run: `npx convex run seed:seedDemo`
 */
export const seedDemo = internalMutation({
  args: {},
  returns: v.object({
    usersInserted: v.number(),
    usersRemoved: v.number(),
    swipesRemoved: v.number(),
  }),
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").take(500);
    const seedUsers = allUsers.filter((u) => u.clerkId.startsWith("seed_"));

    let swipesRemoved = 0;
    for (const user of seedUsers) {
      const fromSwipes = await ctx.db
        .query("swipes")
        .withIndex("by_from", (q) => q.eq("fromUserId", user._id))
        .take(200);
      for (const swipe of fromSwipes) {
        await ctx.db.delete(swipe._id);
        swipesRemoved += 1;
      }

      for (const action of ["accept", "deny", "request_changes"] as const) {
        const toSwipes = await ctx.db
          .query("swipes")
          .withIndex("by_to_action", (q) =>
            q.eq("toUserId", user._id).eq("action", action),
          )
          .take(200);
        for (const swipe of toSwipes) {
          await ctx.db.delete(swipe._id);
          swipesRemoved += 1;
        }
      }

      await ctx.db.delete(user._id);
    }

    const now = Date.now();
    const insertedIds: Id<"users">[] = [];
    for (const seed of SEED_USERS) {
      const id = await ctx.db.insert("users", {
        clerkId: seed.clerkId,
        name: seed.name,
        school: seed.school,
        bio: seed.bio,
        avatarUrl: seed.avatarUrl,
        preferredAgents: seed.preferredAgents,
        modelMix: seed.modelMix,
        typicalTokenBurn: seed.typicalTokenBurn,
        hasFingerprint: true,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    // Embed seed profiles into the people RAG index for the matchmaker chatbot.
    await ctx.scheduler.runAfter(0, internal.peopleIndex.reindexAll, {});

    return {
      usersInserted: insertedIds.length,
      usersRemoved: seedUsers.length,
      swipesRemoved,
    };
  },
});
