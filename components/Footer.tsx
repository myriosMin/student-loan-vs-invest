type FooterProps = {
  creatorName?: string;
  socialUrl?: string;
};

export default function Footer({
  creatorName = "Myrios",
  socialUrl = "https://www.linkedin.com/in/min-phyo-thura/",
}: FooterProps) {
  return (
    <footer className="guide footer-note" aria-label="Disclaimer and creator details">
      <p>
        <strong>Not financial advice:</strong> this is a visualization tool to
        help you compare how student debt repayment and early investing may
        grow over time.
      </p>
      <div className="pill-row footer-meta-row">
        <div className="pill">
          Made by <strong>{creatorName}</strong>
        </div>
        <a
          className="pill footer-social-link"
          href={socialUrl}
          target="_blank"
          rel="noreferrer"
        >
          Social
        </a>
      </div>
    </footer>
  );
}
