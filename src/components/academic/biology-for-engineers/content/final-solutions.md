# Final Solutions

Answers matched to the final suggestion, chapter by chapter. Open each answer after trying it yourself. The label under each question says where the answer comes from:

- **Supplied solution:** from the supplied final answer set, checked against the lecture slides.
- **Corrected:** the supplied answer had a factual slip or missed part of the question; the *Review* label says what changed.
- **Prepared from the slides:** no answer was supplied, so it was written from the lecture slides.

## 1. Biotechnology

### What is the Polymerase Chain Reaction (PCR)?
**Suggestion:** PCR
**Source:** Supplied solution (Biotechnology 1)

**Polymerase Chain Reaction (PCR)** is a laboratory technique for rapidly producing (amplifying) millions to billions of copies of a specific segment of DNA, which can then be studied in greater detail. PCR is very important in many fields today. In medicine it is used to detect genetic mutations and to detect HIV, malaria and other infections in clinical samples. It is also used in gene cloning and forensic science.

::fig bt-pcr-overview | PCR doubles the number of copies with every cycle | Lecture 6, slide 16

### What are the components of PCR?
**Suggestion:** PCR
**Source:** Corrected: Biotechnology 2
**Review:** The supplied answer (copied from the slide) said potassium and magnesium are "essential for the DNA denaturation and renaturation steps". In fact Mg²⁺ is the cofactor Taq polymerase needs to work, and K⁺ (as KCl) helps primers bind to the template. Denaturation is caused by heat.

- **Template DNA:** the DNA containing the segment to be copied.
- **Primers:** short, chemically synthesised, single-stranded pieces of DNA that are complementary to the ends of the DNA fragment of interest.
- **DNA polymerase:** the enzyme that elongates the primers by adding nucleotides, using the DNA fragment as a template. It must withstand the high temperatures of PCR, so a thermostable polymerase isolated from the bacterium *Thermus aquaticus*, called **Taq polymerase**, is used.
- **Nucleotides (dNTPs):** the single bases A, T, C and G, the building blocks of the new DNA.
- **Buffer system:** keeps the right pH and supplies **Mg²⁺**, the essential cofactor for Taq polymerase, and **K⁺**, which helps primer annealing. It also contains factors important for enzyme activity, fidelity and stability.

::fig bt-pcr-master-mix | The PCR master mix and Taq polymerase | Lecture 6, slide 17

### Describe the steps of PCR, with their temperatures and functions.
**Suggestion:** PCR (Steps, Diagram)
**Source:** Supplied solution (Biotechnology 3)

In PCR, DNA polymerase synthesises a new DNA strand complementary to the template by adding nucleotides to the primers. The components are mixed in PCR tubes and run in a **thermal cycler**, which repeats three steps:

1. **Denaturation (about 94–95 °C):** the high temperature breaks the weak hydrogen bonds between the two DNA strands, separating the double-stranded template into single strands.
2. **Annealing (about 54–60 °C):** the mixture is cooled so the primers bind to their complementary sequences on the template. (The slide diagram shows 50–56 °C; the exact temperature depends on the primers.)
3. **Elongation/Extension (72 °C):** DNA polymerase adds nucleotides to the primers and extends them in the 5′ → 3′ direction.

One cycle of denaturation, annealing and elongation turns one double-stranded template into two. The cycles repeat (usually 25–35 times), so the number of copies increases **exponentially** (2ⁿ after n cycles).

::fig bt-pcr-steps | Steps in a PCR reaction: denaturing, annealing and extending | Lecture 6, slide 18

::fig bt-pcr-cycle-detail | One PCR cycle in detail | Lecture 6, slide 23

### Draw and explain the PCR temperature graph.
**Suggestion:** PCR (Graph)
**Source:** Prepared from the slides (Lecture 6, slide 22) and the figure in the supplied answer

The graph plots **temperature (y-axis)** against **time (x-axis)** for one PCR cycle:

1. It starts with the double-stranded **DNA template** at a low temperature.
2. The temperature rises sharply to about **94–95 °C** and holds: **denaturation** (the strands separate).
3. It drops to about **54–60 °C**: **primer annealing**.
4. It rises to **72 °C**: **extension** by Taq polymerase.
5. The pattern then repeats for every cycle (the circular arrow), so the graph is a repeated "step" shape.

A second graph often drawn is **number of DNA copies against cycle number**: it rises exponentially (doubling every cycle) and then levels off when primers and nucleotides run out.

::fig fa-pcr-graph | Temperature against time in one PCR cycle | Supplied final solutions

### What is gel electrophoresis? Explain its principle.
**Suggestion:** Gel Electrophoresis
**Source:** Supplied solution (Biotechnology 4)

**Gel electrophoresis** separates DNA, RNA or proteins **by size**.

1. The DNA to be separated is loaded into the wells of an **agarose gel** (agarose is a natural polymer from seaweed).
2. When an electric current is applied, the **negatively charged DNA moves towards the positive electrode**.
3. The gel is hard to move through, so fragments travel at different speeds: **larger fragments move slower**, while smaller fragments fit through the pores easily and move faster.
4. The separated DNA is not visible under normal light. It is **stained with ethidium bromide** and viewed under **UV light**, and the band sizes are read against a **DNA marker (ladder)**.
5. The desired fragment can then be cut out of the gel, extracted and ligated into a cloning vector.

