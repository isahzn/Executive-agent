import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import "./admin-login.css";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <main className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <span className="admin-login__monogram" aria-hidden>
            BT
          </span>
          <div>
            <p className="admin-login__name">Bantex Trading</p>
            <p className="admin-login__sub">Admin dashboard</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
