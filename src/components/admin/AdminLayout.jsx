import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * AdminLayout – pins the sidebar and lets only the main content scroll.
 *
 * @param {{ admin: object, children: React.ReactNode }} props
 */
const AdminLayout = ({ admin, children }) => (
  <div className="flex h-screen overflow-hidden bg-surface">
    <AdminSidebar admin={admin} />
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      {children}
    </div>
  </div>
);

export default AdminLayout;
