"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveAction, rejectAction } from "./actions";

export function ApprovalActions({ studentId }: { studentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <Button
        disabled={pending}
        onClick={() => startTransition(() => approveAction(studentId))}
      >
        Approve
      </Button>
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => startTransition(() => rejectAction(studentId))}
      >
        Reject
      </Button>
    </div>
  );
}
