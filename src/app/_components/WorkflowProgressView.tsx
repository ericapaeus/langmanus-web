import { parse } from "best-effort-json-parser";
import { useMemo, useRef, useState } from "react";


import { useAutoScrollToBottom } from "~/components/hooks/useAutoScrollToBottom";
import { useOnStateChangeEffect } from "~/components/hooks/useOnStateChangeEffect";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Atom } from "~/core/icons";
import { cn } from "~/core/utils";
import {
  type ThinkingTask,
  type Workflow,
} from "~/core/workflow";
import { useTranslation } from '~/i18n/useTranslation';

import { Markdown } from "./Markdown";
import { ToolCallView } from "./ToolCallView";

export function WorkflowProgressView({
  className,
  workflow,
}: {
  className?: string;
  workflow: Workflow;
}) {
  const mainRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => {
    return workflow.steps.filter((step) => step.agentName !== "reporter");
  }, [workflow]);
  const reportStep = useMemo(() => {
    return workflow.steps.find((step) => step.agentName === "reporter");
  }, [workflow]);

  useAutoScrollToBottom(mainRef, !workflow.isCompleted);
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("flex overflow-hidden rounded-2xl border", className)}>
        <aside className="flex w-[220px] shrink-0 flex-col border-r bg-[rgba(0,0,0,0.02)]">
          <div className="shrink-0 px-4 py-4 font-medium">{t('flow')}</div>
          <ol className="flex grow list-disc flex-col gap-4 px-4 py-2">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex cursor-pointer items-center gap-2"
                onClick={() => {
                  const element = document.getElementById(step.id);
                  if (element) {
                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
              >
                <div className="flex h-2 w-2 rounded-full bg-gray-400"></div>
                <div>{t(step.agentName + '-step')}</div>
              </li>
            ))}
          </ol>
        </aside>
        <main className="grow overflow-auto bg-white p-4" ref={mainRef}>
          <ul className="flex flex-col gap-4">
            {steps.map((step, stepIndex) => (
              <li key={step.id} className="flex flex-col gap-2">
                <h3 id={step.id} className="ml-[-4px] text-lg font-bold">
                  📍 {t('step')} {stepIndex + 1}: {t(step.agentName + '-step')}
                </h3>
                <ul className="flex flex-col gap-2">
                  {step.tasks
                    .filter(
                      (task) =>
                        !(
                          task.type === "thinking" &&
                          !task.payload.text &&
                          !task.payload.reason
                        ),
                    )
                    .map((task) =>
                      task.type === "thinking" &&
                      step.agentName === "planner" ? (
                        <PlanTaskView key={task.id} task={task} />
                      ) : (
                        <li key={task.id} className="flex">
                          {task.type === "thinking" ? (
                            <Markdown
                              className="pl-6 opacity-70"
                              style={{
                                fontSize: "smaller",
                              }}
                            >
                              {task.payload.text}
                            </Markdown>
                          ) : (
                            <ToolCallView task={task} />
                          )}
                        </li>
                      ),
                    )}
                </ul>
                {stepIndex < steps.length - 1 && <hr className="mt-8 mb-4" />}
              </li>
            ))}
          </ul>
        </main>
      </div>
      {reportStep && (
        <div className="flex flex-col gap-4 p-4">
          <Markdown enableCopy={workflow.isCompleted}>
            {reportStep.tasks[0]?.type === "thinking"
              ? reportStep.tasks[0].payload.text
              : ""}
          </Markdown>
        </div>
      )}
    </div>
  );
}

function PlanTaskView({ task }: { task: ThinkingTask }) {
  const [isThinkingCollapsed, setIsThinkingCollapsed] = useState(false);

  const plan = useMemo<{
    title?: string;
    steps?: { title?: string; description?: string }[];
  }>(() => {
    if (task.payload.text) {
      let jsonString = task.payload.text.trim();
      if (jsonString.startsWith("```json\n")) {
        jsonString = jsonString.substring(7);
      } else if (jsonString.startsWith("```ts\n")) {
        jsonString = jsonString.substring(5);
      }
      if (jsonString.endsWith("\n```")) {
        jsonString = jsonString.substring(0, jsonString.length - 3);
      }
      try {
        return parse(jsonString);
      } catch {
        return {};
      }
    }
    return {};
  }, [task]);
  const reason = task.payload.reason;
  const markdown = `## ${plan.title ?? ""}\n\n${plan.steps?.map((step) => `- **${step.title ?? ""}**\n\n${step.description ?? ""}`).join("\n\n") ?? ""}`;
  const { t } = useTranslation();

  useOnStateChangeEffect(
    // TODO: switch to thinking state
    task.state,
    {
      from: "pending",
      to: "success",
    },
    () => {
      setIsThinkingCollapsed(true);
    },
  );

  return (
    <li key={task.id} className="flex flex-col">
      {reason && (
        <Accordion
          type="single"
          collapsible
          className="mb-2"
          value={isThinkingCollapsed ? "" : "deep-thought"}
          onValueChange={(value) => {
            setIsThinkingCollapsed(value === "");
          }}
        >
          <AccordionItem value="deep-thought" className="border-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <AccordionTrigger className="flex w-fit flex-none items-center gap-2 rounded-2xl border px-3 py-1 text-sm hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  <Atom className="h-4 w-4" />
                  <span>{t('deepThought')}</span>
                </AccordionTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{isThinkingCollapsed ? t("showThought") : t("hideThought")}</p>
              </TooltipContent>
            </Tooltip>
            <AccordionContent>
              <Markdown className="border-l-2 pt-2 pl-6 text-sm opacity-70">
                {reason}
              </Markdown>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div>
        <Markdown className="pl-6">{markdown ?? ""}</Markdown>
      </div>
    </li>
  );
}