**Uses:** checking PCR products and restriction digests, DNA fingerprinting in forensics and paternity tests.

::fig bt-gel-electrophoresis | Gel electrophoresis apparatus and DNA bands | Lecture 6, slide 26

### Write the process of RFLP (DNA fingerprinting). How is it used in forensic science?
**Suggestion:** DNA fingerprinting
**Source:** Supplied solution (Biotechnology 5), forensic use added from Lecture 6, slides 28–29

**Restriction Fragment Length Polymorphism (RFLP)** is a DNA fingerprinting technique:

1. **DNA extraction:** DNA is extracted from a sample such as blood or saliva, and purified.
2. **DNA fragmentation:** the purified DNA is cut into fragments with **restriction endonucleases**.
3. **Gel electrophoresis:** the fragments are separated by size.
4. **Visualisation:** a labelled DNA sequence called an **RFLP probe** reveals a pattern of bands that is unique to each person (except identical twins).

**Forensic use:** DNA from the crime scene is compared with DNA from suspects. The suspect whose band pattern matches the crime-scene sample exactly is linked to the crime (in the slide, suspected criminal 3).

::fig fa-dna-fingerprint-gel | Comparing crime-scene DNA with suspects; suspect 3 matches | Supplied final solutions

### What is recombinant DNA technology? Write its process.
**Suggestion:** rDNA Technology (Steps, Diagram)
**Source:** Supplied solution (Biotechnology 6)

**Recombinant DNA (rDNA)** is DNA made by combining genetic material from at least two different species. Cloning a gene involves these steps:

1. **Isolate DNA:** extract the plasmid DNA from *E. coli* and the human DNA containing the gene of interest (GOI).
2. **Cut both DNAs** with the **same restriction enzyme**, creating matching **sticky ends**.
3. **Join the fragments:** mix the cut plasmid and the cut human DNA so their sticky ends base-pair.
4. **Seal the DNA:** **DNA ligase** forms covalent bonds, creating the recombinant plasmid.
5. **Transform bacteria:** introduce the recombinant plasmid into *E. coli* by transformation.
6. **Clone the bacteria:** grow the transformed cells to produce many identical bacteria, each carrying copies of the human gene.

**Example (producing a protein such as insulin or EPO):** after cloning, the bacteria express the human gene; they are grown in large **bioreactors**, and the protein is purified by **downstream processing** before use as a medicine.

**Selecting transformed cells:** if the plasmid carries an **ampicillin-resistance gene** (a selectable marker), only transformed cells grow on ampicillin plates; untransformed cells die.

::fig fa-rdna-process | Cloning a gene: plasmid and human DNA, sticky ends, recombinant plasmid and bacterial clones | Supplied final solutions

::fig bt-rdna-steps | Recombinant DNA technology: the six steps | Lecture 6, slide 31

::fig bt-transformation | Transformation and selection with the ampicillin marker | Lecture 6, slide 37

### What is a host cell (competent cell, third-party producer)?
**Suggestion:** rDNA Technology
**Source:** Supplied solution (Biotechnology 7)

A **host cell** is a living cell that can propagate a vector carrying a desired gene. The recombinant DNA is introduced into it for replication and expression of the gene product. The host cell must:

- let the recombinant DNA enter easily,
- not degrade the rDNA as foreign DNA, and
- provide the enzymes and proteins the vector needs to replicate.

Bacteria such as *E. coli* are commonly used because they grow rapidly, are easy to manipulate and have well-understood genetics.

::fig bt-host-cell | Host cells made competent by heat shock or electroporation | Lecture 6, slide 38

### What do enzymes do in DNA isolation in rDNA technology?
**Suggestion:** rDNA Technology
**Source:** Supplied solution (Biotechnology 8)

- **Lysozyme:** breaks the bacterial cell wall.
- **Cellulase:** breaks the plant cell wall.
- **Chitinase:** breaks the fungal cell wall.
- **Ribonuclease:** removes RNA.
- **Protease:** removes proteins, such as the histones bound to DNA.

The purified DNA is then precipitated with chilled ethanol.

::fig bt-dna-isolation | DNA isolation | Lecture 6, slide 32

### What are restriction enzymes? Write their mode of action.
**Suggestion:** rDNA Technology
**Source:** Supplied solution (Biotechnology 9)

**Restriction enzymes** (restriction endonucleases) are "molecular scissors" that cut DNA at specific locations. They belong to the **nucleases**, which are of two kinds:

- **Exonucleases** remove nucleotides from the ends of DNA.
- **Endonucleases** cut at specific positions inside the DNA.

**Mode of action:**

1. Inspect the length of DNA for the specific **recognition sequence**.
2. Bind the DNA at that sequence.
3. Cut both strands at specific points in the sugar-phosphate backbone.
4. The recognition sequences are **palindromic** (they read the same 5′ → 3′ on both strands). Example: **EcoRI** cuts GAATTC between G and A, leaving sticky ends.

::fig fa-ecori-site | The EcoRI restriction site and the sticky ends it leaves | Supplied final solutions

### What is a cloning vector? What features does it need?
**Suggestion:** rDNA Technology
**Source:** Supplied solution (Biotechnology 10)

A **cloning vector** is a DNA molecule used to carry a desired gene into a host organism. **Plasmids** are common vectors because they replicate independently inside bacterial cells. A vector needs:

