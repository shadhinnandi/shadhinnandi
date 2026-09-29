import Icon from '../ui/Icon.jsx';

export default function AwardNote({ award }) {
  if (!award) return null;
  return (
    <p className="award-note">
      <Icon name="award" />
      <span>
        <strong>{award.title}</strong> <span className="award-note__detail">{award.detail}</span>
      </span>
    </p>
  );
}
