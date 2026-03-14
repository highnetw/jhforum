'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Member = {
  id: string
  name: string
  is_regular: boolean
}

type Meeting = {
  id: string
  meeting_date: string
  food_name: string
  food_review: string
  total_cost: number
  venue_id: string
  second_venue_id: string
  jhf_venues: { name: string; address: string; cuisine: string } | null
  second_venue: { name: string; address: string; cuisine: string } | null
  jhf_meeting_attendance: { jhf_members: { id: string; name: string } }[]
  jhf_photos: { type: string; storage_path: string; order_index: number }[]
  jhf_moments: { content: string; member_id: string; jhf_members: { name: string } }[]
}

export default function MeetingsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
    fetchMeetings()
  }, [])

  async function fetchMembers() {
    const { data } = await supabase
      .from('jhf_members')
      .select('*')
      .order('is_regular', { ascending: false })
      .order('name')
    if (data) setMembers(data)
  }

  async function fetchMeetings() {
    const { data } = await supabase
      .from('jhf_meetings')
      .select(`
        *,
        jhf_venues!jhf_meetings_venue_id_fkey ( name, address, cuisine ),
        second_venue:jhf_venues!jhf_meetings_second_venue_id_fkey ( name, address, cuisine ),
        jhf_meeting_attendance ( jhf_members ( id, name ) ),
        jhf_photos ( type, storage_path, order_index ),
        jhf_moments ( content, member_id, jhf_members ( name ) )
      `)
      .order('meeting_date', { ascending: false })
    if (data) setMeetings(data as any)
    setLoading(false)
  }

  async function deleteMeeting(id: string) {
    if (!confirm('이 기록을 삭제할까요?')) return
    await supabase.from('jhf_meetings').delete().eq('id', id)
    fetchMeetings()
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-indigo-900 text-white px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/home" className="text-indigo-300 text-sm">← 홈</a>
          <h1 className="text-xl font-bold">📋 모임 기록</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500"
        >
          ＋ 새 기록
        </button>
      </header>

      <div className="max-w-lg mx-auto p-4">
        {loading ? (
          <p className="text-center text-slate-400 mt-16">불러오는 중...</p>
        ) : meetings.length === 0 ? (
          <div className="text-center text-slate-400 mt-16">
            <div className="text-5xl mb-4">💬</div>
            <p className="font-medium text-slate-500">아직 기록이 없어요</p>
            <p className="text-sm mt-2">위의 ＋ 새 기록 버튼을 눌러주세요</p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {meetings.map(m => (
              <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                {/* 카드 헤더 */}
                <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 px-4 py-3">
                  <div className="text-white font-bold">{formatDate(m.meeting_date)}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.jhf_meeting_attendance?.map(a => (
                      <span key={a.jhf_members.id} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                        {a.jhf_members.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 카드 바디 */}
                <div className="p-4 space-y-3">
                  {m.jhf_venues && (
                    <div className="flex gap-2">
                      <span className="text-lg">🏠</span>
                      <div>
                        <div className="text-xs text-indigo-700 font-medium">1차</div>
                        <div className="font-medium text-sm">{m.jhf_venues.name}</div>
                        <div className="text-xs text-slate-400">{m.jhf_venues.cuisine}{m.jhf_venues.address && ` · ${m.jhf_venues.address}`}</div>
                        {m.jhf_venues.address && (
                          <a href={`https://map.naver.com/v5/search/${encodeURIComponent(m.jhf_venues.address)}`}
                            target="_blank" rel="noreferrer"
                            className="text-xs text-indigo-600 underline mt-0.5 inline-block">
                            🗺 지도 보기
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {m.second_venue && (
                    <div className="flex gap-2">
                      <span className="text-lg">🌙</span>
                      <div>
                        <div className="text-xs text-indigo-700 font-medium">2차</div>
                        <div className="font-medium text-sm">{m.second_venue.name}</div>
                        <div className="text-xs text-slate-400">{m.second_venue.cuisine}{m.second_venue.address && ` · ${m.second_venue.address}`}</div>
                      </div>
                    </div>
                  )}

                  {m.food_name && (
                    <div className="flex gap-2">
                      <span className="text-lg">🍽</span>
                      <div>
                        <div className="text-xs text-indigo-700 font-medium">음식</div>
                        <div className="font-medium text-sm">{m.food_name}</div>
                        {m.food_review && <div className="text-xs text-slate-500 mt-0.5">{m.food_review}</div>}
                      </div>
                    </div>
                  )}

                  {m.total_cost && (
                    <div className="flex gap-2 items-center">
                      <span className="text-lg">💰</span>
                      <div>
                        <div className="text-xs text-indigo-700 font-medium">전체 비용</div>
                        <div className="font-bold text-sm">{m.total_cost.toLocaleString()}원</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 사진 */}
                {m.jhf_photos && m.jhf_photos.length > 0 && (() => {
                  const foodPhotos = m.jhf_photos.filter(p => p.type === 'food')
                  const restaurantPhotos = m.jhf_photos.filter(p => p.type === 'restaurant')
                  const peoplePhotos = m.jhf_photos.filter(p => p.type === 'people')
                  const getUrl = (path: string) =>
                    supabase.storage.from('jhf-photos').getPublicUrl(path).data.publicUrl

                  return (
                    <div className="px-4 pb-2 space-y-3">
                      {foodPhotos.length > 0 && (
                        <div>
                          <div className="text-xs text-indigo-700 font-medium mb-1">📷 음식 사진</div>
                          <div className="grid grid-cols-3 gap-1">
                            {foodPhotos.map((p, i) => (
                              <img key={i} src={getUrl(p.storage_path)}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                                onClick={() => window.open(getUrl(p.storage_path), '_blank')}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {restaurantPhotos.length > 0 && (
                        <div>
                          <div className="text-xs text-indigo-700 font-medium mb-1">🏪 식당 외관</div>
                          <div className="grid grid-cols-3 gap-1">
                            {restaurantPhotos.map((p, i) => (
                              <img key={i} src={getUrl(p.storage_path)}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                                onClick={() => window.open(getUrl(p.storage_path), '_blank')}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {peoplePhotos.length > 0 && (
                        <div>
                          <div className="text-xs text-indigo-700 font-medium mb-1">🤳 단체 사진</div>
                          <div className="grid grid-cols-3 gap-1">
                            {peoplePhotos.map((p, i) => (
                              <img key={i} src={getUrl(p.storage_path)}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer"
                                onClick={() => window.open(getUrl(p.storage_path), '_blank')}
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* 명언 */}
                {m.jhf_moments && m.jhf_moments.length > 0 && (
                  <div className="px-4 pb-3">
                    <div className="text-xs text-indigo-700 font-medium mb-2">💬 오늘의 명언</div>
                    <div className="space-y-2">
                      {m.jhf_moments.map((moment, i) => (
                        <div key={i} className="bg-amber-50 border-l-4 border-amber-400 rounded-r-xl px-3 py-2">
                          <div className="text-xs font-bold text-amber-700 mb-1">{moment.jhf_members?.name}</div>
                          <div className="text-sm text-slate-600">{moment.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 카드 액션 */}
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => setEditingMeeting(m)}
                    className="flex-1 text-indigo-700 text-sm border border-indigo-200 py-2 rounded-lg hover:bg-indigo-50">
                    ✏️ 수정
                  </button>
                  <button onClick={() => deleteMeeting(m.id)}
                    className="flex-1 text-red-400 text-sm border border-red-200 py-2 rounded-lg hover:bg-red-50">
                    🗑 삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showForm || editingMeeting) && (
        <MeetingForm
          members={members}
          editing={editingMeeting}
          onClose={() => { setShowForm(false); setEditingMeeting(null) }}
          onSaved={() => { setShowForm(false); setEditingMeeting(null); fetchMeetings() }}
        />
      )}
    </main>
  )
}

// ─────────────────────────────────────────────
// MeetingForm
// ─────────────────────────────────────────────
function MeetingForm({ members, editing, onClose, onSaved }: {
  members: Member[]
  editing: Meeting | null
  onClose: () => void
  onSaved: () => void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [attendees, setAttendees] = useState<string[]>([])
  const [venueName, setVenueName] = useState('')
  const [venueAddress, setVenueAddress] = useState('')
  const [venueCuisine, setVenueCuisine] = useState('한식')
  const [venue2Name, setVenue2Name] = useState('')
  const [venue2Address, setVenue2Address] = useState('')
  const [venue2Cuisine, setVenue2Cuisine] = useState('한식')
  const [foodName, setFoodName] = useState('')
  const [foodReview, setFoodReview] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [saving, setSaving] = useState(false)
  const [foodPhotos, setFoodPhotos] = useState<File[]>([])
  const [restaurantPhotos, setRestaurantPhotos] = useState<File[]>([])
  const [peoplePhotos, setPeoplePhotos] = useState<File[]>([])
  const [foodPreviews, setFoodPreviews] = useState<string[]>([])
  const [restaurantPreviews, setRestaurantPreviews] = useState<string[]>([])
  const [peoplePreviews, setPeoplePreviews] = useState<string[]>([])
  const [moments, setMoments] = useState<{ memberId: string; content: string }[]>([{ memberId: '', content: '' }])
  const [existingPhotos, setExistingPhotos] = useState<{ type: string; storage_path: string; order_index: number }[]>([])

  useEffect(() => {
    if (!editing) return
    setDate(editing.meeting_date)
    setFoodName(editing.food_name || '')
    setFoodReview(editing.food_review || '')
    setTotalCost(editing.total_cost?.toString() || '')
    setVenueName(editing.jhf_venues?.name || '')
    setVenueAddress(editing.jhf_venues?.address || '')
    setVenueCuisine(editing.jhf_venues?.cuisine || '한식')
    setVenue2Name(editing.second_venue?.name || '')
    setVenue2Address(editing.second_venue?.address || '')
    setVenue2Cuisine(editing.second_venue?.cuisine || '한식')
    setAttendees(editing.jhf_meeting_attendance?.map(a => a.jhf_members.id) || [])
    setMoments(
      editing.jhf_moments?.length > 0
        ? editing.jhf_moments.map(m => ({ memberId: m.member_id, content: m.content }))
        : [{ memberId: '', content: '' }]
    )
    setExistingPhotos(editing.jhf_photos || [])
  }, [editing])

  async function deleteExistingPhoto(photo: { type: string; storage_path: string; order_index: number }) {
    if (!confirm('이 사진을 삭제할까요?')) return
    await supabase.storage.from('jhf-photos').remove([photo.storage_path])
    await supabase.from('jhf_photos').delete().eq('storage_path', photo.storage_path)
    setExistingPhotos(prev => prev.filter(p => p.storage_path !== photo.storage_path))
  }

  function toggleAttendee(id: string) {
    setAttendees(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  function addMoment() { setMoments(prev => [...prev, { memberId: '', content: '' }]) }
  function removeMoment(i: number) { setMoments(prev => prev.filter((_, idx) => idx !== i)) }
  function updateMoment(i: number, field: 'memberId' | 'content', value: string) {
    setMoments(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>, type: 'food' | 'restaurant' | 'people', max: number) {
    const newFiles = Array.from(e.target.files || [])
    if (type === 'food') {
      const merged = [...foodPhotos, ...newFiles].slice(0, max)
      setFoodPhotos(merged); setFoodPreviews(merged.map(f => URL.createObjectURL(f)))
    }
    if (type === 'restaurant') {
      const merged = [...restaurantPhotos, ...newFiles].slice(0, max)
      setRestaurantPhotos(merged); setRestaurantPreviews(merged.map(f => URL.createObjectURL(f)))
    }
    if (type === 'people') {
      const merged = [...peoplePhotos, ...newFiles].slice(0, max)
      setPeoplePhotos(merged); setPeoplePreviews(merged.map(f => URL.createObjectURL(f)))
    }
    e.target.value = ''
  }

  async function uploadPhotos(meetingId: string) {
    const allPhotos = [
      ...foodPhotos.map(f => ({ file: f, type: 'food' })),
      ...restaurantPhotos.map(f => ({ file: f, type: 'restaurant' })),
      ...peoplePhotos.map(f => ({ file: f, type: 'people' })),
    ]
    for (let i = 0; i < allPhotos.length; i++) {
      const { file, type } = allPhotos[i]
      const ext = file.name.split('.').pop()
      const path = `${meetingId}/${type}_${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('jhf-photos').upload(path, file)
      if (!error) {
        await supabase.from('jhf_photos').insert({ meeting_id: meetingId, type, storage_path: path, order_index: i })
      }
    }
  }

  async function handleSave() {
    if (!date || !venueName) { alert('날짜와 1차 장소는 필수예요!'); return }
    setSaving(true)

    let venue1Id = editing?.venue_id
    if (!editing || editing.jhf_venues?.name !== venueName) {
      const { data: v1 } = await supabase.from('jhf_venues')
        .insert({ name: venueName, address: venueAddress, cuisine: venueCuisine }).select().single()
      venue1Id = v1?.id
    } else {
      await supabase.from('jhf_venues').update({ name: venueName, address: venueAddress, cuisine: venueCuisine }).eq('id', editing.venue_id)
    }

    let venue2Id = editing?.second_venue_id || null
    if (venue2Name) {
      if (!editing?.second_venue_id) {
        const { data: v2 } = await supabase.from('jhf_venues')
          .insert({ name: venue2Name, address: venue2Address, cuisine: venue2Cuisine }).select().single()
        venue2Id = v2?.id
      } else {
        await supabase.from('jhf_venues').update({ name: venue2Name, address: venue2Address, cuisine: venue2Cuisine }).eq('id', editing.second_venue_id)
      }
    }

    if (editing) {
      await supabase.from('jhf_meetings').update({
        meeting_date: date, venue_id: venue1Id, second_venue_id: venue2Id,
        food_name: foodName, food_review: foodReview,
        total_cost: totalCost ? parseInt(totalCost) : null,
      }).eq('id', editing.id)

      await supabase.from('jhf_meeting_attendance').delete().eq('meeting_id', editing.id)
      if (attendees.length > 0) {
        await supabase.from('jhf_meeting_attendance').insert(
          attendees.map(member_id => ({ meeting_id: editing.id, member_id }))
        )
      }

      await supabase.from('jhf_moments').delete().eq('meeting_id', editing.id)
      const validMoments = moments.filter(m => m.memberId && m.content.trim())
      if (validMoments.length > 0) {
        await supabase.from('jhf_moments').insert(
          validMoments.map(m => ({ meeting_id: editing.id, member_id: m.memberId, content: m.content.trim() }))
        )
      }

      if (foodPhotos.length > 0 || restaurantPhotos.length > 0 || peoplePhotos.length > 0) {
        await uploadPhotos(editing.id)
      }
    } else {
      const { data: meeting } = await supabase.from('jhf_meetings').insert({
        meeting_date: date, venue_id: venue1Id, second_venue_id: venue2Id,
        food_name: foodName, food_review: foodReview,
        total_cost: totalCost ? parseInt(totalCost) : null,
      }).select().single()

      if (meeting) {
        if (attendees.length > 0) {
          await supabase.from('jhf_meeting_attendance').insert(
            attendees.map(member_id => ({ meeting_id: meeting.id, member_id }))
          )
        }
        await uploadPhotos(meeting.id)
        const validMoments = moments.filter(m => m.memberId && m.content.trim())
        if (validMoments.length > 0) {
          await supabase.from('jhf_moments').insert(
            validMoments.map(m => ({ meeting_id: meeting.id, member_id: m.memberId, content: m.content.trim() }))
          )
        }
      }
    }

    setSaving(false)
    onSaved()
  }

  const cuisines = ['한식', '중식', '양식', '일식', '혼합', '카페', '기타']

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6">

          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-indigo-900">{editing ? '✏️ 모임 기록 수정' : '새 모임 기록'}</h2>
            <button onClick={onClose} className="text-slate-400 text-2xl leading-none">✕</button>
          </div>

          {/* 날짜 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-1">📅 만난 날짜</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>

          {/* 참석자 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-2">👥 참석자</label>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button key={m.id} type="button" onClick={() => toggleAttendee(m.id)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${attendees.includes(m.id)
                    ? 'bg-indigo-800 text-white border-indigo-800'
                    : 'bg-white text-slate-600 border-slate-200'}`}>
                  {m.is_regular ? '⭐' : '👤'} {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* 1차 장소 */}
          <div className="mb-4 bg-slate-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-indigo-700 mb-2">🏠 1차 장소 *</label>
            <input type="text" value={venueName} onChange={e => setVenueName(e.target.value)}
              placeholder="식당 이름" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 mb-2" />
            <input type="text" value={venueAddress} onChange={e => setVenueAddress(e.target.value)}
              placeholder="주소 (네이버 지도에서 복사)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 mb-2" />
            <select value={venueCuisine} onChange={e => setVenueCuisine(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
              {cuisines.map(c => <option key={c}>{c}</option>)}
            </select>
            {venueAddress && (
              <a href={`https://map.naver.com/v5/search/${encodeURIComponent(venueAddress)}`}
                target="_blank" rel="noreferrer"
                className="inline-block mt-2 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg">
                🗺 네이버 지도에서 확인
              </a>
            )}
          </div>

          {/* 2차 장소 */}
          <div className="mb-4 bg-slate-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-indigo-700 mb-2">🌙 2차 장소 (선택)</label>
            <input type="text" value={venue2Name} onChange={e => setVenue2Name(e.target.value)}
              placeholder="식당 이름 (없으면 비워두세요)" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 mb-2" />
            <input type="text" value={venue2Address} onChange={e => setVenue2Address(e.target.value)}
              placeholder="주소" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 mb-2" />
            <select value={venue2Cuisine} onChange={e => setVenue2Cuisine(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500">
              {cuisines.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* 음식 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-1">🍽 주로 먹은 음식</label>
            <input type="text" value={foodName} onChange={e => setFoodName(e.target.value)}
              placeholder="예: 삼겹살, 냉면" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-1">⭐ 음식 평가</label>
            <textarea value={foodReview} onChange={e => setFoodReview(e.target.value)}
              placeholder="맛과 분위기를 자유롭게..." rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="mb-6">
            <label className="block text-xs font-medium text-indigo-700 mb-1">💰 전체 비용</label>
            <input type="number" value={totalCost} onChange={e => setTotalCost(e.target.value)}
              placeholder="예: 150000" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500" />
          </div>

          {/* 기존 사진 관리 (수정 모드) */}
          {editing && existingPhotos.length > 0 && (() => {
            const getUrl = (path: string) => supabase.storage.from('jhf-photos').getPublicUrl(path).data.publicUrl
            const groups = [
              { list: existingPhotos.filter(p => p.type === 'food'), label: '📷 음식' },
              { list: existingPhotos.filter(p => p.type === 'restaurant'), label: '🏪 식당 외관' },
              { list: existingPhotos.filter(p => p.type === 'people'), label: '🤳 단체' },
            ].filter(g => g.list.length > 0)
            return (
              <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-xs font-medium text-amber-700 mb-2">🗂 저장된 사진 (✕ 버튼으로 삭제)</div>
                {groups.map(g => (
                  <div key={g.label} className="mb-2">
                    <div className="text-xs text-slate-500 mb-1">{g.label}</div>
                    <div className="grid grid-cols-3 gap-2">
                      {g.list.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={getUrl(p.storage_path)} className="w-full aspect-square object-cover rounded-lg"
                            onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none' }} />
                          <button type="button" onClick={() => deleteExistingPhoto(p)}
                            className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* 음식 사진 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-2">📷 음식 사진 {editing && <span className="text-slate-400">(추가 업로드)</span>}</label>
            <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition">
              <span className="text-slate-400 text-sm">📷 갤러리에서 선택</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoSelect(e, 'food', 10)} />
            </label>
            {foodPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {foodPreviews.map((src, i) => <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg" />)}
              </div>
            )}
          </div>

          {/* 식당 외관 사진 */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-indigo-700 mb-2">🏪 식당 외관 사진 <span className="text-slate-400">(최대 3장)</span></label>
            <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition">
              <span className="text-slate-400 text-sm">📷 갤러리에서 선택</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoSelect(e, 'restaurant', 3)} />
            </label>
            {restaurantPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {restaurantPreviews.map((src, i) => <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg" />)}
              </div>
            )}
          </div>

          {/* 단체 사진 */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-indigo-700 mb-2">🤳 단체 사진 <span className="text-slate-400">(최대 10장)</span></label>
            <label className="block w-full border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:border-indigo-400 transition">
              <span className="text-slate-400 text-sm">📷 갤러리에서 선택</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoSelect(e, 'people', 10)} />
            </label>
            {peoplePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {peoplePreviews.map((src, i) => <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg" />)}
              </div>
            )}
          </div>

          {/* 명언 */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-indigo-700 mb-2">💬 오늘의 명언 <span className="text-slate-400">(재미있었던 말)</span></label>
            {moments.map((m, i) => (
              <div key={i} className="mb-3 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <select value={m.memberId} onChange={e => updateMoment(i, 'memberId', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-indigo-500 bg-white">
                    <option value="">회원 선택</option>
                    {members.map(mem => <option key={mem.id} value={mem.id}>{mem.name}</option>)}
                  </select>
                  <button type="button" onClick={() => removeMoment(i)}
                    className="text-red-400 border border-red-200 rounded-lg px-2 py-1.5 text-sm hover:bg-red-50">✕</button>
                </div>
                <textarea value={m.content} onChange={e => updateMoment(i, 'content', e.target.value)}
                  placeholder="기억에 남는 말..." rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 resize-none bg-white" />
              </div>
            ))}
            <button type="button" onClick={addMoment}
              className="w-full border border-dashed border-slate-300 rounded-xl py-2 text-sm text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition">
              ＋ 명언 추가
            </button>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full bg-indigo-800 text-white py-3 rounded-xl font-bold text-base hover:bg-indigo-700 disabled:opacity-50">
            {saving ? '저장 중...' : '✨ 기록 저장'}
          </button>

        </div>
      </div>
    </div>
  )
}