1. **Origin of replication (ori):** where replication starts; it lets the vector and the inserted DNA replicate in the host and controls the copy number.
2. **Selectable marker:** identifies host cells that contain the vector, usually an antibiotic-resistance gene (ampicillin, kanamycin).
3. **Cloning site:** a restriction-enzyme recognition site where the foreign DNA is inserted. Ideally the vector has unique sites, to make insertion easier and more specific.

::fig bt-cloning-vector | A plasmid cloning vector | Lecture 6, slide 47

### What is a selectable marker?
**Suggestion:** rDNA Technology
**Source:** Supplied solution (Biotechnology 11)

A **selectable marker** is a gene that helps identify transformed cells from non-transformed cells.

Example: an **ampicillin-resistance gene**. When recombinant DNA carrying this gene enters *E. coli*, the bacteria become resistant to ampicillin and survive on ampicillin-containing medium, while non-transformed cells die.

::fig bt-transformation | Selecting transformed cells with the ampicillin-resistance marker | Lecture 6, slide 37

### Write the process of bacterial competency.
**Suggestion:** Process of Bacterial competency
**Source:** Supplied solution (Biotechnology 12)

Host bacterial cells must take up the recombinant DNA, but DNA is **hydrophilic** and cannot pass through the bacterial membrane easily. The cells are therefore made **competent**:

1. **Divalent cations:** treating cells with a specific concentration of calcium ions (CaCl₂) makes it easier for DNA to enter through pores in the cell wall.
2. **Heat shock:** the cells are incubated with the recombinant DNA **on ice**, given a **heat shock at 42 °C**, and put back **on ice**, which lets them take up the DNA.
3. **Microinjection:** recombinant DNA is injected directly into the nucleus of an animal cell.
4. **Biolistics (gene gun):** plant cells are bombarded with high-velocity microparticles of gold or tungsten coated with DNA.

(Electroporation, a brief electric pulse, is another method shown on the slide.)

::fig bt-competent-host | Tools of biotechnology: the competent host | Lecture 6, slide 51

## 2. Immunity

### Define and differentiate innate and adaptive immunity.
**Suggestion:** Innate Vs. Adaptive Immunity
**Source:** Supplied solution (Immune System 2)

- **Innate immune system:** the first line of defence against pathogens, giving a rapid response to infection. It is present at birth and lasts a person's entire life.
- **Adaptive immune system:** immunity that develops when the immune system responds to a foreign substance or microorganism, for example after an infection or vaccination.

| Feature | Innate immunity | Adaptive immunity |
|---|---|---|
| Development | Present at birth | Develops after exposure to infection or vaccination |
| Response | Rapid, first response | Develops after immune activation (slower) |
| Specificity | Non-specific | Specific to particular antigens |
| Memory | No immunological memory | Has memory of previous antigens |
| Main components | Skin, mucosa, phagocytic cells, acute phase proteins (CRP), complement system | B cells, T cells, immunoglobulins (antibodies) |

**Is immunity present at birth?** Yes: innate immunity is almost fully developed at birth, and the baby also has antibodies received from the mother. Adaptive immunity develops later, as the child meets infections and vaccines.

::fig im-innate-vs-adaptive | Innate versus adaptive immunity | Lecture 7, slide 7

::fig im-human-immune-system | Components of the innate and adaptive immune systems | Lecture 7, slide 6

### How do NK cells work, and what distinguishes them from other white blood cells?
**Suggestion:** NK cell function
**Source:** Corrected: Immune System 4
**Review:** The supplied answer explained how NK cells kill but not what distinguishes them; that part was added

**Natural killer (NK) cells** are white blood cells that destroy infected cells and cancer cells in the body.

**How they work:**

1. **Activating signals:** cancer cells and infected cells release chemical signals that cause NK cells to attack.
2. **Killing:** activated NK cells release **perforin** and **granzymes**. Perforin makes a hole in the target cell's membrane, through which granzymes enter and kill the cell.
3. **Activating other immune cells:** NK cells secrete cytokines such as **IFN-γ and TNF-α**, which act on macrophages and dendritic cells to strengthen the immune response.

**What distinguishes them:**

- Instead of attacking foreign invaders, NK cells attack the body's **own cells** that are infected or cancerous, often before tumours form.
- They are lymphocytes of the **innate** system: they kill **without prior exposure** to the antigen and do not need antigen-specific receptors or activation, unlike B and T cells.
- They kill directly, unlike B cells, which act through antibodies.

::fig im-nk-cell-activation | NK cells kill target cells and activate other immune cells | Lecture 7, slide 20

### Explain how vaccines help the immune system defend against pathogens.
**Suggestion:** Vaccination
**Source:** Supplied solution (Immune System 3)

1. Vaccines contain **weakened or inactive parts of a particular organism (antigen)** that trigger an immune response in the body.
2. Newer vaccines contain the **blueprint** for producing antigens (mRNA or DNA) rather than the antigen itself.
3. Either way, the weakened version does not cause the disease, but it prompts the immune system to respond as it would on its first reaction to the real pathogen.
4. Some vaccines need **multiple doses**, weeks or months apart, to produce long-lived antibodies and **memory cells**.
5. The body is thereby trained to fight the specific organism and builds a memory of it, so it can fight it rapidly if exposed in the future. This second, faster and stronger response is the **secondary immune response**.

