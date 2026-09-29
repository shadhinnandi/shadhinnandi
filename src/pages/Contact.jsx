import ContactPanel from '../components/sections/ContactPanel.jsx';
import usePageTitle from '../lib/usePageTitle';

export default function Contact() {
  usePageTitle('Contact', 'Contact Shadhin Nandi by email, LinkedIn or GitHub.');
  return (
    <div className="page page--contact">
      <div className="container">
        <ContactPanel headingLevel={1} title="Contact" all />
      </div>
    </div>
  );
}
