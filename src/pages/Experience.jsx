import PageHeader from '../components/PageHeader.jsx';
import Timeline from '../components/Timeline.jsx';
import { experience } from '../data/experience';
import usePageTitle from '../lib/usePageTitle';

export default function Experience() {
  usePageTitle('Experience', 'Experience of Shadhin Nandi: Undergraduate Teaching Assistant at UIU and Machine Learning Intern at CodeAlpha.');
  return (
    <div className="page">
      <PageHeader
        eyebrow="Experience"
        title="Experience"
        lead="Teaching assistance in the CSE department at UIU since March 2025, and a machine learning internship in 2026."
      />
      <div className="container">
        <Timeline items={experience} headingLevel={2} />
      </div>
    </div>
  );
}