**Herd immunity:** when most of a community is vaccinated, the pathogen cannot spread, which also protects people who cannot be vaccinated.

::fig fa-immune-response | The primary and secondary immune responses | Supplied final solutions

::fig im-how-vaccines-help | How vaccines help | Lecture 7, slide 34

### What must be considered before vaccinating an individual?
**Suggestion:** Vaccination
**Source:** Supplied solution (Immune System 5)

The vaccines a person needs are decided by **health, age, lifestyle and occupation**, together called **HALO**:

- **Health:** some medical conditions increase the risk of vaccine-preventable diseases. People with asthma, diabetes, heart, lung, kidney or spleen disease, HIV, Down syndrome, or who were born prematurely may need extra or more frequent vaccines.
- **Age:** infants, children, adults and older people need different vaccines depending on their risk at each age.
- **Lifestyle:** overseas travel, planning a family, sexual activity, smoking or contact sports may increase the need for extra vaccines.
- **Occupation:** jobs with exposure to vaccine-preventable diseases, or close contact with vulnerable people (children, pregnant women, older adults, the chronically ill), may require additional vaccines.

::fig im-halo | Immunisation and HALO | Lecture 7, slide 29

### What are the different types of vaccine? Why are mRNA vaccines advantageous?
**Suggestion:** Vaccination
**Source:** Corrected: Immune System 8 and 9
**Review:** The supplied mRNA answer restated how vaccines work but gave no real advantages; standard advantages were added

**Types of vaccine** (from the vaccine-designs slide):

1. **Whole-inactivated:** an inactivated form of the pathogen.
2. **Synthetic peptide:** a laboratory-made piece of protein.
3. **mRNA:** mRNA carries pieces of the pathogen's genetic code.
4. **DNA:** DNA carries pieces of the pathogen's code.
5. **Recombinant viral vector:** another, harmless virus carries pieces of the pathogen.
6. **Recombinant bacterial vector:** bacteria carry pieces of the pathogen.
7. **Recombinant sub-unit:** a pathogen protein made in a laboratory.
8. Also on the slide: live-attenuated (weakened pathogen), virus-like particles and broadly neutralising antibodies.

**Why mRNA vaccines are advantageous:**

- They give the body the **blueprint** to make the antigen itself, so **no live or whole pathogen** is used and they **cannot cause the infection**.
- They trigger both **antibodies and T-cell responses** and build memory cells.
- They are **fast to design and manufacture**: only the mRNA sequence needs changing for a new strain, so they can be produced quickly in an outbreak (as with COVID-19).
- mRNA does not enter the nucleus or **alter the person's DNA**, and is broken down naturally after use.

::fig im-vaccine-designs | Vaccine designs | Lecture 7, slide 37

### Classify T cells and mention their functions.
**Suggestion:** Immunity (asked in past papers)
**Source:** Corrected: Immune System 1
**Review:** The supplied answer wrote "simulate" for helper T cells; the correct word is "stimulate"

T cells are white blood cells essential for adaptive immunity.

- **Cytotoxic T cells:** produce toxic agents to kill infected or cancerous target cells.
- **Helper T cells:** **stimulate** B cells to make antibodies and stimulate other T cells to become active.
- **Regulatory T cells:** suppress the immune response, preventing over-reaction.
- **Memory T cells:** remember past pathogens to launch rapid attacks in the future.

::fig im-t-cell-functions | Cytotoxic, helper and regulatory T cells | Lecture 7, slide 14

### Classify B lymphocytes and describe their functions.
**Suggestion:** Immunity (asked in past papers)
**Source:** Supplied solution (Immune System 6)

B lymphocytes produce antibodies (through plasma cells); antibodies recognise and bind specific antigens to help destroy pathogens.

- **B-1 cells:** produce natural antibodies and give early protection.
- **B-2 cells:** conventional B cells of adaptive humoral immunity; after antigen stimulation they become plasma cells and memory B cells.
- **Follicular B cells:** produce antibodies after antigen stimulation.
- **Marginal zone B cells:** give a rapid response against blood-borne pathogens.
- **Plasma cells:** produce and secrete antibodies.
- **Memory B cells:** remember antigens and give a faster, stronger response in future infections.

::fig im-cellular-response | Helper T cells activate B cells, which produce antibodies (humoral immunity) | Lecture 7, slide 26

### Define antibody and antigen. Mention the types.
**Suggestion:** Immunity (asked in past papers)
**Source:** Supplied solution (Immune System 7)

- **Antibody:** a protein made by **plasma cells** in response to an antigen. Each antibody binds only one specific antigen. There are five classes: **IgG, IgM, IgA, IgD and IgE**. IgG is the most abundant (70–75% of antibodies in the blood).
- **Antigen:** any substance that makes the body mount an immune response against it, such as toxins, chemicals, bacteria and viruses from outside the body.

**Types of antigen** (as on the slide): cancer antigens, viral antigens, bacterial antigens and pathogen antigens.

::fig im-antibodies | Antibodies and their five classes | Lecture 7, slide 15

::fig im-antigens | Types of antigen | Lecture 7, slide 17

## 3. Brain Computer Interface

### Illustrate the structure of a neuron.
**Suggestion:** Sensory and motor neuron (neuron structure)
**Source:** Supplied solution (BCI 1)

The **neuron** is the structural and functional unit of the nervous system. A typical neuron has three regions:

