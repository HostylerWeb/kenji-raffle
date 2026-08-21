"use client";

type Step = {
  label: string;
  done: boolean;
  active: boolean;
  hint?: string;
};

export function RaffleWorkflowBanner({
  status,
  ticketsGenerated,
  hasInstantWins,
}: {
  status: string;
  ticketsGenerated: boolean;
  hasInstantWins: boolean;
}) {
  const published = status !== "draft";
  const live = status === "listed" || status === "active";

  const steps: Step[] = [
    {
      label: "Configure raffle",
      done: true,
      active: status === "draft" && !ticketsGenerated,
    },
    {
      label: "Instant wins",
      done: hasInstantWins,
      active: status === "draft" && !hasInstantWins && !ticketsGenerated,
      hint: hasInstantWins ? undefined : "Optional — add below before generating tickets",
    },
    {
      label: "Generate ticket pool",
      done: ticketsGenerated,
      active: status === "draft" && !ticketsGenerated,
      hint: ticketsGenerated ? undefined : "Required before publish",
    },
    {
      label: "Publish & go live",
      done: live,
      active: ticketsGenerated && !live,
    },
  ];

  return (
    <div className="admin-workflow">
      {steps.map((step, i) => (
        <div
          key={step.label}
          className={`admin-workflow__step${
            step.done ? " admin-workflow__step--done" : ""
          }${step.active ? " admin-workflow__step--active" : ""}`}
        >
          <div className="admin-workflow__num">{step.done ? "✓" : i + 1}</div>
          <div>
            <div className="admin-workflow__label">{step.label}</div>
            {step.hint && <div className="admin-workflow__hint">{step.hint}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
