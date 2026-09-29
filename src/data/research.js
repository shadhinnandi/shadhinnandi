// Research content. Wording is deliberately calibrated: "ongoing" work is not
// described as finished, "familiar with" is not described as expertise, and
// nothing here is a publication. Add publications only when they exist.
//
// Two levels: `summary` is written for any reader; `details` and `methods`
// carry the technical terms for reviewers who want them.

export const research = {
  title: 'Artificial Intelligence & Computational Biology',
  summary:
    'Exploring machine learning and deep learning methods for biological and computational problems, with interests spanning regulatory genomics, enhancer–promoter interactions, bioinformatics, protein representation learning, computer vision and human-centered AI.',
};

// Hands-on research in progress.
export const currentResearch = [
  {
    id: 'epi',
    area: 'Regulatory genomics',
    title: 'Predicting enhancer–promoter interactions from DNA sequence',
    status: 'Ongoing',
    plain:
      'Enhancers are stretches of DNA that switch genes on from a distance. Knowing which enhancer acts on which gene’s promoter helps explain how genes are regulated. I am building and comparing deep-learning models that predict these interactions directly from genomic sequence.',
    methods: [
      'CNN and BiLSTM sequence models',
      'Transformer-based models',
      'KAN-based (Kolmogorov–Arnold network) variants',
      'Benchmarking models against each other',
      'Interpretability of what the models learn',
    ],
    note: 'Work in progress. No results or publication are claimed here.',
  },
];

// involvement: 'Ongoing research' | 'In progress' | 'Familiar with' | 'Interest'
export const researchAreas = [
  {
    area: 'Regulatory genomics',
    summary: 'Enhancer–promoter interaction prediction and genomic sequence modeling.',
    involvement: 'Ongoing research',
    details: ['Enhancer–promoter interaction (EPI)', 'Deep learning for genomic sequences', 'Model benchmarking', 'Interpretability'],
  },
  {
    area: 'Bioinformatics',
    summary: 'Gene expression, multi-omics and computational analysis of biological data.',
    involvement: 'Familiar with',
    details: ['Differential expression (DESeq2)', 'Gene set enrichment (GSEA)', 'Co-expression networks (WGCNA)', 'eRNA analysis', 'Multi-omics and regulatory networks'],
  },
  {
    area: 'Protein AI',
    summary: 'Protein representation learning, structural modeling and graph-based approaches.',
    involvement: 'Familiar with',
    details: ['Protein language models (ESM-2)', 'Graph neural networks', 'Structure confidence scores (pLDDT, PAE)', 'Disordered-region (IDR) ensembles', 'Mutation and property prediction'],
  },
  {
    area: 'Computer vision',
    summary: 'Deep learning and object detection, including YOLO-based applications.',
    involvement: 'In progress',
    details: ['YOLO-based object detection', 'Trash and waste detection (current work)'],
  },
  {
    area: 'Human-centered AI',
    summary: 'HCI and generative-AI applications focused on how people interact with intelligent systems.',
    involvement: 'Interest',
    details: ['Human-computer interaction', 'Generative AI applications', 'User-centered AI systems'],
  },
];
