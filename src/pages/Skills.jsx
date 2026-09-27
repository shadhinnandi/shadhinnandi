import PageHeader from '../components/PageHeader.jsx';
import SkillGroup from '../components/SkillGroup.jsx';
import { skills } from '../data/skills';
import usePageTitle from '../lib/usePageTitle';

export default function Skills() {
  usePageTitle('Skills', 'Languages, frameworks, databases, machine learning libraries and tools used by Shadhin Nandi, with links to evidence.');
  return (
    <div className="page">
      <PageHeader
        eyebrow="Skills"
        title="Skills"
        lead="Technologies I have used in coursework, teaching and projects. Each group notes where it can be verified."
      />
      <div className="container">
        <div className="skills-grid skills-grid--full">
          {skills.map((g) => (
            <SkillGroup key={g.group} group={g} showEvidence headingLevel={2} />
          ))}
        </div>
      </div>
    </div>
  );
}
