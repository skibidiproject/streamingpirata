// src/app/dashboard/loading.tsx

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Spinner animato */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-stone-800"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-500  border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
