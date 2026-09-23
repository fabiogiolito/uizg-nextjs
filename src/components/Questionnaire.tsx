"use client";

import { useState, type ReactNode } from "react";
import { cx } from "./cx";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { Choice } from "./Choice";
import { Reveal } from "./Collapsible";
import { Composer } from "./Composer";
import { List, ListItem } from "./List";
import { TextPair } from "./TextPair";

export type Question = {
  id: string;
  prompt: ReactNode;
  description?: ReactNode;
  /** "choice" shows the options; "boolean" shows Yes and No. */
  type?: "choice" | "boolean";
  options?: string[];
  /** Adds an "Other" option that reveals a text field. */
  allowOther?: boolean;
  /** "inline" shows options as buttons in a row; "list" stacks them with dividers, for longer text. */
  layout?: "inline" | "list";
};

export type Answers = Record<string, string>;

export type QuestionnaireProps = {
  questions: Question[];
  onSubmit: (answers: Answers) => void;
  onCancel?: () => void;
  submitLabel?: string;
  className?: string;
};

const OTHER = "__other";

/**
 * Step-by-step questions with single-choice answers. Picking an option advances; "Other" reveals a
 * text field. A summary of all answers is shown at the end and can be edited before submitting.
 */
export function Questionnaire({ questions, onSubmit, onCancel, submitLabel = "Send answers", className }: QuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [other, setOther] = useState("");
  const [otherOpen, setOtherOpen] = useState(false);

  const total = questions.length;
  const done = step >= total;
  const q = questions[step];

  const go = (next: number) => {
    setStep(next);
    setOther("");
    setOtherOpen(false);
  };
  const answer = (value: string) => {
    setAnswers((a) => ({ ...a, [q.id]: value }));
    go(step + 1);
  };
  const back = () => go(Math.max(0, step - 1));
  const options = q ? (q.type === "boolean" ? ["Yes", "No"] : (q.options ?? [])) : [];
  const current = q ? answers[q.id] : undefined;
  const currentIsOther = current !== undefined && !options.includes(current);
  const list = q?.layout === "list";
  // onClick rather than onChange: a radio that is already checked (after going back) fires no change
  // event, but clicking it should still confirm the answer and move forward.
  const choice = (value: string, label: string, checked: boolean, onPick: () => void) => (
    <Choice
      key={value}
      inline={!list}
      variant={list ? "plain" : "default"}
      type="radio"
      name={`q-${q.id}`}
      value={value}
      title={label}
      checked={checked}
      onChange={() => {}}
      onClick={onPick}
    />
  );

  return (
    <Card
      className={cx("questionnaire", className)}
      footer={done ? <Button variant="fill" color="primary" icon="send" onClick={() => onSubmit(answers)}>{submitLabel}</Button> : undefined}
    >
      <div className="questionnaire__body">
        <div className="questionnaire__header">
          {done ? (
            <TextPair title="Review your answers" description="Edit anything before sending." className="questionnaire__question" />
          ) : (
            <TextPair title={q.prompt} description={q.description} className="questionnaire__question" />
          )}
          <div className="questionnaire__controls">
            {(step > 0 || done) && (
              <Button size="sm" variant="ghost" icon="arrowLeft" aria-label="Back" className="questionnaire__back" onClick={back} />
            )}
            <Badge>{done ? "Review" : `${step + 1} of ${total}`}</Badge>
            {onCancel && <Button size="sm" variant="ghost" icon="x" aria-label="Dismiss" onClick={onCancel} />}
          </div>
        </div>

        {done ? (
          <List bordered>
            {questions.map((item, i) => (
              <ListItem key={item.id} label={item.prompt} description={answers[item.id] ?? "Skipped"} trailing="Edit" onClick={() => go(i)} />
            ))}
          </List>
        ) : (
          <div className="questionnaire__answers">
            <div className={list ? "choice-list" : "row"}>
              {options.map((o) => choice(o, o, current === o && !otherOpen, () => answer(o)))}
              {q.allowOther &&
                choice(OTHER, "Other", otherOpen || currentIsOther, () => {
                  setOtherOpen(true);
                  if (currentIsOther) setOther(current);
                })}
            </div>
            <Reveal open={otherOpen}>
              <div className="questionnaire__other">
                <Composer
                  value={other}
                  onChange={setOther}
                  onSubmit={() => answer(other.trim())}
                  placeholder="Type your answer"
                  submitLabel="Continue"
                  submitIcon="arrowRight"
                  submitIconPosition="trailing"
                  expanded
                  focus={otherOpen}
                  ariaLabel="Your answer"
                />
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </Card>
  );
}
