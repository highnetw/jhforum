'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Member = {
    id: string
    name: string
    is_regular: boolean
}

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([])
    const [newName, setNewName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchMembers() }, [])

    async function fetchMembers() {
        const { data } = await supabase
            .from('jhf_members')
            .select('*')
            .order('is_regular', { ascending: false })
            .order('name')
        if (data) setMembers(data)
        setLoading(false)
    }
    async function addMember() {
        if (!newName.trim()) return
        await supabase.from('jhf_members').insert({ name: newName.trim(), is_regular: false })
        setNewName('')
        fetchMembers()
    }

    async function deleteMember(id: string) {
        if (!confirm('삭제할까요?')) return
        await supabase.from('jhf_members').delete().eq('id', id)
        fetchMembers()
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <header className="bg-indigo-900 text-white px-4 py-5 flex items-center gap-3">
                <a href="/home" className="text-indigo-300 text-sm">← 홈</a>
                <h1 className="text-xl font-bold">👥 회원 관리</h1>
            </header>

            <div className="max-w-lg mx-auto p-4">
                {loading ? (
                    <p className="text-center text-slate-400 mt-10">불러오는 중...</p>
                ) : (
                    <div className="space-y-2 mt-4">
                        {members.map(m => (
                            <div key={m.id} className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm border border-slate-200">
                                <div className="flex items-center gap-2">
                                    <span>{m.is_regular ? '⭐' : '👤'}</span>
                                    <span className="font-medium">{m.name}</span>
                                    {m.is_regular && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">고정멤버</span>}
                                </div>
                                <button onClick={() => deleteMember(m.id)}
                                    className="text-red-400 text-sm border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-sm font-medium text-indigo-900 mb-3">새 회원 추가</p>
                    <div className="flex gap-2">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && addMember()}
                            placeholder="이름 입력"
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
                        <button onClick={addMember}
                            className="bg-indigo-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">추가</button>
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">⭐ 고정멤버는 Supabase에서 is_regular 수정 가능</p>
            </div>
        </main>
    )
}