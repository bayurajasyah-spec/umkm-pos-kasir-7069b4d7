import { Link, useRouterState } from "@tanstack/react-router";
import {
  Home, ShoppingCart, History, Package, Settings as SettingsIcon,
  BarChart3, Wallet, Users, BookOpen, Store, Wifi, WifiOff, LogIn, LogOut,
  Utensils, FileText, Calculator, Banknote, Boxes, UserCheck, Landmark, HeartHandshake,
  Menu, X, ChevronDown, LayoutDashboard, ClipboardList, Tag, Truck, ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStoreSettings, useTransactions, formatCurrency } from "@/lib/nota-store";
import { useAuth } from "@/lib/auth-context";

const navGroups = [
  { label: "UTAMA", items: [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/transaction", label: "Kasir / POS", icon: ShoppingCart, featured: true },
    { to: "/history", label: "Riwayat Transaksi", icon: ClipboardList },
  ] },
  { label: "OPERASIONAL", items: [
    { to: "/products", label: "Produk & Menu", icon: Package },
    { to: "/inventory", label: "Inventory & Stok", icon: Boxes },
    { to: "/tables", label: "Meja F&B", icon: Utensils },
    { to: "/invoices", label: "Invoice B2B", icon: FileText },
    { to: "/hpp", label: "Kalkulator HPP", icon: Calculator },
  ] },
  { label: "PELANGGAN & KEUANGAN", items: [
    { to: "/crm", label: "CRM & Loyalty", icon: HeartHandshake },
    { to: "/members", label: "Member", icon: Users },
    { to: "/accounting", label: "Akuntansi", icon: Landmark },
    { to: "/ledger", label: "Mutasi Saldo", icon: Wallet },
    { to: "/kasbon", label: "Kasbon", icon: BookOpen },
    { to: "/payments", label: "Pembayaran", icon: Banknote },
  ] },
  { label: "LAINNYA", items: [
    { to: "/reports", label: "Laporan", icon: BarChart3 },
    { to: "/employees", label: "Karyawan & Shift", icon: UserCheck },
    { to: "/catalog", label: "Toko Online", icon: Store },
    { to: "/settings", label: "Pengaturan", icon: SettingsIcon },
  ] },
] as const;


function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const upd = () => setOnline(navigator.onLine);
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);
  return online;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [settings] = useStoreSettings();
  const [transactions] = useTransactions();
  const online = useOnline();
  const [mobileOpen, setMobileOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const todayTxs = transactions.filter((t) => (t.date || "").slice(0, 10) === today);
  const todayTotal = todayTxs.reduce((s, t) => s + (t.total || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex min-h-screen">
        {mobileOpen && <button aria-label="Tutup menu" className="fixed inset-0 z-40 bg-slate-950/60 md:hidden" onClick={() => setMobileOpen(false)} />}
        <aside className={`${mobileOpen ? "flex" : "hidden"} md:flex fixed md:static inset-y-0 left-0 z-50 w-72 shrink-0 flex-col bg-[#24105f] text-white p-4 shadow-2xl md:shadow-none`}>
          <button aria-label="Tutup menu" onClick={() => setMobileOpen(false)} className="absolute right-4 top-5 md:hidden text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
          <div className="px-2 py-4 flex items-center gap-3">
            {settings.logo ? (
              <img src={settings.logo} alt="Logo" className="h-10 w-10 rounded object-cover bg-white" />
            ) : (
              <div className="h-10 w-10 rounded bg-blue-600 flex items-center justify-center font-bold text-xs">BY</div>
            )}
            <div>
              <h1 className="text-lg font-bold leading-tight">BY.UMKMKASIR</h1>
              <p className="text-[10px] text-slate-400">v3.0 · UMKM</p>
            </div>
          </div>
          <div className={`mx-2 mb-2 text-[10px] font-medium px-2 py-1 rounded inline-flex items-center gap-1 w-fit ${online ? "bg-green-900/40 text-green-300" : "bg-orange-900/40 text-orange-300"}`}>
            {online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {online ? "Online" : "Offline — sync pending"}
          </div>
          <nav className="mt-4 flex-1 flex flex-col gap-5 overflow-y-auto pr-1">
            {navGroups.map((group) => <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.16em] text-violet-300/60">{group.label}</p>
              <div className="flex flex-col gap-1">{group.items.map(({ to, label, icon: Icon, featured }) => {
                const active = pathname === to;
                return <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${active ? "bg-[#ffe51b] text-[#24105f] font-bold shadow-lg shadow-yellow-500/20" : featured ? "bg-white/10 text-white font-semibold hover:bg-white/15" : "text-violet-100/75 hover:bg-white/10 hover:text-white"}`}>
                  <Icon className="h-[18px] w-[18px]" />{label}{featured && <span className="ml-auto h-2 w-2 rounded-full bg-[#ffe51b]" />}
                </Link>;
              })}</div>
            </div>)}
          </nav>
          <div className="mt-auto border-t border-slate-800 pt-4 px-2 text-xs text-slate-400">
            <p>Hari ini</p>
            <p className="text-white font-semibold text-sm">{formatCurrency(todayTotal)}</p>
            <p>{todayTxs.length} transaksi</p>
            <UserBox />
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="md:hidden bg-[#24105f] text-white px-4 py-3 flex items-center gap-3">
            <button aria-label="Buka menu" onClick={() => setMobileOpen(true)} className="p-1"><Menu className="h-6 w-6" /></button>
            {settings.logo ? <img src={settings.logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover bg-white" /> : <div className="h-8 w-8 rounded-lg bg-[#ffe51b] text-[#24105f] flex items-center justify-center font-black text-xs">BY</div>}
            <h1 className="text-base font-bold flex-1">BY.UMKMKASIR</h1>
            <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${online ? "bg-emerald-500/20 text-emerald-200" : "bg-orange-500/20 text-orange-200"}`}>{online ? "Online" : "Offline"}</span>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function UserBox() {
  const { user, roles, signOut } = useAuth();
  if (!user) {
    return (
      <Link to="/login" className="mt-3 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-2 text-xs font-medium">
        <LogIn className="h-3.5 w-3.5" /> Masuk / Daftar
      </Link>
    );
  }
  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <p className="text-white text-xs font-medium truncate">{user.email}</p>
      <p className="text-[10px] text-blue-300 uppercase">{roles[0] ?? "user"}</p>
      <button onClick={signOut} className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white">
        <LogOut className="h-3 w-3" /> Keluar
      </button>
    </div>
  );
}
