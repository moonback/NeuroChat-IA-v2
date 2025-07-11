import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";

export function MemorySearchExportBar({ search, setSearch, onExport }: { search: string; setSearch: (v: string) => void; onExport: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans la mémoire..."
          className="pl-10 text-sm"
          aria-label="Rechercher dans la mémoire"
        />
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExport} 
        title="Exporter la mémoire" 
        aria-label="Exporter la mémoire"
        className="px-3 sm:px-4"
      >
        <Download className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Exporter</span>
      </Button>
    </div>
  );
} 