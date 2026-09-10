import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import "../admin.css";

export const metadata = {
  title: "Admin",
  robots: { index: false },
};

// Server-side guard: any page nested under /admin/(dashboard) is only reachable
// with a valid admin session; otherwise the user is redirected to /admin/login.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar__title">Admin dashboard</span>
          <a className="admin-topbar__site" href="/" target="_blank" rel="noreferrer">
            View site ↗
          </a>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
