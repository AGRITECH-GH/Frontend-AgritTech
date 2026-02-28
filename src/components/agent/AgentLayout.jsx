import AgentSidebar from "@/components/agent/AgentSidebar";

/**
 * AgentLayout – wraps agent pages with the collapsible sidebar.
 *
 * @param {{ agent: object, children: React.ReactNode }} props
 */
const AgentLayout = ({ agent, children }) => (
  <div className="flex h-screen overflow-hidden bg-surface">
    <AgentSidebar agent={agent} />

    {/* Main content area – only this scrolls */}
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  </div>
);

export default AgentLayout;
