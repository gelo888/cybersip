"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  onConfirm: () => void
  isPending: boolean
  error?: string | null
}

export function DeleteConfirmDialog({ open, onOpenChange, entityName, onConfirm, isPending, error }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {entityName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove <strong>{entityName}</strong> from your portfolio.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin mr-2" />}
            Delete
          </Button>
        </DialogFooter>

        {error && (
          <p className="text-sm text-sophos-red text-center">{error}</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
