'use client';

export function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-card px-6">
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">TikTok Video Generator</h1>
          <p className="text-sm text-muted-foreground">
            Create AI-powered videos for TikTok promotion
          </p>
        </div>
      </div>
    </header>
  );
}
