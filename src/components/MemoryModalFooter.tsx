import { DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export function MemoryModalFooter({ count, onClose }: { count: number; onClose: () => void }) {
  return (
    <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
      <div className="flex-1 text-xs text-muted-foreground flex items-center">
        {count} information{count > 1 ? 's' : ''} mémorisée{count > 1 ? 's' : ''}
      </div>
      <Button onClick={onClose} variant="secondary" aria-label="Fermer" className="px-6">
        Fermer
      </Button>
    </DrawerFooter>
  );
} 