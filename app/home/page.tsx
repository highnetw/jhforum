export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-indigo-900 text-white text-center py-10">
        <div className="flex justify-center mb-3">
          <img src="/icon-192x192.png" className="w-16 h-16 rounded-2xl shadow-lg" />
        </div>
        <h1 className="text-3xl font-bold">JH Forum</h1>
        <p className="text-indigo-300 mt-2 text-sm">우리들의 소중한 모임 기록</p>
      </header>

      <div className="max-w-lg mx-auto p-4 mt-6 space-y-4">
        <a href="/meetings" className="block bg-white rounded-xl p-5 shadow border border-slate-200 hover:shadow-md transition">
          <div className="text-2xl mb-2">📋</div>
          <div className="font-bold text-indigo-900 text-lg">모임 기록</div>
          <div className="text-slate-500 text-sm mt-1">만남을 기록하고 추억을 쌓아요</div>
        </a>

        <a href="/members" className="block bg-white rounded-xl p-5 shadow border border-slate-200 hover:shadow-md transition">
          <div className="text-2xl mb-2">👥</div>
          <div className="font-bold text-indigo-900 text-lg">회원 관리</div>
          <div className="text-slate-500 text-sm mt-1">멤버를 추가하고 관리해요</div>
        </a>
      </div>
    </main>
  )
}