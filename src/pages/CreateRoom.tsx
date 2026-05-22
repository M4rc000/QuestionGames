import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../context/GameContext'

export default function CreateRoom() {
  const navigate = useNavigate()
  const { createNewRoom, loading, error, clearError } = useGame()
  const [questionsText, setQuestionsText] = useState('')
  const [parsedQuestions, setParsedQuestions] = useState<string[]>([])
  const [step, setStep] = useState<'input' | 'review'>('input')

  function parseQuestions(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .map((line) => line.replace(/^[-•]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i)
  }

  function handlePreview() {
    const questions = parseQuestions(questionsText)
    if (questions.length < 2) {
      alert('Masukkan minimal 2 pertanyaan.')
      return
    }
    setParsedQuestions(questions)
    setStep('review')
  }

  async function handleCreate() {
    if (parsedQuestions.length < 2) return
    const roomId = await createNewRoom(parsedQuestions)
    if (roomId) {
      navigate(`/lobby/${roomId}`)
    }
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-lg w-full space-y-6 animate-fade-up">
          <button
            onClick={() => setStep('input')}
            className="text-purple-500 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          <div className="glass-dark rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Review Pertanyaan</h2>
              <span className="gradient-primary text-white px-3.5 py-1.5 rounded-full text-sm font-medium shadow-md">
                {parsedQuestions.length} soal
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {parsedQuestions.map((q, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-purple-50/70 rounded-xl text-gray-700 text-sm border border-purple-100/50 animate-fade-in card-hover"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <span className="font-medium text-purple-600">Q{i + 1}.</span>{' '}
                  {q}
                </div>
              ))}
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-scale-in">
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed btn-shine"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat Room...
                </span>
              ) : (
                '🚀 Buat Room & Mulai'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-lg w-full space-y-6 animate-fade-up">
        <button
          onClick={() => navigate('/')}
          className="text-purple-500 hover:text-purple-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>

        <div className="glass-dark rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-gray-800">✏️ Import Pertanyaan</h2>
            <p className="text-gray-500 text-sm">
              Paste pertanyaan kamu di sini. Pisahkan setiap pertanyaan dengan baris baru.
            </p>
          </div>

          <textarea
            value={questionsText}
            onChange={(e) => {
              setQuestionsText(e.target.value)
              clearError()
            }}
            placeholder={`Contoh:\nMenurut kamu, hubungan kita bakal seperti apa 5 tahun lagi?\nKalau nanti tinggal bareng, hal apa yang paling kamu takutkan?\nKamu lebih pengen nikah muda atau nunggu semuanya mapan?`}
            className="w-full h-64 p-4 border border-purple-200/50 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-300 outline-none resize-none text-gray-700 bg-white/50 transition-all"
          />

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>💡</span>
            <span>Pisahkan setiap pertanyaan dengan baris baru (Enter)</span>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm animate-scale-in">
              {error}
            </div>
          )}

          <button
            onClick={handlePreview}
            disabled={questionsText.trim().length < 5}
            className="w-full py-3.5 gradient-primary text-white rounded-xl font-semibold shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer btn-shine"
          >
            👀 Preview Pertanyaan
          </button>
        </div>

        <div className="glass rounded-2xl p-5 border border-purple-100/50">
          <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <span>💡</span> Tips
          </h3>
          <ul className="text-sm text-purple-700 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Minimal <strong>2 pertanyaan</strong> agar game bisa dimulai</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Pertanyaan akan ditampilkan secara acak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Setiap pemain punya <strong>3x kesempatan</strong> memilih dari 5 opsi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>Pertanyaan yang sudah dipakai tidak bisa dipakai lagi</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
