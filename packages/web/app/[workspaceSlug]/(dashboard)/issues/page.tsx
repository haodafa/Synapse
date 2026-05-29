"use client";

import { IssuesPage } from "@synapse/views/issues/components";
import { ErrorBoundary } from "@synapse/ui/components/common/error-boundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <IssuesPage />
    </ErrorBoundary>
  );
}
