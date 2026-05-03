import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { ActiveNoteHeader } from "@/components/ActiveNoteHeader";

export default function Home() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar - Navigation & Hierarchy */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-y-auto">
        <header className="h-14 border-b border-border flex items-center px-6 shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <ActiveNoteHeader />
        </header>

        <div className="flex-1 w-full max-w-4xl mx-auto p-8 lg:p-12">
          <Editor />
        </div>
      </div>
    </main>
  );
}
