import { LoadingAnimation } from './LoadingAnimation';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <LoadingAnimation className="h-16 w-16" />
    </div>
  );
}
