'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState('')

  function handlePin(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(val)
    setError(false)
    if (val.length === 4) {
      if (val === '9999') {
        setAuthed(true)
      } else {
        setError(true)
        setTimeout(() => setPin(''), 600)
      }
    }
  }

  async function handleBackup() {
    setLoading(true)
    setDone('')

    try {
      // 모든 테이블 데이터 가져오기
      const [
        { data: members },
        { data: venues },
        { data: meetings },
        { data: attendance },
        { data: photos },
        { data: moments },
      ] = await Promise.all([
        supabase.from('jhf_members').select('*').order('created_at'),
        supabase.from('jhf_venues').select('*').order('created_at'),
        supabase.from('jhf_meetings').select('*').order('meeting_date'),
        supabase.from('jhf_meeting_attendance').select('*'),
        supabase.from('jhf_photos').select('*'),
        supabase.from('jhf_moments').select('*').order('created_at'),
      ])

      const backup = {
        backup_date: new Date().toISOString(),
        app: 'JH Forum',
        version: '1.0',
        data: {
          jhf_members: members || [],
          jhf_venues: venues || [],
          jhf_meetings: meetings || [],
          jhf_meeting_attendance: attendance || [],
          jhf_photos: photos || [],
          jhf_moments: moments || [],
        },
        summary: {
          members: members?.length || 0,
          venues: venues?.length || 0,
          meetings: meetings?.length || 0,
          attendance: attendance?.length || 0,
          photos: photos?.length || 0,
          moments: moments?.length || 0,
        }
      }

      // JSON 파일 다운로드
      const json = JSON.stringify(backup, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const dateStr = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `jhforum_backup_${dateStr}.json`
      a.click()
      URL.revokeObjectURL(url)

      setDone(`✅ 백업 완료! 총 ${meetings?.length || 0}개 모임, ${members?.length || 0}명 회원`)
    } catch (err) {
      setDone('❌ 백업 실패. 다시 시도해주세요.')
    }

    setLoading(false)
  }

  if (!authed) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow border border-slate-200 w-80">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-indigo-900">관리자 모드</h1>
            <p className="text-slate-400 text-sm mt-1">PIN을 입력하세요</p>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pin}
            onChange={handlePin}
            placeholder="••••"
            maxLength={4}
            className={`w-full border-2 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none transition ${
              error ? 'border-red-400 text-red-400' : 'border-slate-200 focus:border-indigo-500'
            }`}
          />
          {error && <p className="text-red-400 text-sm text-center mt-2">비밀번호가 틀렸어요</p>}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-indigo-900 text-white px-4 py-5 flex items-center gap-3">
        <a href="/home" className="text-indigo-300 text-sm">← 홈</a>
        <h1 className="text-xl font-bold">⚙️ 관리자</h1>
      </header>

      <div className="max-w-lg mx-auto p-4 mt-6 space-y-4">

        {/* 백업 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow border border-slate-200">
          <div className="text-2xl mb-2">💾</div>
          <h2 className="text-lg font-bold text-indigo-900 mb-1">DB 백업</h2>
          <p className="text-slate-500 text-sm mb-4">
            모든 모임 기록, 회원, 장소, 사진 경로, 명언을 JSON 파일로 다운로드합니다.
          </p>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full bg-indigo-800 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? '백업 중...' : '📥 전체 백업 다운로드'}
          </button>
          {done && (
            <p className={`mt-3 text-sm text-center font-medium ${done.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {done}
            </p>
          )}
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-xs text-amber-700 font-medium mb-1">📌 백업 안내</p>
          <ul className="text-xs text-amber-600 space-y-1">
            <li>• 사진 파일은 Supabase Storage에 보관됩니다</li>
            <li>• JSON 파일에는 사진 경로(URL)만 포함됩니다</li>
            <li>• 정기적으로 백업하는 것을 권장합니다</li>
          </ul>
        </div>

      </div>
    </main>
  )
}