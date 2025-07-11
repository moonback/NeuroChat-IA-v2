import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { BookOpen } from "lucide-react";

export function MemoryModalHeader() {
  return (
    <DrawerHeader className="pb-2">
      <div className="flex items-center gap-2">
        <div className="bg-blue-500 p-2 rounded-full shadow">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <DrawerTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
          Mémoire de l'utilisateur
        </DrawerTitle>
      </div>
      <div className="text-xs text-muted-foreground text-center max-w-xs mx-auto mt-1">
        Ajoutez, modifiez ou supprimez les informations mémorisées par l'IA. Ces informations sont utilisées pour personnaliser vos réponses.
      </div>
    </DrawerHeader>
  );
} 