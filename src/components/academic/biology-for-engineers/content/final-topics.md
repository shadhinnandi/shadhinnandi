# Main Final Topics

A revision summary of the five final chapters, built from the lecture slides. The full exam answers are on the Solutions page.

## 1. Biotechnology

**Biotechnology** uses living cells and cellular materials to make pharmaceutical, diagnostic, agricultural, environmental and other products (Lecture 6, slide 3).

**PCR** makes millions to billions of copies of a chosen DNA segment. Components: template DNA, two **primers**, **Taq polymerase** (heat-stable, from *Thermus aquaticus*), the four **nucleotides** and a **buffer**. Each cycle has three steps:

| Step | Temperature | What happens |
|---|---|---|
| Denaturation | about 94–95 °C | Hydrogen bonds break; the double strand separates |
| Annealing | about 50–60 °C | Primers bind to their complementary sequences |
| Extension | 72 °C | Taq polymerase adds nucleotides 5' → 3' |

The number of copies doubles every cycle (exponential growth).

::fig bt-pcr-temperature-graph | Temperature over time in one PCR cycle | Lecture 6, slide 22

**Gel electrophoresis** separates DNA by size: negatively charged DNA moves through agarose towards the positive electrode, and small fragments move faster. **DNA fingerprinting (RFLP):** extract DNA, cut it with restriction enzymes, separate the fragments on a gel, and reveal the pattern with a labelled probe.

**Recombinant DNA technology:** isolate the gene and the plasmid, cut both with the same restriction enzyme (sticky ends), join them with DNA ligase, transform bacteria, select with a marker (e.g. ampicillin resistance) and grow clones. Bacteria are made **competent** with calcium ions and heat shock at 42 °C.

::fig bt-rdna-steps | The six steps of cloning a human gene in a plasmid | Lecture 6, slide 31

## 2. Immunity

- **Innate immunity:** present at birth, the first line of defence; rapid, non-specific, with no memory. Skin and mucosa, phagocytes, CRP and complement.
- **Adaptive immunity:** develops after exposure to infection or vaccination; specific to antigens and has memory. B cells, T cells and antibodies.
- **T cells:** cytotoxic (kill targets), helper (stimulate B and T cells), regulatory (suppress responses), memory (remember pathogens).
- **NK cells:** innate lymphocytes that kill virus-infected and cancer cells with **perforin and granzymes**, and secrete IFN-γ and TNF-α.
- **Antibodies:** proteins made by plasma cells; five classes, **IgG, IgM, IgA, IgD and IgE**.
- **Vaccines** contain a harmless antigen (or its mRNA/DNA blueprint) so the body makes antibodies and **memory cells**; the second exposure gives a faster, stronger **secondary response**.

::fig im-immune-response-curve | Primary and secondary immune responses | Lecture 7, slide 36

## 3. Brain-computer interface

- The **neuron** is the structural and functional unit of the nervous system: cell body, a single axon and many dendrites.
- **Sensory (afferent)** neurons carry impulses from receptors to the CNS; **motor (efferent)** neurons carry them from the CNS to muscles and glands; **interneurons** connect neurons within the CNS.
- **Action potential:** a stimulus depolarises the membrane to threshold; voltage-gated Na⁺ channels open and the potential rises from −70 mV to about +30 mV; Na⁺ channels inactivate and K⁺ channels open, repolarising the membrane (with a brief hyperpolarisation).
- **Synapse:** the action potential opens Ca²⁺ channels in the presynaptic terminal; Ca²⁺ makes vesicles release neurotransmitter by exocytosis; the transmitter binds receptors and opens channels in the postsynaptic membrane, turning the chemical signal back into an electrical one.
- A **BCI** reads brain activity (often by EEG), decodes the user's intent with a computer, and controls a device: three parts, the sensor, the computer and the application.
- An **ANN** has input, hidden and output layers of artificial neurons and learns by adjusting its weights during training.

::fig bci-synapse-sequence | The sequence of events at a chemical synapse | Lecture 8, slide 18

## 4. Biological databases

- A **database** is a computerised archive that stores and organises data so it can be searched and retrieved.
- **Primary** databases hold original raw data (GenBank, PDB); **secondary** databases hold processed, curated data (Swiss-Prot, PIR); **specialised** databases serve one organism or data type (FlyBase, the HIV sequence database).
- **BLAST** (NCBI) finds sequences similar to a query. Types: blastn, blastp, blastx, tblastn and tblastx. Outcomes: max score, total score, **query coverage**, **identity** and **E-value**.
- **UniProt** covers protein sequence and function; **PDB** covers experimentally solved 3D structures.
- A **phylogenetic tree** shows evolutionary relationships. A **cladogram** shows branching only, a **phylogram** has branch lengths showing genetic change, and an **ultrametric tree** is scaled to time.

::fig db-tree-types | Cladogram, phylogram and ultrametric tree | Lecture 9, slide 37

## 5. Systems and synthetic biology

- **Systems biology** studies living systems as integrated wholes, focusing on the interactions between components, using computational models and large datasets.
- **Networks:** nodes are components (genes, proteins, metabolites); edges are interactions. Types: metabolic, gene regulatory and signalling networks.
- **Gene regulation:** a **repressor** binds the operator and blocks RNA polymerase (no transcription); an **activator** binds its site and helps the transcription machinery assemble (transcription on).
- **Feedback loops:** the output of a process influences its own activity. Positive feedback amplifies (childbirth and oxytocin); negative feedback stabilises (blood glucose and insulin, body temperature).
- **Synthetic biology** designs new biological parts, devices and systems. Its core engineering loop is the **DBTL cycle** (Design, Build, Test, Learn). Its tools include DNA synthesis, **BioBricks** (standard DNA parts) and **CRISPR-Cas9** gene editing.

::fig sb-activators-repressors | Repressors block transcription; activators help start it | Lecture 10, slide 12