1. **Cell body (soma):** contains the nucleus and organelles.
2. **A single axon:** carries impulses away from the cell body; it is covered by a **myelin sheath** with gaps called **nodes of Ranvier**, and ends in **axon terminals** that form synapses.
3. **A variable number of dendrites:** receive signals from other neurons.

Neurons differ from other cells because they have axons and dendrites, and they have no centrosome, so they cannot divide.

::fig fa-neuron | A labelled neuron: cell body, nucleus, dendrites, axon, myelin sheath, nodes of Ranvier, axon terminal and synapse | Supplied final solutions

### Describe sensory and motor neurons and their functions.
**Suggestion:** Sensory and motor neuron
**Source:** Supplied solution (BCI 2)

Neurons are classified by function:

- **Sensory (afferent) neuron:** carries nerve impulses from sensory receptors **towards** the central nervous system (CNS).
- **Motor (efferent) neuron:** carries nerve impulses **from** the CNS to effector organs, such as muscles or glands.
- **Interneurons** lie entirely within the CNS and integrate the signals.

**How the nervous system works with them:** a receptor detects a stimulus, the sensory neuron carries the message to the CNS, interneurons process it, and the motor neuron carries the response to a muscle or gland.

::fig fa-sensory-motor | Afferent (sensory) and efferent (motor) neurons and the interneuron | Supplied final solutions

### What is an action potential? Explain its steps with a graph.
**Suggestion:** Action Potential (Steps and graph)
**Source:** Supplied solution (BCI 4), graph explanation added from Lecture 8, slide 21

A stimulus **depolarises** the membrane to the **threshold potential**. Once threshold is reached, an action potential is generated:

1. **Resting potential:** about **−70 mV**, kept by the Na⁺/K⁺ pump.
2. **Depolarisation:** voltage-gated **Na⁺ channels open**; Na⁺ rushes in down its electrochemical gradient (a **positive feedback** loop), and the membrane potential rises rapidly from −70 to about **+30 mV**.
3. The Na⁺ channels then become **inactivated**.
4. **Repolarisation:** voltage-gated **K⁺ channels open**; K⁺ flows out (a **negative feedback** loop), bringing the potential back down.
5. **Hyperpolarisation:** the potential briefly dips below the resting level, then returns to the original resting membrane potential. During this **refractory period** a new action potential cannot easily start.

**The graph** plots membrane potential (mV) against time (ms): a flat resting line at −70 mV, a rise to threshold (about −55 mV), a sharp spike to +30 mV (depolarisation), a fall (repolarisation), a dip below −70 mV (hyperpolarisation) and a return to rest, all within a few milliseconds.

::fig fa-action-potential | The action potential graph | Supplied final solutions

### Describe the events at a chemical synapse. How is an electrical signal converted into a chemical signal?
**Suggestion:** Synapse / Electrical signal conversion into Chemical signal (Diagram)
**Source:** Supplied solution (BCI 3), steps put back in order

A **synapse** is a functional connection between a neuron and another neuron or an effector cell such as a muscle or gland. Transmission is in one direction only. The events at a typical chemical synapse:

1. The transmitter is synthesised and stored in **vesicles**.
2. An **action potential** invades the presynaptic terminal.
3. Depolarisation of the presynaptic terminal opens **voltage-gated Ca²⁺ channels**.
4. **Ca²⁺ flows in** through the channels.
5. Ca²⁺ causes the vesicles to **fuse** with the presynaptic membrane.
6. The transmitter is released into the synaptic cleft by **exocytosis**.
7. The transmitter binds to **receptor** molecules in the postsynaptic membrane.
8. Postsynaptic channels open or close.
9. The postsynaptic current causes an excitatory or inhibitory postsynaptic potential that changes the excitability of the postsynaptic cell.
10. The vesicle membrane is retrieved from the plasma membrane and recycled.

**Electrical to chemical:** steps 2–6 turn the electrical signal (the action potential) into a chemical signal (neurotransmitter release). Steps 7–9 turn the chemical signal back into an electrical one in the next cell.

::fig bci-synapse-sequence | The sequence of events at a chemical synapse | Lecture 8, slide 18

::fig fa-synapse-steps | Ca²⁺ entry, vesicle fusion and transmitter release, then receptor channels open | Supplied final solutions

### What is a brain-computer interface? How does it work, and where is it used?
**Suggestion:** BCI (Parts and applications)
**Source:** Supplied solution (BCI 5)

A **brain-computer interface (BCI)** is a system that determines **functional intent** (the desire to change, move, control or interact with something in your environment) **directly from brain activity**, letting you control a device using only your mind.

**Three main parts:**

1. **A device to measure brain activity:** usually a headset, cap or headband with sensors (electrodes) that detect and record the brain's signals, often by **EEG** (electroencephalography).
2. **A computer to process and analyse** the recorded activity: BCI software interprets the user's intended action using specialised processing methods and algorithms.
3. **An application or device to control:** once the computer has determined what the user wants, it sends a command to the device (e.g. turning on a lamp).

**Workflow:** record brain signals → process and extract features → classify the intent → send the command → the device acts, and the user sees the result (feedback).

**Applications:**

- Helping people with **locked-in syndrome** (who cannot move, speak or even blink, e.g. from ALS) to communicate.
- Controlling **power wheelchairs, prosthetic limbs** and communication devices, and supporting therapies such as **functional electrical stimulation (FES)** for neurological disorders.
- Assessing fatigue in attention-demanding jobs (air traffic controllers, drivers), gaming and virtual reality, neuromarketing, and relaxation headbands.

