import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WikiEmptyPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const isSuperadmin = role === "SUPERADMIN";

  return (
    <div className="flex items-center justify-center h-full min-h-[50vh]">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-700 mb-2">Wiki / Dokumen Internal</h2>
        <p className="text-slate-500 mb-6">
          Pilih halaman dari navigasi di sebelah kiri untuk membaca {isSuperadmin ? "atau mengedit " : ""}kontennya.
        </p>
        <div className="p-6 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-sm">
          Gunakan Wiki ini untuk membaca SOP, pedoman tim, atau materi onboarding yang berlaku untuk tim Anda.
        </div>
      </div>
    </div>
  );
}
