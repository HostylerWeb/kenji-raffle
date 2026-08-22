import "./admin.css";
import "./admin-modern.css";
import { AdminToastProvider } from "@/components/admin/AdminToast";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-root">
      <AdminToastProvider>{children}</AdminToastProvider>
    </div>
  );
}

