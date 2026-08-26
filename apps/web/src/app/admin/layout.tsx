import "./admin.css";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import { OperatorAuthBootstrap } from "@/components/admin/OperatorAuthBootstrap";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="admin-root">
      <OperatorAuthBootstrap />
      <AdminToastProvider>{children}</AdminToastProvider>
    </div>
  );
}

