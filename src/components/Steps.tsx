import { cx } from "./cx";

export type StepsProps = {
  total: number;
  /** 1-based; steps up to and including this one are filled. 0 for none. */
  current: number;
  className?: string;
};

/** A row of dots showing progress through a fixed number of steps. */
export function Steps({ total, current, className }: StepsProps) {
  return (
    <div className={cx("steps", className)} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx("steps__dot", i < current && "steps__dot--done")} />
      ))}
    </div>
  );
}
