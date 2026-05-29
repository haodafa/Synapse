"use client";

import { DashboardLayout } from "@synapse/views/layout";
import { SynapseIcon } from "@synapse/ui/components/common/synapse-icon";
import { SearchCommand, SearchTrigger } from "@synapse/views/search";
import { ChatFab, ChatWindow } from "@synapse/views/chat";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout
      loadingIndicator={<SynapseIcon className="size-6" />}
      searchSlot={<SearchTrigger />}
      extra={
        <>
          <SearchCommand />
          <ChatWindow />
          <ChatFab />
        </>
      }
    >
      {children}
    </DashboardLayout>
  );
}
