'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function handlePinInput(num: string) {
    if (pin.length >= 4) return
    const newPin = pin + num
    setPin(newPin)
    setError(false)

    if (newPin.length === 4) {
      if (newPin === '9999') {
        router.push('/home')
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => {
          setPin('')
          setShake(false)
        }, 600)
      }
    }
  }

  function handleDelete() {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-indigo-900 flex flex-col items-center justify-center">

      {/* 무빙 백그라운드 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <style>{`
          @keyframes moveDiagonal {
            0% { transform: translate(0, 0); }
            100% { transform: translate(200px, 200px); }
          }
          .moving-bg {
            animation: moveDiagonal 6s linear infinite;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-10px); }
            40% { transform: translateX(10px); }
            60% { transform: translateX(-10px); }
            80% { transform: translateX(10px); }
          }
          .shake {
            animation: shake 0.5s ease-in-out;
          }
        `}</style>
        <div className="moving-bg" style={{
          position: 'absolute',
          top: '-200px',
          left: '-200px',
          width: 'calc(100% + 400px)',
          height: 'calc(100% + 400px)',
          backgroundImage: 'url(/mark.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 67px',
          opacity: 0.15,
        }} />
      </div>

      {/* 로고 */}
      <div className="relative z-10 text-center mb-10">
        <div className="flex justify-center mb-4">
          <img src="/icon-192x192.png" style={{width: '150px', height: '96px'}} className="rounded-3xl shadow-2xl" />

        </div>
        <h1 className="text-3xl font-bold text-white">JH Forum</h1>
        <p className="text-indigo-300 mt-2 text-lg font-medium">우리들의 소중한 모임 기록</p>

        <p className="text-indigo-400 mt-1 text-sm">Since 30+ Years</p>
      </div>

      {/* PIN 입력 */}
      <div className={`relative z-10 ${shake ? 'shake' : ''}`}>

        {/* 점 표시 */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              i < pin.length
                ? error ? 'bg-red-400 border-red-400' : 'bg-white border-white'
                : 'bg-transparent border-white/40'
            }`} />
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">비밀번호가 틀렸어요</p>
        )}

        {/* 숫자 키패드 */}
        <div className="grid grid-cols-3 gap-3 w-72">
          {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
            <button
              key={i}
              onClick={() => {
                if (key === '⌫') handleDelete()
                else if (key !== '') handlePinInput(key)
              }}
              className={`h-16 rounded-2xl text-xl font-semibold transition-all duration-150 ${
                key === ''
                  ? 'invisible'
                  : key === '⌫'
                  ? 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
                  : 'bg-white/10 text-white hover:bg-white/20 active:scale-95 active:bg-white/30'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* 숨겨진 input - 모바일 숫자 키보드용 */}
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={pin}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 4)
            setPin(val)
            if (val.length === 4) {
              if (val === '9999') {
                router.push('/home')
              } else {
                setShake(true)
                setError(true)
                setTimeout(() => { setPin(''); setShake(false) }, 600)
              }
            }
          }}
          className="opacity-0 absolute w-0 h-0"
        />
      </div>
    </main>
  )
}