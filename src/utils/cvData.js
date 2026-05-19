export const DEFAULT_CV = {
  name: 'EYAL BARMAIMON',
  contact: 'eyal.barmaimon@gmail.com | +972-54-3206196 | linkedin.com/in/eyal-barmaimon-108a46',
  profile: `Experienced Program Manager and Engineering Leader with 15+ years driving complex electromechanical product development from concept through mass production for global clients in regulated environments. Proven expertise in matrixed management of multidisciplinary teams (40+ engineers), multi-year budget and schedule ownership, international customer and supplier engagement, and business development. Strong systems engineering background with hands-on experience in field trials, V&V, cleanroom manufacturing, and operational excellence. Early adopter of generative AI tools to accelerate engineering workflows, documentation, and decision-making. B.Sc. Mechanical Engineering, M.Sc. Systems Engineering, IAF Air Traffic Controller.`,
  competencies: `Program Management: Multi-year budgets & schedules, Matrix management 40+ people, Agile/Waterfall/NPI
Customer & BD: Global customer engagement (Pfizer, Medimmune, Terumo), Proposal writing & negotiation, IP strategy 40+ patents
Engineering: Electromechanical systems, DFM/DFA, FMEA, V&V, Cleanroom manufacturing, Scale-up & supply chain
AI & Digital: Generative AI workflows (Claude, ChatGPT, Gemini), prompt engineering, AI-assisted technical writing & decision support, AI tool integration in engineering processes
Tools: SolidWorks (PDM), Creo, AutoCAD, MATLAB, Windchill, Polarion, CMM (Mitutoyo/DEA), Jira, MS Project`,
  experience: [
    {
      company: 'Tingo Medical',
      period: '2021–Present',
      title: 'Engineering Manager (2021–2022) | VP of Engineering (2022–Present)',
      bullets: [
        'Led matrix management of 40+ global engineers to deliver milestones on time and budget.',
        'Owned multi-year budgets and schedules from concept through cleanroom manufacturing scale-up.',
        'Established cleanroom manufacturing processes and supplier partnerships for high-precision systems.',
        'Managed international customer interfaces; supported BD and proposal writing for new programs.',
        'Coordinated field trials and clinical/preclinical studies across development and validation teams.',
        'Drove IP strategy: 25+ patents, international conference presentations, technology partnerships.',
        'Applied Agile PM to accelerate cycles and improve cross-team communication.',
        'Achieved FDA 510(k) clearance; led full DHF regulatory documentation.',
      ],
    },
    {
      company: 'Itamar Medical',
      period: '2020–2021',
      title: 'Project & Mechanical Manager',
      bullets: [
        'Managed program execution, mechanical design, and system-level V&V for diagnostic medical devices.',
        'Owned budgets, schedules; applied Design Control, CAPA, MRB processes.',
        'Coordinated with QA, RA, and operations teams.',
      ],
    },
    {
      company: 'Flex',
      period: '2013–2020',
      title: 'Project Manager & Systems Engineer | Mechanical Development Staff Engineer',
      bullets: [
        'Managed 40+ personnel in matrix structure across internal teams, subcontractors, global suppliers.',
        'Led international customer engagements: Pfizer, Medimmune, Terumo; supported BD and proposals.',
        'Led NPI end-to-end: prototyping to manufacturing scale-up; DFM/DFA for yield improvement.',
        'Directed IP strategy: 15+ patents; presented at international conferences.',
        'Risk management through FMEA, quality system oversight, proactive supplier management.',
      ],
    },
    {
      company: 'Color-Chip',
      period: '2011–2013',
      title: 'R&D Mechanical Engineer',
      bullets: [
        'Designed high-precision optomechanical modules using photolithography (sub-micron precision).',
        'Led feasibility studies; bridged R&D concepts to production-ready solutions.',
      ],
    },
    {
      company: 'Philips Healthcare',
      period: '2006–2011',
      title: 'Process & R&D Mechanical Engineer',
      bullets: [
        'Engineered high-precision CT imaging components in controlled cleanroom environments.',
        'Root-cause analysis, reliability engineering; designed CMM-verified assembly jigs (Mitutoyo, DEA).',
        'Cross-functional global collaboration; led scale-up from prototype to mass production.',
      ],
    },
  ],
  education: `M.Sc. Systems Engineering, Afeka College of Engineering (2010–2012)
B.Sc. Mechanical Engineering, Braude Academic College (2004–2007)
Air Traffic Controller, Israeli Air Force (1997–2000)`,
  tools: `SolidWorks (PDM), Creo (PTC), AutoCAD, MATLAB, Windchill (PLM), Polarion (ALM), Priority ERP, Microsoft Project, Jira/Confluence, CMM Programming (Mitutoyo/DEA), Microsoft Office Suite, Claude AI, ChatGPT, GitHub Copilot, Cursor`,
  languages: `Hebrew – Native | English – Full professional proficiency | Spanish – Basic | Available for international travel`,
};

export function cvToText(cv) {
  const expText = cv.experience
    .map(
      (e) =>
        `${e.company} | ${e.period}\n${e.title}\n${e.bullets.map((b) => `- ${b}`).join('\n')}`
    )
    .join('\n\n');

  return `${cv.name}
${cv.contact}

PROFESSIONAL PROFILE
${cv.profile}

CORE COMPETENCIES
${cv.competencies}

EXPERIENCE

${expText}

EDUCATION & MILITARY
${cv.education}

TOOLS
${cv.tools}

LANGUAGES
${cv.languages}`;
}