::fig bci-bci-control | Normal motor control versus control through a BCI | Lecture 8, slide 25

### Describe artificial neural networks, their parts and applications.
**Suggestion:** ANN (Parts and applications)
**Source:** Supplied solution (BCI 6), comparison added from Lecture 8, slide 33

**Artificial neural networks (ANNs)** are computer systems designed to mimic how the human brain processes information. Just as the brain uses neurons, ANNs use artificial neurons to analyse data, identify patterns and make predictions. They learn patterns through **training**, adjusting themselves to improve accuracy by comparing their predictions with the actual results.

**Parts (layers):**

- **Input layer:** data such as an image, text or numbers enters the network.
- **Hidden layers:** each neuron performs a calculation on its inputs and passes the result on; the data is transformed at each layer.
- **Output layer:** gives the final prediction, such as classifying an image as a cat or a dog.

**Applications:** image recognition, personalised recommendations, disease prediction and medical image analysis, speech recognition and decoding brain signals in BCIs.

**ANN versus biological neural network:**

| Aspect | Biological neurons | Artificial neurons |
|---|---|---|
| Structure | Dendrites receive, cell body processes, axon transmits | Input, hidden and output nodes |
| Connections | Synapses | Weights |
| Learning | Synaptic plasticity | Backpropagation adjusts the weights |
| Activation | Fires when the signal reaches threshold | An activation function decides the output |

::fig bci-ann-vs-bnn | Artificial versus biological neural networks | Lecture 8, slide 31

## 4. Biological Database

### What is a database? What are the types of biological database?
**Suggestion:** Biological Database (Definition, Classification with example)
**Source:** Supplied solution (Biological Database 1 and 2)

A **database** is a computerised archive used to store and organise data so that information can be retrieved easily by various search criteria. It consists of computer hardware and software for data management.

**Types of biological database** (by content):

- **Primary databases:** contain **original** biological data, archives of raw sequence or structural data submitted by scientists. Examples: **GenBank** and the **Protein Data Bank (PDB)**. They are the foundation of all databases because secondary and specialised databases are built from their data.
- **Secondary databases:** contain **computationally processed or manually curated** information based on primary data, such as translated protein sequences with functional annotation. Examples: **Swiss-Prot** and the **Protein Information Resource (PIR)**.
- **Specialised databases:** serve a particular research interest, organism or data type. Examples: **FlyBase**, the HIV sequence database and the Ribosomal Database Project.

::fig db-database-types | Primary, secondary and specialised databases | Lecture 9, slide 3

### Describe the different types of omics.
**Suggestion:** Biological Database
**Source:** Supplied solution (Biological Database 3)

- **Genomics:** the study of an organism's complete genome, including gene content, structure and variation.
- **Proteomics:** large-scale study of the entire set of proteins (proteome), focusing on structure, function and interactions.
- **Transcriptomics:** analysis of the complete set of RNA molecules (transcriptome): mRNA, rRNA, tRNA and non-coding RNAs, to assess gene expression.
- **Metabolomics:** systematic study of the small-molecule metabolites (metabolome) in cells, tissues or organisms, a chemical fingerprint of biological processes.

::fig db-omics | Genomics, proteomics, transcriptomics and metabolomics | Lecture 9, slide 4

### What is BLAST? What are its types?
**Suggestion:** BLAST (Application)
**Source:** Supplied solution (Biological Database 4 and 5)

**BLAST (Basic Local Alignment Search Tool)** is a sequence comparison tool developed by the **National Center for Biotechnology Information (NCBI)**. It identifies sequence similarity between a query DNA or protein sequence and the sequences in a database.

**Applications:** organism identification, gene annotation and homology analysis; an essential tool in genomics, microbiology and bioinformatics.

**Types:**

| Program | Query | Database |
|---|---|---|
| **blastn** (nucleotide BLAST) | Nucleotide | Nucleotide |
| **blastp** (protein BLAST) | Protein | Protein |
| **blastx** | Translated nucleotide | Protein |
| **tblastn** | Protein | Translated nucleotide |
| **tblastx** | Translated nucleotide | Translated nucleotide |

So **blastx** translates a DNA query and searches proteins, while **tblastn** searches a translated DNA database with a protein query.

::fig db-blast-types | The different types of BLAST | Lecture 9, slide 15

### What are the outcomes of BLAST? Define E-value, query coverage and identity.
**Suggestion:** BLAST (definition of E-value, query coverage, identity)
**Source:** Corrected: Biological Database 6
**Review:** The supplied definition of identity ("percent of query that is similar of subject") was unclear; identity counts identical bases or residues in the aligned region

- **Max score:** the highest alignment score between the query (your search) and a subject or hit (a database sequence).
- **Total score:** the sum of the scores of all aligned segments from the same subject that match the query.
- **Query coverage:** the percentage of the query length included in the aligned segments.
- **Identity:** the percentage of **identical** nucleotides or amino acids between the query and the subject within the aligned region.
- **E-value (expect value):** the number of alignments with this score or better expected **by chance** in a database of this size. The **lower** the E-value (close to 0), the more significant the match.

::fig db-blast-outcomes | BLAST outcomes | Lecture 9, slide 16

