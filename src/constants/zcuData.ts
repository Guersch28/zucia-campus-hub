export const zcuData = {
  motto: "Veritas Vos Liberabit (The Truth Will Set You Free)",
  location: "Mpanshya Road, Lusaka, Zambia",
  contacts: {
    phone: "+260 211 123456",
    email: "info@zcu.ac.zm",
  },
  admissions:
    "Apply online at www.zcu.ac.zm. Requirements: Grade 12 certificate with 5 credits including English.",
  fees: "Undergraduate K18,500 per semester. Postgraduate K22,000 per semester.",
  programs: [
    "Bachelor of Information Technology",
    "Bachelor of Business Administration",
    "Bachelor of Education",
    "Bachelor of Laws LLB",
    "Bachelor of Nursing Science",
  ],
  rector: "Rev. Fr. Dr. Rector Name",
  vision:
    "To be a leading Catholic university in Africa promoting integral human development.",
  mission:
    "To provide quality education rooted in Catholic values, critical thinking, and service to humanity.",
  facilities: [
    "Main Library",
    "Computer Laboratory",
    "Chapel",
    "Cafeteria",
    "Sports Field",
    "Student Common Room",
  ],
  library_hours: "Monday to Friday 8am to 8pm, Saturday 9am to 5pm",
  academic_calendar:
    "Semester 1 starts February, Semester 2 starts August, Graduation December",
  keywords: [
    "admissions","apply","fees","cost","tuition","location","address","contact",
    "phone","email","programs","courses","motto","vision","mission","rector",
    "founded","facilities","library","registration","semester","calendar",
    "scholarship","accommodation",
  ],
};

export function matchZcuKeyword(message: string): string | null {
  const lower = message.toLowerCase();
  const matched = zcuData.keywords.filter((kw) => lower.includes(kw));
  if (matched.length === 0) return null;

  // Priority matching
  if (matched.some((k) => ["admissions", "apply"].includes(k)))
    return `📋 **Admissions**\n${zcuData.admissions}`;
  if (matched.some((k) => ["fees", "cost", "tuition"].includes(k)))
    return `💰 **Fees**\n${zcuData.fees}`;
  if (matched.some((k) => ["location", "address"].includes(k)))
    return `📍 **Location**\n${zcuData.location}`;
  if (matched.some((k) => ["contact", "phone", "email"].includes(k)))
    return `📞 **Contact Us**\nPhone: ${zcuData.contacts.phone}\nEmail: ${zcuData.contacts.email}\nAddress: ${zcuData.location}`;
  if (matched.some((k) => ["programs", "courses"].includes(k)))
    return `🎓 **Programs Offered**\n${zcuData.programs.map((p) => `• ${p}`).join("\n")}`;
  if (matched.includes("motto"))
    return `🏛️ **Motto**\n${zcuData.motto}`;
  if (matched.includes("vision"))
    return `🌟 **Vision**\n${zcuData.vision}`;
  if (matched.includes("mission"))
    return `🎯 **Mission**\n${zcuData.mission}`;
  if (matched.includes("rector"))
    return `👤 **Rector**\n${zcuData.rector}`;
  if (matched.includes("facilities"))
    return `🏫 **Facilities**\n${zcuData.facilities.map((f) => `• ${f}`).join("\n")}`;
  if (matched.includes("library"))
    return `📚 **Library Hours**\n${zcuData.library_hours}`;
  if (matched.some((k) => ["semester", "calendar"].includes(k)))
    return `📅 **Academic Calendar**\n${zcuData.academic_calendar}`;
  if (matched.includes("scholarship"))
    return `💵 **Scholarships**\nZCU offers merit-based scholarships and bursaries. Contact the admissions office for current opportunities.`;
  if (matched.includes("accommodation"))
    return `🏠 **Accommodation**\nZCU provides limited on-campus accommodation. Students are advised to apply early as spaces are limited.`;
  if (matched.includes("registration"))
    return `📝 **Registration**\nStudent registration is done online at portal.zcu.ac.zm`;
  if (matched.includes("founded"))
    return `🏛️ **Founded**\nZambia Catholic University was founded in 2022.`;

  return null;
}

// Mock data for materials
export interface CourseMaterial {
  id: string;
  filename: string;
  subject: string;
  year: number;
  semester: number;
  description: string;
  upload_date: string;
  view_count: number;
}

export const mockMaterials: CourseMaterial[] = [
  { id: "1", filename: "intro_to_programming.pdf", subject: "Introduction to Programming", year: 1, semester: 1, description: "Covers Python basics, variables, loops, and functions.", upload_date: "2025-01-15", view_count: 42 },
  { id: "2", filename: "data_structures.pdf", subject: "Data Structures & Algorithms", year: 2, semester: 1, description: "Arrays, linked lists, trees, sorting algorithms.", upload_date: "2025-02-01", view_count: 31 },
  { id: "3", filename: "database_systems.pdf", subject: "Database Systems", year: 2, semester: 2, description: "SQL, normalization, ER diagrams, and transaction management.", upload_date: "2025-02-10", view_count: 28 },
  { id: "4", filename: "web_development.pdf", subject: "Web Development", year: 3, semester: 1, description: "HTML, CSS, JavaScript, React, and REST APIs.", upload_date: "2025-03-05", view_count: 55 },
  { id: "5", filename: "artificial_intelligence.pdf", subject: "Artificial Intelligence", year: 4, semester: 1, description: "Machine learning, neural networks, NLP fundamentals.", upload_date: "2025-03-12", view_count: 67 },
];
