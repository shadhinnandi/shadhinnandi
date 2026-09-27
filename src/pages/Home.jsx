import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
import Section from '../components/Section.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import SkillGroup from '../components/SkillGroup.jsx';
import Timeline from '../components/Timeline.jsx';
import AchievementCard from '../components/AchievementCard.jsx';
import Icon from '../components/Icon.jsx';
import { profile } from '../data/profile';
import { degree } from '../data/education';
import { experience } from '../data/experience';
import { skills, featuredSkillGroups } from '../data/skills';
import { featuredProjects, otherProjects, academicProjects, projectPath } from '../data/projects';
import { awards, featuredAwardIds, gpAcademy } from '../data/achievements';
import usePageTitle from '../lib/usePageTitle';

export default function Home() {
  usePageTitle(null);
  const homeAwards = awards.filter((a) => featuredAwardIds.includes(a.id));

  return (
    <div className="page page--home">
      <Hero />

      <Section id="about" eyebrow="About" title="Building software, teaching, and research">
        <p className="lead">{profile.intro}</p>
        <ul className="link-row">
          <li>
            <Link className="text-link" to="/about">
              View more
              <Icon name="arrowRight" />
            </Link>
          </li>
          <li>
            <a className="text-link" href={profile.resume} download="Shadhin_Nandi_Resume.pdf">
              Download resume
              <Icon name="download" />
            </a>
          </li>
        </ul>
      </Section>

      <Section id="academic" eyebrow="Academic" title="Education and course projects" link={{ to: '/academic', label: 'View academic background' }}>
        <div className="degree">
          <h3 className="degree__title">{degree.title}</h3>
          <p className="degree__school">{degree.institution}</p>
          <p className="meta">{degree.period}</p>
          <dl className="facts">
            {degree.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <h3 className="subhead">Academic projects</h3>
        <ul className="compact-projects">
          {academicProjects.map((p) => (
            <li key={p.slug}>
              <p className="meta">{p.context}</p>
              <div>
                <Link className="compact-projects__title" to={projectPath(p)}>
                  {p.title}
                </Link>
                <span className="compact-projects__tagline"> — {p.tagline}</span>
                {p.details?.recognition?.[0] && <p className="compact-projects__award small">{p.details.recognition[0]}</p>}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="experience" eyebrow="Experience" title="Work and teaching" link={{ to: '/experience', label: 'View experience' }}>
        <Timeline items={experience} compact />
      </Section>

      <Section id="skills" eyebrow="Skills" title="Technologies I work with" link={{ to: '/skills', label: 'View all skills' }}>
        <div className="skills-grid">
          {skills
            .filter((g) => featuredSkillGroups.includes(g.group))
            .map((g) => (
              <SkillGroup key={g.group} group={g} />
            ))}
        </div>
      </Section>

      <Section
        id="projects"
        eyebrow="Projects"
        title="Selected work"
        link={{ to: '/projects', label: `All ${otherProjects.length} projects` }}
        className="section--projects"
      >
        <div className="project-list">
          {featuredProjects.map((p) => (
            <ProjectCard key={p.slug} project={p} maxPoints={3} />
          ))}
        </div>
      </Section>

      <Section id="research" eyebrow="Research" title="Research" link={{ to: '/research', label: 'View research' }}>
        <p className="lead">Exploring computational methods across AI, bioinformatics, computer vision and HCI.</p>
      </Section>

      <Section id="achievements" eyebrow="Achievements" title="Awards and recognition" link={{ to: '/achievements', label: 'View achievements' }}>
        <div className="award-list">
          {homeAwards.map((a) => (
            <AchievementCard key={a.id} award={a} />
          ))}
          <article className="award">
            <p className="award__date meta">Mar – May 2026</p>
            <div className="award__body">
              <h3 className="award__title">{gpAcademy.courses.length} professional development courses</h3>
              <p className="award__context">{gpAcademy.issuer} · AI, communication, interview preparation, Excel, networking and career readiness</p>
            </div>
          </article>
        </div>
      </Section>
    </div>
  );
}