### Differentiate between UniProt and PDB.
**Suggestion:** Proteomics database (UniProt Vs PDB)
**Source:** Supplied solution (Biological Database 7)

| Feature | UniProt | Protein Data Bank (PDB) |
|---|---|---|
| Main focus | Protein sequence and functional annotation | 3D structural information |
| Data type | Amino acid sequences, domains, pathways | Atomic-level 3D structures (proteins, DNA and RNA) |
| What it explains | What the protein does | How the protein looks in 3D |
| Experimental data required | Not mandatory | Mandatory (X-ray, NMR, cryo-EM) |
| Identifier | UniProt accession number | PDB ID |
| Major applications | Functional analysis, annotation, bioinformatics | Structural biology, drug design |
| Level of analysis | Sequence level and biological role | Structure level and molecular interactions |

::fig db-uniprot-vs-pdb | Difference between UniProt and PDB | Lecture 9, slide 19

### What is a phylogenetic tree? Describe its types.
**Suggestion:** Phylogenetic Tree (Cladogram, Phylogram, Ultra-metric Tree)
**Source:** Corrected: Biological Database 8 and 9
**Review:** "Crustal W/X" corrected to Clustal W/X (the slide has the same typo)

A **phylogenetic tree** (evolutionary tree) is a graphical representation of the evolutionary history of biological sequences, showing the evolutionary relationships between them. Software such as **Clustal W/X, MEGA 5/6/7, iTOL and FigTree** is used to build and view trees.

**Types:**

- **Cladogram:** shows only the branching pattern of taxa based on shared ancestry; branch length has **no meaning**.
- **Phylogram:** branch length reflects the **amount of genetic change**.
- **Ultrametric tree:** branches are scaled to **time**, with all taxa equidistant from the root.

::fig fa-tree-types | Cladogram, phylogram and ultrametric tree | Supplied final solutions

### How is a phylogenetic tree constructed? How would you identify an unknown bacterium from its DNA?
**Suggestion:** Phylogenetic Tree (Construction)
**Source:** Prepared from the slides (Lecture 9, slides 29–31)

Bacteria are identified with the **16S rRNA gene**: it encodes part of the small ribosomal subunit, is highly conserved among bacteria but has variable regions, so it reveals the species and its evolutionary position. (Eukaryotes use 18S rRNA.)

1. **Identify and download sequences (NCBI):** sequence the 16S rDNA, search it against the NCBI 16S rRNA database with **BLAST**, and download the closest matching sequences (preferably from type strains) in **FASTA** format. The best hit identifies the likely species.
2. **Multiple sequence alignment:** align the query and the downloaded sequences with **Clustal W/X or MEGA**, check the alignment and trim poorly aligned ends.
3. **Construct the tree:** import the alignment into **MEGA**, choose a method such as **Neighbor-Joining or Maximum Likelihood**, and run **bootstrap** analysis to test the reliability of the branches.
4. **Visualise the tree** with **iTOL or FigTree**, showing labels, colours and bootstrap values.

::fig db-phylogenetic-construction | Construction of a phylogenetic tree | Lecture 9, slide 29

### Describe the applications of phylogenetic trees.
**Suggestion:** Phylogenetic Tree (Application)
**Source:** Supplied solution (Biological Database 10)

- Studying **evolutionary relationships** between species and evolutionary processes over time.
- Studying the **diversity and distribution** of species, to plan conservation of endangered species and ecosystems.
- Identifying the **origins of pathogens** and tracking the spread of diseases.
- **Forensics:** finding the origin of biological samples from crime scenes and linking suspects to crimes.
- **Classifying organisms** by their DNA sequences and morphological similarities and differences.

::fig db-tree-terminology | Phylogenetic tree terminology | Lecture 9, slide 33

## 5. Systems and Synthetic Biology

### What is systems biology? What is a biological system?
**Suggestion:** Systems biology (asked in past papers)
**Source:** Corrected: System Biology 1
**Review:** The supplied answer defined a biological system but not systems biology; the definition of systems biology was added from Lecture 10, slide 3

**Systems biology** is an interdisciplinary approach that studies complex living systems as integrated wholes, focusing on the **interactions** between components (genes, proteins, cells) rather than on individual parts. It uses computational models and large-scale data (genomics, proteomics) to understand how these interactions create emergent properties and to predict system behaviour.

A **biological system** is a network of interacting biological components (genes, RNAs, proteins, metabolites and regulatory elements) that together carry out, coordinate and regulate a specific cellular function.

::fig sb-biological-system | What is a biological system? | Lecture 10, slide 4

### What do nodes and edges represent in a biological network?
**Suggestion:** Systems biology (asked in past papers)
**Source:** Supplied solution (System Biology 2)

- **Node:** a point in a biological network representing an individual component, such as a gene, protein or metabolite. In a disease model, a node may be a molecule or protein targeted by a drug.
- **Edge:** a line connecting two nodes, representing an interaction between them, such as protein-DNA binding, protein-protein interaction, a chemical reaction or a signalling interaction. The weight (thickness) of an edge often shows the strength of the interaction.

Highly connected nodes are called **hubs**.

::fig sb-network-diagram | A biological network: nodes, edges and hubs | Lecture 10, slide 6

