"use client";

import { nanoid } from "nanoid";
import { useCallback, useRef } from "react";

import { LoadingScreen } from "~/app/_components/LoadingScreen";
import { useAutoScrollToBottom } from "~/components/hooks/useAutoScrollToBottom";
import { ScrollArea } from "~/components/ui/scroll-area";
import { TooltipProvider } from "~/components/ui/tooltip";
import { sendMessage, useInitTeamMembers, useStore } from "~/core/store";
import { cn } from "~/core/utils";
import { useTranslation } from '~/i18n/useTranslation';

import { AppHeader } from "./_components/AppHeader";
import { InputBox } from "./_components/InputBox";
import { MessageHistoryView } from "./_components/MessageHistoryView";

export default function HomePage() {
  const { t, isLoading, error, retry } = useTranslation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const messages = useStore((state) => state.messages);
  const responding = useStore((state) => state.responding);

  const handleSendMessage = useCallback(
    async (
      content: string,
      config: { deepThinkingMode: boolean; searchBeforePlanning: boolean },
    ) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      await sendMessage(
        {
          id: nanoid(),
          role: "user",
          type: "text",
          content,
        },
        config,
        { abortSignal: abortController.signal },
      );
      abortControllerRef.current = null;
    },
    [],
  );

  useInitTeamMembers();
  useAutoScrollToBottom(scrollAreaRef, responding);

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">{t('errorTitle')}</h2>
        <p className="text-muted-foreground">
          {t('errorDescription')}
        </p>
        <button
          onClick={retry}
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <ScrollArea className="h-screen w-full" ref={scrollAreaRef}>
        <div className="flex min-h-screen flex-col items-center">
          <header className="sticky top-0 right-0 left-0 z-10 flex h-16 w-full items-center px-4 backdrop-blur-sm">
            <AppHeader />
          </header>
          <main className="w-full flex-1 px-4 pb-48">
            <MessageHistoryView
              className="w-page mx-auto"
              messages={messages}
              loading={responding}
            />
          </main>
          <footer
            className={cn(
              "fixed bottom-4 transition-transform duration-500 ease-in-out",
              messages.length === 0
                ? "w-[640px] translate-y-[-34vh]"
                : "w-page",
            )}
          >
            {messages.length === 0 && (
              <div className="flex w-[640px] translate-y-[-32px] flex-col">
                <h3 className="mb-2 text-center text-3xl font-medium">
                  {t('greeting')}
                </h3>
                <div className="px-4 text-center text-lg text-gray-400">
                  <a
                    href="https://github.com/langmanus/langmanus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-600"
                  >
                    {t('appTitle')}
                  </a>
                  {t('description')}
                </div>
              </div>
            )}
            <div className="flex flex-col overflow-hidden rounded-[24px] border bg-white shadow-lg">
              <InputBox
                size={messages.length === 0 ? "large" : "normal"}
                responding={responding}
                onSend={handleSendMessage}
                onCancel={() => {
                  abortControllerRef.current?.abort();
                  abortControllerRef.current = null;
                }}
              />
            </div>
            <div className="w-page absolute bottom-[-32px] h-8 backdrop-blur-xs" />
          </footer>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
