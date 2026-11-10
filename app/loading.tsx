import Image from "next/image";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 border border-[#D5DDEB] shadow-sm flex flex-col items-center text-center max-w-xs w-full space-y-4 animate-pulse">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <Image
            src="/images/logo-sahabat-belajar.png"
            alt="Sahabat Belajar"
            width={64}
            height={64}
            className="object-contain"
            priority
          />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-heading font-bold text-base text-[#09408C]">
            Sahabat Belajar
          </h3>
          <p className="text-xs text-[#5B6882]">
            Menyiapkan data bimbingan...
          </p>
        </div>

        {/* Loading Spinner */}
        <div className="w-6 h-6 border-2 border-[#D5DDEB] border-t-[#09408C] rounded-full animate-spin" />
      </div>
    </div>
  );
}