### How do activators and repressors regulate gene transcription? Explain with figures.
**Suggestion:** Gene Transcription Regulation by Activators and Repressors (Diagram)
**Source:** Supplied solution (System Biology 3, gene regulatory network), with the activator and repressor mechanism prepared from Lecture 10, slides 10–12

In a **gene regulatory network**, genes regulate other genes with on/off logic. The nodes are genes and proteins, especially **transcription factors (TFs)**, the master controllers of gene expression; the edges are regulatory links, usually a TF binding to DNA to **activate** (turn on) or **repress** (turn off) a gene.

**Repressor (turns a gene off):**

1. A repressor protein binds the **operator**, a DNA site next to the **promoter** (P).
2. Bound there, it blocks **RNA polymerase** from moving along the genes.
3. No mRNA is made, so the genes are **not transcribed**.

**Activator (turns a gene on):**

1. An activator protein binds its own **binding site** on the DNA, near the promoter of the target gene.
2. It helps the **general transcription factors and RNA polymerase assemble** at the promoter.
3. Transcription of the target gene starts (or increases).

Together, activators and repressors let the cell switch genes on only when their products are needed.

::fig sb-activators-repressors | A repressor blocks transcription; an activator helps it start | Lecture 10, slide 12

### What is a feedback loop? Compare positive and negative feedback.
**Suggestion:** Feedback loop (Definition, Positive Vs. Negative feedback loop)
**Source:** Supplied solution (System Biology 4)

A **feedback loop** in a biological system is a regulatory mechanism in which the **output of a process influences its own activity upstream**, either enhancing or suppressing it.

| Positive feedback | Negative feedback |
|---|---|
| The output **amplifies** the original stimulus, pushing the system further in the same direction | The output **reduces or counteracts** the original stimulus, stabilising the system |
| Less common; used where a rapid or decisive outcome is needed | The most common type; keeps conditions stable (homeostasis) |
| Example: in **childbirth**, contractions trigger oxytocin release, which intensifies contractions until delivery | Example: **blood glucose**: high glucose triggers insulin, which lowers it; low glucose reduces insulin. Also body temperature regulation |

::fig fa-feedback-loops | Positive feedback in childbirth and negative feedback in temperature regulation | Supplied final solutions

### What is synthetic biology? Describe the DBTL cycle.
**Suggestion:** DBTL cycle
**Source:** Supplied solution (System Biology 5 and 6)

**Synthetic biology** is the design and construction of new biological parts, devices and systems, and the re-design of existing natural biological systems for useful purposes. It treats the cell like a computer and DNA like software code.

The **Design-Build-Test-Learn (DBTL) cycle** is its core engineering loop:

1. **Design:** computational tools and bioinformatics are used to plan genetic circuits and metabolic pathways for a desired function.
2. **Build:** the digital designs are made into physical DNA using DNA synthesis, standard **BioBricks** and gene-editing tools such as **CRISPR-Cas9**, creating engineered organisms.
3. **Test:** the organisms are grown and evaluated using high-throughput screening and multi-omics data to measure their performance.
4. **Learn:** the data are analysed, often with AI and machine learning, to refine the models and inform the next design.

**Example (biofuel from engineered bacteria):** *design* a pathway that turns sugar into a biofuel; *build* it by inserting the pathway genes into *E. coli*; *test* the strains for biofuel yield; *learn* which genes limit production, then redesign and repeat until the yield is high enough.

::fig sb-dbtl-cycle | The DBTL cycle | Lecture 10, slide 29

### What is CRISPR-Cas9? Describe a gene-editing tool, its parts and roles.
**Suggestion:** Gene Editing tool (CRISPR-Cas9)
**Source:** Corrected: System Biology 7
**Review:** A stray "Node:" label in the supplied answer was removed, and the parts were listed separately

**CRISPR-Cas9** is a powerful gene-editing tool adapted from a bacterial defence system.

**Parts and roles:**

- **Single guide RNA (sgRNA):** made of crRNA and tracrRNA; its sequence matches the target gene and guides Cas9 there.
- **Cas9 enzyme:** a nuclease that cuts both strands of the DNA at the target site.
- **The cell's repair system:** repairs the cut, so genes can be **deleted**, **corrected**, or new DNA **inserted** (when a repair template is supplied).

It enables fast, precise and low-cost genome editing in research, medicine and synthetic biology.

::fig sb-crispr-cas9 | CRISPR-Cas9: the guide RNA directs Cas9 to cut the target gene | Lecture 10, slide 31

::fig fa-crispr | Cas9 with its sgRNA (crRNA + tracrRNA) cuts the target gene; repair gives a deletion or an insertion | Supplied final solutions

### What are BioBricks?
**Suggestion:** Gene Editing tool (BioBricks)
**Source:** Prepared from the slides (Lecture 10, slide 30)

**BioBricks** are **standardised DNA parts**, such as promoters, ribosome binding sites, protein-coding sequences and terminators, that can be mixed and matched **like LEGO blocks** to build genetic circuits.

- Every part follows the same **BioBrick standard format**, with standard flanking sequences, so any two parts can be joined in the same way.
- Joining a promoter, a coding sequence and a terminator builds a working **expression cassette**.
- BioBricks make biological design modular and repeatable, and are used in the **Build** step of the DBTL cycle together with DNA synthesis (chemically creating DNA sequences in the lab).

::fig sb-biobricks | DNA synthesis and BioBricks: assembly of parts in the BioBrick standard format | Lecture 10, slide 30
