import PageHeader from '../components/PageHeader.jsx';
import AchievementCard from '../components/AchievementCard.jsx';
import CertificateButton from '../components/CertificateButton.jsx';
import { awards, gpAcademy } from '../data/achievements';
import { experience } from '../data/experience';
import usePageTitle from '../lib/usePageTitle';

const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Achievements() {
  usePageTitle('Achievements', 'Awards, scholarships and certifications of Shadhin Nandi, including two CSE Project Show placements at UIU.');
  const internship = experience.find((e) => e.id === 'codealpha-ml');
  const internshipCert = internship?.documents?.find((d) => d.kind === 'image');

  return (
    <div className="page">
      <PageHeader
        eyebrow="Achievements"
        title="Achievements"
        lead="Project competition placements, merit scholarships and completed certifications. Certificates can be viewed next to each item."
      />

      <div className="container">
        <section className="block" aria-labelledby="awards-title">
          <h2 id="awards-title" className="block__title">Awards and scholarships</h2>
          <div className="award-list award-list--detailed">
            {awards.map((a) => (
              <AchievementCard key={a.id} award={a} detailed />
            ))}
          </div>
        </section>

        <section className="block" aria-labelledby="certs-title">
          <h2 id="certs-title" className="block__title">Certifications</h2>

          <div className="cert-group">
            <h3 className="cert-group__title">Machine Learning Virtual Internship</h3>
            <p className="muted">CodeAlpha · 20 Aug – 20 Sep 2026</p>
            {internshipCert && (
              <CertificateButton image={internshipCert.image} title="CodeAlpha — Machine Learning internship certificate" href={internshipCert.href} />
            )}
          </div>

          <div className="cert-group">
            <h3 className="cert-group__title">{gpAcademy.issuer}</h3>
            <p className="muted">{gpAcademy.summary}</p>
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
                      <td className="mono small">
                        <time dateTime={c.date}>{formatDate(c.date)}</time>
                      </td>
                      <td className="align-end">
                        <CertificateButton image={c.certificate} title={`${gpAcademy.issuer} — ${c.title}`}>
                          Certificate<span className="visually-hidden"> for {c.title}</span>
                        </CertificateButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
