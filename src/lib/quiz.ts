export const QUESTIONS = [
  {
    q: "What is the full form of SMILES?",
    options: ["Simplified Molecular Input Line Entry System", "Standard Molecular Information Language Encoding System", "Simple Molecular Identification and Labeling System"],
    answer: 0,
    why: "SMILES = Simplified Molecular Input Line Entry System, a line notation for structures.",
  },
  { q: "Which SMILES represents ethanol?", options: ["c1ccccc1", "CCO", "CC(=O)O"], answer: 1, why: "CCO: two carbons followed by an oxygen (–OH)." },
  { q: "In SMILES, parentheses are mainly used to indicate:", options: ["Atom colour", "Molecular weight", "Branches"], answer: 2, why: "Parentheses open a side branch off the main chain." },
  { q: "Which property is commonly associated with lipophilicity?", options: ["LogP", "TPSA", "HBD"], answer: 0, why: "LogP is the octanol/water partition coefficient." },
  { q: "A triple bond contains how many π bonds?", options: ["1", "3", "2"], answer: 2, why: "One σ bond plus two π bonds." },
];

export function scoreQuiz(answers: (number | null)[]) {
  return QUESTIONS.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
}
