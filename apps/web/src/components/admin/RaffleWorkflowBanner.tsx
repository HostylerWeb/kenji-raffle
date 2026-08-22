"use client";

type Step = {
  id: string;
  label: string;
  done: boolean;
  active: boolean;
  hint?: string;
};

export function RaffleWorkflowBanner({
  status,
  ticketsGenerated,
  hasInstantWins,
  setupComplete,
  onStepClick,
}: {
  status: string;
  ticketsGenerated: boolean;
  hasInstantWins: boolean;
  setupComplete?: boolean;
  onStepClick?: (tab: string) => void;
}) {
  const published = status !== "draft";
  const live = status === "listed" || status === "active";

  const steps: Step[] = [
    {
      id: "setup",
      label: "Configure raffle",
      done: setupComplete ?? false,
      active: status === "draft" && !ticketsGenerated && (setupComplete ?? false) === false,
    },
    {
      id: "instant-wins",
      label: "Instant wins",
      done: hasInstantWins,
      active: status === "draft" && !hasInstantWins && !ticketsGenerated,
      hint: hasInstantWins ? undefined : "Optional — add before generating tickets",
    },
    {
      id: "publish",
      label: "Generate ticket pool",
      done: ticketsGenerated,
      active: status === "draft" && !ticketsGenerated && (setupComplete ?? false),
      hint: ticketsGenerated ? undefined : "Required before publish",
    },
    {
      id: "publish",
      label: "Publish & go live",
      done: live,
      active: ticketsGenerated && !live && !published,
    },
  ];

  return (
    <div className="admin-workflow">
      {steps.map((step, i) => (
        <button
          key={`${step.label}-${i}`}
          type="button"
          className={`admin-workflow__step${
            step.done ? " admin-workflow__step--done" : ""
          }${step.active ? " admin-workflow__step--active" : ""}`}
          onClick={() => onStepClick?.(step.id)}
          disabled={!onStepClick}
          style={{ border: "none", cursor: onStepClick ? "pointer" : "default", textAlign: "left", font: "inherit" }}
        >
          <div className="admin-workflow__num">{step.done ? "✓" : i + 1}</div>
          <div>
            <div className="admin-workflow__label">{step.label}</div>
            {step.hint && <div className="admin-workflow__hint">{step.hint}</div>}
          </div>
        </button>
      ))}
    </div>
  );
}
