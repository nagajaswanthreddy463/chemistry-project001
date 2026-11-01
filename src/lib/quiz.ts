export const QUESTIONS = [
  {
    q: "What is the full form of SMILES?",
    options: ["Simplified Molecular Input Line Entry System", "Standard Molecular Information Language Encoding System", "Simple Molecular Identification and Labeling System"],
    answer: 0,
    why: "SMILES = Simplified Molecular Input Line Entry System, a line notation for structures.",
  },
  { q: "Which SMILES represents toluene?", options: ["NC(N)=O", "Cc1ccccc1", "c1ccc2ccccc2c1"], answer: 1, why: "Cc1ccccc1: a methyl carbon attached to an aromatic ring. NC(N)=O is urea and c1ccc2ccccc2c1 is naphthalene." },
  { q: "In SMILES, parentheses are mainly used to indicate:", options: ["Atom colour", "Molecular weight", "Branches"], answer: 2, why: "Parentheses open a side branch off the main chain." },
  { q: "Which property is commonly associated with lipophilicity?", options: ["LogP", "TPSA", "HBD"], answer: 0, why: "LogP is the octanol/water partition coefficient — Ibuprofen (LogP ≈ 3.07) is far more lipophilic than Glucose (≈ −3.22)." },
  { q: "A triple bond contains how many π bonds?", options: ["1", "3", "2"], answer: 2, why: "One σ bond plus two π bonds." },
];

export function scoreQuiz(answers: (number | null)[]) {
  return QUESTIONS.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0);
}
