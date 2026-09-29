import PageHeader from '../components/ui/PageHeader.jsx';
import SkillTable from '../components/sections/SkillTable.jsx';
import { skills } from '../data/skills';
import usePageTitle from '../lib/usePageTitle';

export default function Skills() {
  usePageTitle('Skills', 'Languages, frameworks, databases, machine learning libraries and tools used by Shadhin Nandi, with where each can be verified.');
  return (
    <div className="page">
      <PageHeader
        label="Skills"
        title="Technical skills"
        lead="Technologies I have used in coursework, teaching and projects. Each group notes where it can be verified."
      />
      <div className="container">
        <SkillTable groups={skills} showEvidence headingLevel={2} />
      </div>
    </div>
  );
}
