export interface ProcessStepItem {
  stepNumber: number;
  titleBn: string;
  descriptionBn: string;
}

interface ProcessStepsProps {
  steps: ProcessStepItem[];
  columns?: 3 | 4;
}

export function ProcessSteps({ steps, columns = 4 }: ProcessStepsProps) {
  return (
    <ol
      className={`grid grid-cols-1 sm:grid-cols-2 ${
        columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
      } gap-5`}
    >
      {steps.map((step) => (
        <li
          key={step.stepNumber}
          className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3 shadow-[0_2px_10px_rgba(11,23,38,0.03)]"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-ps-navy text-ps-white font-en text-sm font-bold">
              0{step.stepNumber}
            </span>
            <span className="h-px flex-1 ms-3 bg-ps-gold/50" aria-hidden="true" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-ps-navy">
            {step.titleBn}
          </h3>
          <p className="text-sm text-ps-ink/85 leading-relaxed">
            {step.descriptionBn}
          </p>
        </li>
      ))}
    </ol>
  );
}
