import PageHeader from '../components/ui/PageHeader.jsx';
import EvidenceLink from '../components/ui/EvidenceLink.jsx';
import AchievementsOverview from '../components/sections/AchievementsOverview.jsx';
import { gpAcademy } from '../data/achievements';
import usePageTitle from '../lib/usePageTitle';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Achievements() {
  usePageTitle('Achievements', 'Project competition placements, merit scholarships and certifications of Shadhin Nandi, with the original certificates.');
  return (
    <div className="page">
      <PageHeader
        label="Achievements"
        title="Achievements"
        lead="Recognition for project work, merit scholarships for academic performance, and completed certifications, each with its original certificate."
      />

      <div className="container">
        <AchievementsOverview headingLevel={2} full />

        <section id="certifications" className="block block--spaced" aria-labelledby="gp-title">
          <h2 id="gp-title" className="block__title">
            {gpAcademy.issuer} certificates
          </h2>
          <p className="block__intro">
            {gpAcademy.summary} {gpAcademy.period}.
          </p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Course</th>
                  <th scope="col">Completed</th>
                  <th scope="col">
                    <span className="visually-hidden">Certificate</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {gpAcademy.courses.map((c) => (
                  <tr key={c.title}>
                    <td>{c.title}</td>
                    <td className="mono">
                      <time dateTime={c.date}>{formatDate(c.date)}</time>
                    </td>
                    <td className="align-end">
                      <EvidenceLink href={c.certificate?.full}>
                        Certificate<span className="visually-hidden"> for {c.title}</span>
                      </EvidenceLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
