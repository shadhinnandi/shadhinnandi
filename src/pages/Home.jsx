import { Link } from 'react-router-dom';
import Hero from '../components/sections/Hero.jsx';
import Section from '../components/ui/Section.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Icon from '../components/ui/Icon.jsx';
import ProjectCard from '../components/project/ProjectCard.jsx';
import { CurrentResearch, ResearchAreas } from '../components/sections/ResearchBlocks.jsx';
import ExperienceList from '../components/sections/ExperienceList.jsx';
import { DegreeCard } from '../components/sections/Education.jsx';
import SkillTable from '../components/sections/SkillTable.jsx';
import AchievementsOverview from '../components/sections/AchievementsOverview.jsx';
import ContactPanel from '../components/sections/ContactPanel.jsx';
import { profile } from '../data/profile';
import { projects } from '../data/projects';
import { research, currentResearch, researchAreas } from '../data/research';
import { experience } from '../data/experience';
import { skills } from '../data/skills';
import usePageTitle from '../lib/usePageTitle';

// Order: identity → about → projects → teaching → research → academic →
// skills → achievements → contact.
export default function Home() {
  usePageTitle(null);
  const homeProjects = projects.slice(0, 6);
  return (
    <div className="page page--home">
      <Hero />

      <section id="about" className="section section--profile" aria-labelledby="about-title">
        <div className="container profile">
          <Reveal>
            <h2 id="about-title" className="profile__title">
              About
            </h2>
          </Reveal>
          <Reveal className="profile__text">
            {profile.profile.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
            <Link className="text-link" to="/about">
              More about me
              <Icon name="arrowRight" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Section
        id="work"
        title="Selected projects"
        intro="Course projects, independent builds and research code — full-stack, embedded, ML, security and games."
        link={{ to: '/projects', label: `All ${projects.length} projects` }}
      >
        <div className="pgrid">
          {homeProjects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <ProjectCard project={p} eager={i < 3} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section
        id="teaching"
        band
        title="Teaching & experience"
        intro="Undergraduate Teaching Assistant in the CSE department at UIU since March 2025."
        link={{ to: '/experience', label: 'Experience in full' }}
      >
        <Reveal>
          <ExperienceList items={experience} compact />
        </Reveal>
      </Section>

      <Section id="research" title="Research" intro={research.title} link={{ to: '/research', label: 'Research areas in detail' }}>
        <Reveal>
          <p className="research-summary">{research.summary}</p>
        </Reveal>
        <Reveal>
          {currentResearch.map((item) => (
            <CurrentResearch key={item.id} item={item} compact />
          ))}
        </Reveal>
        <Reveal className="research-areas">
          <ResearchAreas areas={researchAreas} />
        </Reveal>
      </Section>

      <Section id="academic" band title="Academic" link={{ to: '/about#education', label: 'Full education' }}>
        <Reveal>
          <DegreeCard photo />
        </Reveal>
      </Section>

      <Section id="skills" title="Technical skills" intro="Grouped by use. Every item maps to a project, repository or course I taught." link={{ to: '/projects#skills', label: 'Skills with evidence' }}>
        <Reveal>
          <SkillTable groups={skills} />
        </Reveal>
      </Section>

      <Section
        id="achievements"
        band
        title="Achievements"
        intro="Recognition for project work, merit scholarships and completed certifications."
        link={{ to: '/achievements', label: 'All achievements and certificates' }}
      >
        <Reveal>
          <AchievementsOverview />
        </Reveal>
      </Section>

      <section id="contact" className="section section--contact" aria-labelledby="contact-title">
        <div className="container">
          <Reveal>
            <ContactPanel headingId="contact-title" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
