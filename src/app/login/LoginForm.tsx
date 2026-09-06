"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, EyeOff, Eye, ArrowLeft, Loader2, BookOpen } from "lucide-react";
import Image from "next/image";

interface LoginFormProps {
  logoUrl: string | null;
}

export default function LoginForm({ logoUrl }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Login gagal. Periksa username dan password Anda.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      {/* Left Panel - Blue Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-[#1DA1F2] relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="relative z-10 flex flex-col items-center px-12 text-center text-white">
          <div className="flex items-center space-x-3 mb-8">
            {logoUrl ? (
              <div className="relative w-48 h-24 flex items-center justify-center">
                <Image src={logoUrl} alt="Logo Tabia" fill unoptimized className="object-contain brightness-0 invert" />
              </div>
            ) : (
              <BookOpen className="w-16 h-16 text-white" />
            )}
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Portal Operasional Tabia Team
          </h2>
          <p className="text-lg text-white/90">
            Manajemen Internal & Kolaborasi Tim
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 p-8 sm:p-12 xl:p-24 relative">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Login Admin</h2>
            <p className="text-slate-500">Silakan masuk untuk mengakses portal internal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Username Input */}
            <div className="relative border-b border-slate-300 focus-within:border-blue-500 transition-colors">
              <label className="text-xs font-bold text-slate-600 tracking-wider mb-2 block">
                USERNAME
              </label>
              <div className="flex items-center">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-transparent border-none p-0 pb-2 text-slate-800 focus:ring-0 focus:outline-none" 
                />
                <User className="w-5 h-5 text-slate-400 mb-2 ml-2" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative border-b border-slate-300 focus-within:border-blue-500 transition-colors">
              <label className="text-xs font-bold text-slate-600 tracking-wider mb-2 block">
                KATA SANDI
              </label>
              <div className="flex items-center">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-none p-0 pb-2 text-slate-800 focus:ring-0 focus:outline-none" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none mb-2 ml-2"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center pt-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-[#1DA1F2] focus:ring-[#1DA1F2]" 
                />
                <span className="text-sm text-slate-600">Ingat Saya</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 rounded-full text-sm font-bold text-white bg-[#1DA1F2] hover:bg-[#1a91da] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DA1F2] disabled:opacity-70 transition-colors mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Memproses...
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </button>
          </form>

          {/* Back to Home Link */}
          <div className="mt-8 flex justify-center">
            <a href="https://rumahtahfidztabia.com" target="_blank" rel="noreferrer" className="flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda Utama
            </a>
          </div>

        </div>

        {/* Copyright */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Ops Rumah Tahfidz Tabia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
