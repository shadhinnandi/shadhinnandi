# Content inventory

Every fact on the site traces to one of these sources. Nothing was added without a source.

| Source | Used for |
|---|---|
| `evidence/resume.pdf` | Education (dates, CGPA 3.93, 119 credits, HSC/SSC), UGA role and courses, project summaries for Vortex Arena, Shombhar, Durjog Prohori and ARAM, achievements, skills, LinkedIn/GitHub/Codeforces links, interests |
| `evidence/Certificate_Shadhin Nandi.pdf`, `evidence/LOR_Shadhin Nandi.pdf` | CodeAlpha Machine Learning virtual internship, 20 Aug – 20 Sep 2026, and the quoted line from the recommendation |
| `evidence/Evidence_0112230604_ShadhinNandi.pdf` | The 11 Grameenphone Academy certificates (titles and dates) |
| `evidence/vortex arena photo/*`, `evidence/ARAM photo/*`, `evidence/Project Show/*` | Project Show certificates (Fall 2025 and Summer 2025), trophies, stage and team photos, Vortex Arena start screen, ARAM prototype |
| `evidence/durjog prohori/*`, `evidence/farmers market place/*` | Screenshots and project reports (also published under `public/documents/`) |
| `evidence/DP photo.png`, `evidence/photo of UGA.jpeg` | Portrait; UIU campus photo (cropped so the handwritten student ID on the envelope is not shown) |
| GitHub repositories (all 11 cloned and read) | Technical details, stacks, results and screenshots for each project |
| Previous portfolio (`shadhinnandi.github.io/shadhinnandi`) | Email address, Instagram link, ClickUp and Cisco Packet Tracer |

### Images created during the build

- **UIUFund** and **Beginner C Programming UI**: screenshots of each repository's own frontend, taken after running it locally. No mock-ups.
- **Credit Scoring Model**: the ROC-curve chart produced by running the repository's pipeline on its included dataset.
- **SICA**: figures taken from `results/figures/` in the repository.
- **Disease Prediction** and **Speech Emotion Recognition** have no screenshots, so they appear as text-only entries.

## Please confirm or supply

1. **Vortex Arena scope.** The resume describes a server-authoritative multiplayer game with a shrinking play area and a Godot client. The public repository contains the Spring Boot backend and a single-player HTML5 Canvas client, and lists multiplayer under future work. The site shows both and notes the difference on the project page (`details.scope` in `src/data/projects.js`). If the Godot client lives in another repository, add its link and remove that note.
2. **Instagram.** The old portfolio links `instagram.com/shadhinnandii`, but the GitHub profile appears to list `00sdn`. The site uses `shadhinnandii`; change it in `src/data/profile.js` if that is wrong.
3. **Email.** `shadhin332@gmail.com` comes from the old portfolio, because the resume does not show an email address.
4. **Grameenphone Academy vs. Academia.** The resume says "Grameenphone Academia" and the certificates say "Grameenphone Academy". The site uses the certificate name.
5. **ML repositories and the CodeAlpha internship.** The Credit Scoring, Disease Prediction and Speech Emotion Recognition repositories were committed during the internship, but nothing states they were internship tasks, so the site does not link them to it. If they were, add them to the internship entry in `src/data/experience.js`.
6. **UIUFund and Durjog Prohori.** The course, team and your role are not documented, so none is shown. Durjog Prohori and ARAM have no public repository.
7. **Coursework.** Only courses documented in certificates or READMEs are listed (CSE 2118, CSE 4326, CSE 2215, Computer Security). Machine Learning and Human-Computer Interaction appear in the ELMS Extractor screenshot but are not listed. Add any others you want shown.
8. **Published documents.** Your CodeAlpha certificate, letter of recommendation and two project reports are served publicly from `public/documents/`. The letter includes CodeAlpha's contact details. Remove any files you would rather not publish, together with their links in `src/data/`.
9. **Research vs projects.** SICA is a Computer Security course project and lives under Work only; no paper, report status or authorship is shown for it. The Research page (`src/data/research.js`) shows AI and computational biology as stated by you: enhancer–promoter interaction prediction as ongoing research (approaches listed, no results claimed); bioinformatics and protein AI as "Familiar with"; YOLO-based trash/waste detection as "In progress"; human-centered AI as an interest. When the YOLO work has a repository, add it to `src/data/projects.js`; when anything is published, add it to `research.js`.
10. **Your role on team projects.** Each project in `src/data/projects.js` has a `role` field. It is filled only where documented (SICA, Shombhar). Adding one line for Vortex Arena, UIUFund, Durjog Prohori and ARAM (what *you* built) is the single most useful content improvement left for recruiters.
11. **Featured work.** `featured: true` marks the projects shown as large cards (Vortex Arena, UIUFund, Durjog Prohori). Change the flag to change the selection; order in the file is display order.
12. **Merit scholarships.** The resume says "8 × 100%, 2 × 25%". The site presents this as 8 full-tuition and 2 partial (25%) awards without saying they were per semester, because the resume does not say so.
