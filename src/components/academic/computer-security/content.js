import { parsePaper } from './papers.js';
import stats from './stats.json';

// Course outline and content loaders. Every Markdown file is loaded on
// demand as its own small chunk, so the course page itself stays light.
//
//   content/topics/<id>.md          topic notes: ideas, steps, worked examples
//   content/papers/<n>-<id>.md      a previous final exam paper with solutions
//
// Which papers asked about each topic is not written by hand: it comes from
// the "**Topics:**" line of every question, collected into stats.json by
// scripts/check-computer-security.mjs.

// `topics` is the one-line summary shown in the syllabus on the overview page.
export const TOPICS = [
  { id: '00', name: 'Introduction', topics: 'What computer security is, how the course and the exam are organised' },
  { id: '01', name: 'Security Basics', topics: 'CIA triad, attack categories, design principles, password strength' },
  { id: '02', name: 'Modular Arithmetic', topics: 'Modular inverse, Extended Euclid, Fermat, big powers' },
  { id: '03', name: 'Symmetric and Asymmetric Cryptography', topics: 'Secret key vs public key, where each is used' },
  { id: '04', name: 'RSA Algorithm', topics: 'Key generation, encryption, decryption, MITM on RSA' },
  { id: '05', name: 'Diffie-Hellman Key Exchange', topics: 'Shared secret key, message exchange, MITM attack' },
  { id: '06', name: 'Digital Signature and Certificate', topics: 'Signing, verifying, Certification Authority' },
  { id: '07', name: 'ARP Spoofing and MITM', topics: 'ARP, cache poisoning, ARP tables after attack, defence' },
  { id: '08', name: 'MAC Table Flooding', topics: 'Switch MAC table overflow, port security' },
  { id: '09', name: 'TCP Session Hijacking', topics: 'Sequence numbers, sniffing, off-path hijacking' },
  { id: '10', name: 'SYN Flooding and Smurf Attack', topics: 'Half-open connections, SYN cookies, ICMP amplification' },
  { id: '11', name: 'DDoS and Botnets', topics: 'DDoS targets and formats, botnets, honeypots' },
  { id: '12', name: 'Viruses and Anti-Virus', topics: 'Virus phases, propagation, concealment, detection' },
  { id: '13', name: 'Worms, Rootkits and Other Malware', topics: 'Worm model, rootkit, trojan, ransomware, zero-day' },
  { id: '14', name: 'Buffer Overflow', topics: 'Stack smashing, return address, stack canaries' },
  { id: '15', name: 'Web Attacks', topics: 'SQL injection, XSS, CSRF, click-jacking' },
  { id: '16', name: 'Firewalls', topics: 'Policies, blacklist vs whitelist, stateless vs stateful' },
];

const paperFiles = import.meta.glob('./content/papers/*.md', { query: '?raw', import: 'default' });
const topicFiles = import.meta.glob('./content/topics/*.md', { query: '?raw', import: 'default' });

/** Previous papers in exam order, e.g. { id: 'spring-2025', idx: 'P1', name: 'Spring 2025', file }. */
export const PAPERS = Object.keys(paperFiles)
  .sort()
  .map((file, i) => {
    const id = file.match(/\d+-([^/]+)\.md$/)[1];
    const name = id
      .split('-')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
    return { id, idx: `P${i + 1}`, name, file };
  });

/** Everything the reader can show, in reading order. */
export const ENTRIES = [
  ...TOPICS.map((t) => ({ ...t, idx: t.id, path: `topic/${t.id}`, kind: 'topic' })),
  ...PAPERS.map((p) => ({ ...p, path: `paper/${p.id}`, kind: 'paper' })),
];

/** Questions from the supplied papers on a topic: [{ paper, name, number, marks, id }]. */
export const askedIn = (topicId) => stats.asked[topicId] || [];

/** Trimester names in which a topic was asked, in paper order. */
export function askedTrimesters(topicId) {
  const seen = askedIn(topicId).map((q) => q.name);
  return PAPERS.map((p) => p.name).filter((n) => seen.includes(n));
}

export async function loadTopic(id) {
  const load = topicFiles[`./content/topics/${id}.md`];
  if (!load) throw new Error(`Unknown topic ${id}`);
  return { lesson: await load() };
}

export async function loadPaper(id) {
  const paper = PAPERS.find((p) => p.id === id);
  if (!paper) throw new Error(`Unknown paper ${id}`);
  return parsePaper(await paperFiles[paper.file](), paper.id);
}

export { stats };
