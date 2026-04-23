type FooterProps = {
  creatorName?: string;
  socialUrl?: string;
};

export default function Footer({
  creatorName = "Myrios",
  socialUrl = "https://www.linkedin.com/in/min-phyo-thura/",
}: FooterProps) {
  return (
    <footer
      className="guide footer-note"
      aria-label="Disclaimer and creator details"
    >
      <p>
        <strong>Happy FYI:</strong> This is not a financial advice but rather a
        visualization tool to help you compare how student debt repayment and
        early investing may grow over time.
      </p>
      <p>
        - Made by{" "}
        <a
          className="footer-social-link"
          href={socialUrl}
          target="_blank"
          rel="noreferrer"
        >
          <strong>{creatorName}</strong>
        </a>{" "}
        -
      </p>
    </footer>
  );
}
