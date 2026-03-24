import { Spinner } from "./spinner";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ message = "Зареждане...", fullScreen = false }: LoadingScreenProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-dashed">
      {content}
    </div>
  );
}
