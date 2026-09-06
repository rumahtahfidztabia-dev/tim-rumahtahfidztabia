import { prisma } from "@/lib/prisma";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const siteSetting = await prisma.siteSetting.findFirst();

  // Ambil logo, prioritas logoLight, jika tidak ada pakai logoDark, jika tidak ada null
  const logoUrl = siteSetting?.logoLight || siteSetting?.logoDark || null;

  return <LoginForm logoUrl={logoUrl} />;
}
