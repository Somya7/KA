interface TrustBenefitsProps {
  benefits: string[];
  trustSignals: string[];
  howToUse: string;
}

export function TrustBenefits({ benefits, trustSignals, howToUse }: TrustBenefitsProps) {
  return (
    <section className="trust" aria-labelledby="benefits-heading">
      <div className="trust__intro">
        <h2 id="benefits-heading" className="trust__title">
          Why people choose this
        </h2>
        <p className="trust__lede">
          Clear, general wellness support—grounded in traditional use and brand-published guidance.
        </p>
      </div>

      <ul className="trust__benefits">
        {benefits.map((b, i) => (
          <li key={b} className="trust__benefit" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="trust__mark" aria-hidden />
            {b}
          </li>
        ))}
      </ul>

      <div className="trust__row">
        <div className="trust__signals">
          {trustSignals.map((s) => (
            <span key={s} className="trust__pill">
              {s}
            </span>
          ))}
        </div>
        <p className="trust__use">
          <strong>How to use:</strong> {howToUse}
        </p>
      </div>
    </section>
  );
}
