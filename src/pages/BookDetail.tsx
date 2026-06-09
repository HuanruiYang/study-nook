import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import type { Book, Quote, Spark } from '../types'
import {
  getBook, saveBook,
  getReviewLayers, saveReviewLayer, deleteReviewLayer,
  getQuotes, saveQuote, deleteQuote,
  getSparks, saveSpark, deleteSpark,
} from '../lib/localStore'
import { useAuth } from '../hooks/useAuth'
import BookEditForm from '../components/BookEditForm'
import ReviewLayerCard from '../components/ReviewLayerCard'
import ReviewEditor from '../components/ReviewEditor'
import QuoteCard from '../components/QuoteCard'
import SparkItem from '../components/SparkItem'
import TagInput from '../components/TagInput'
import KindleImporter from '../components/KindleImporter'

type Tab = 'reviews' | 'quotes' | 'sparks'

const STATUS_LABEL = { want: '想读', reading: '在读', done: '读过' }

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [book, setBook] = useState<Book | undefined>(() => id ? getBook(id) : undefined)
  const [showEdit, setShowEdit] = useState(false)
  const [tab, setTab] = useState<Tab>('reviews')

  const [layers, setLayers] = useState(() => id ? getReviewLayers(id) : [])
  const [quotes, setQuotes] = useState(() => id ? getQuotes(id) : [])
  const [sparks, setSparks] = useState(() => id ? getSparks(id) : [])

  const [showEditor, setShowEditor] = useState(false)
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [showKindleImporter, setShowKindleImporter] = useState(false)
  const [quoteContent, setQuoteContent] = useState('')
  const [quoteReflection, setQuoteReflection] = useState('')
  const [quotePage, setQuotePage] = useState('')
  const [sparkInput, setSparkInput] = useState('')
  const [sparkTags, setSparkTags] = useState<string[]>([])

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-[#7A7468]">
        <p>书目不存在</p>
        <Link to="/shelf" className="text-[#5B7FA3] text-sm mt-2 inline-block">← 返回书架</Link>
      </div>
    )
  }

  function handleSaveBook(updated: Book) { saveBook(updated); setBook(updated); setShowEdit(false) }
  function refreshLayers() { setLayers(getReviewLayers(id!)) }
  function refreshQuotes() { setQuotes(getQuotes(id!)) }
  function refreshSparks() { setSparks(getSparks(id!)) }

  function handleAddQuote() {
    if (!quoteContent.trim()) return
    saveQuote({
      id: uuid(), user_id: user!.id, book_id: id!,
      content: quoteContent.trim(),
      reflection: quoteReflection.trim() || undefined,
      page: quotePage ? parseInt(quotePage) : undefined,
      source: 'manual',
      created_at: new Date().toISOString(),
    } as Quote)
    setQuoteContent(''); setQuoteReflection(''); setQuotePage('')
    setShowQuoteForm(false)
    refreshQuotes()
  }

  function handleAddSpark() {
    if (!sparkInput.trim()) return
    saveSpark({
      id: uuid(), user_id: user!.id, book_id: id!,
      content: sparkInput.trim(), tags: sparkTags,
      created_at: new Date().toISOString(),
    } as Spark)
    setSparkInput(''); setSparkTags([])
    refreshSparks()
  }

  const finishedDate = book.finished_at
    ? new Date(book.finished_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="page-frame">
      <Link to="/shelf" className="mb-2 inline-block text-[12px] text-[#7A7468] transition-colors hover:text-[#3D3A32] md:mb-6 md:text-[13px]">
        ← 书架
      </Link>

      {showEdit ? (
        <BookEditForm book={book} onSave={handleSaveBook} onCancel={() => setShowEdit(false)} />
      ) : (
        <div className="mb-3 flex gap-2.5 md:mb-8 md:gap-4">
          <div className="w-2.5 flex-shrink-0 rounded-sm md:w-3" style={{ backgroundColor: book.cover_color, minHeight: '58px' }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="serif-title mb-0.5 text-[20px] font-semibold leading-snug text-[#312F2A] md:mb-1 md:text-[26px]"
                style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
                {book.title}
              </h1>
              <button onClick={() => setShowEdit(true)}
                className="text-[12px] text-[#7A7468] hover:text-[#3D3A32] transition-colors flex-shrink-0 mt-1 border border-black/15 rounded px-2 py-0.5 hover:border-black/30">
                编辑
              </button>
            </div>
            <p className="text-[12px] text-[#7A7468] md:text-[14px]">
              {book.author}
              {book.translator && <span> · 译：{book.translator}</span>}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 md:gap-3">
              <span className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: book.cover_color + '33', color: '#7A7468' }}>
                {STATUS_LABEL[book.status]}
              </span>
              {finishedDate && <span className="text-[12px] text-[#7A7468]">读完于 {finishedDate}</span>}
            </div>
            {book.status === 'reading' && book.progress !== undefined && (
              <div className="mt-2 max-w-[240px]">
                <div className="flex justify-between text-[11px] text-[#7A7468] mb-1">
                  <span>{book.current_page && book.total_pages ? `${book.current_page} / ${book.total_pages} 页` : '阅读进度'}</span>
                  <span>{book.progress}%</span>
                </div>
                <div className="h-1 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${book.progress}%`, backgroundColor: book.cover_color }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mobile-scroll mb-3 flex border-b border-black/10 md:mb-6 md:overflow-visible">
        {([
          { key: 'reviews', label: `阅读感受${layers.length ? ` (${layers.length})` : ''}` },
          { key: 'quotes', label: `书摘${quotes.length ? ` (${quotes.length})` : ''}` },
          { key: 'sparks', label: `灵感${sparks.length ? ` (${sparks.length})` : ''}` },
        ] as { key: Tab; label: string }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`-mb-px flex-shrink-0 border-b-2 px-3 py-1.5 text-[12px] transition-colors md:px-4 md:py-2 md:text-[14px] ${
              tab === t.key ? 'border-[#3D3A32] text-[#3D3A32] font-medium' : 'border-transparent text-[#7A7468] hover:text-[#3D3A32]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Reviews Tab */}
      {tab === 'reviews' && (
        <div>
          <div className="mb-2.5 grid gap-2.5 md:mb-4 md:gap-4">
            {layers.length === 0 && !showEditor && (
              <p className="py-3 text-[13px] text-[#7A7468] md:py-4 md:text-[14px]">还没有阅读感受。可以先写下读之前的期待，也可以记录阅读之中的触动或读之后的回声。</p>
            )}
            {layers.slice().sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map(l => (
                <ReviewLayerCard key={l.id} layer={l} onDelete={id => { deleteReviewLayer(id); refreshLayers() }} />
              ))}
          </div>
          {showEditor ? (
            <ReviewEditor bookId={id!} bookColor={book.cover_color} userId={user!.id}
              onSave={layer => { saveReviewLayer(layer); refreshLayers(); setShowEditor(false) }}
              onCancel={() => setShowEditor(false)} />
          ) : (
            <button onClick={() => setShowEditor(true)}
              className="w-full rounded-[8px] border border-dashed border-black/20 py-2.5 text-[13px] text-[#7A7468] transition-colors hover:border-[#3D3A32] hover:text-[#3D3A32] md:py-3 md:text-[14px]">
              记录一条阅读感受
            </button>
          )}
        </div>
      )}

      {/* Quotes Tab */}
      {tab === 'quotes' && (
        <div>
          {showKindleImporter ? (
            <div className="mb-4">
              <KindleImporter bookId={id} userId={user!.id} onDone={() => { setShowKindleImporter(false); refreshQuotes() }} />
            </div>
          ) : showQuoteForm ? (
            <div className="mb-3 rounded-[8px] border border-black/10 bg-[#E8E3D8] p-3 md:mb-4 md:p-5">
              <textarea placeholder="书摘原文 *" value={quoteContent} onChange={e => setQuoteContent(e.target.value)}
                rows={3}
                className="mb-3 w-full resize-none border-b border-black/15 bg-transparent pb-3 text-[14px] leading-relaxed text-[#3D3A32] outline-none placeholder-[#7A7468] md:text-[15px]"
                style={{ fontFamily: '"Georgia", "Noto Serif SC", serif', fontStyle: 'italic' }} />
              <textarea placeholder="个人感想（选填）" value={quoteReflection} onChange={e => setQuoteReflection(e.target.value)}
                rows={2}
                className="mb-3 w-full resize-none bg-transparent text-[13px] leading-relaxed text-[#3D3A32] outline-none placeholder-[#7A7468] md:text-[14px]" />
              <div className="flex items-center gap-3">
                <input type="number" placeholder="页码" value={quotePage} onChange={e => setQuotePage(e.target.value)}
                  className="w-20 bg-transparent border-b border-black/20 pb-1 text-sm text-[#3D3A32] outline-none placeholder-[#7A7468]" />
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => setShowQuoteForm(false)} className="px-4 py-1.5 text-sm text-[#7A7468] hover:text-[#3D3A32]">取消</button>
                  <button onClick={handleAddQuote} disabled={!quoteContent.trim()}
                    className="px-4 py-1.5 text-sm bg-[#3D3A32] text-[#F5F2EB] rounded-lg disabled:opacity-40 hover:bg-[#5a564d]">保存</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-3 grid grid-cols-2 gap-2 md:mb-4 md:flex md:justify-end">
              <button onClick={() => setShowKindleImporter(true)}
                className="rounded-[8px] border border-[#3D3A32]/30 px-3 py-2 text-[13px] text-[#3D3A32] transition-colors hover:border-[#3D3A32] md:px-4 md:py-1.5 md:text-sm">
                导入 Kindle 书摘
              </button>
              <button onClick={() => setShowQuoteForm(true)}
                className="rounded-[8px] bg-[#3D3A32] px-3 py-2 text-[13px] text-[#F5F2EB] transition-colors hover:bg-[#5a564d] md:px-4 md:py-1.5 md:text-sm">
                + 手动添加
              </button>
            </div>
          )}
          {quotes.length === 0 && !showKindleImporter && (
            <p className="text-[14px] text-[#7A7468] py-4">还没有书摘。</p>
          )}
          {quotes.map(q => <QuoteCard key={q.id} quote={q} onDelete={id => { deleteQuote(id); refreshQuotes() }} />)}
        </div>
      )}

      {/* Sparks Tab */}
      {tab === 'sparks' && (
        <div>
          <div className="mb-3 rounded-[8px] border border-black/10 bg-[#E8E3D8] p-3 md:mb-4 md:p-4">
            <div className="mb-2 flex gap-2 md:mb-3">
              <input type="text" placeholder="记录一条灵感……" value={sparkInput}
                onChange={e => setSparkInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddSpark() } }}
                className="flex-1 rounded-[8px] border border-black/10 bg-[#F5F2EB] px-3 py-2 text-[13px] text-[#3D3A32] outline-none placeholder-[#7A7468] transition-colors focus:border-[#3D3A32] md:text-[14px]" />
              <button onClick={handleAddSpark} disabled={!sparkInput.trim()}
                className="flex-shrink-0 rounded-[8px] bg-[#3D3A32] px-3 py-2 text-[13px] text-[#F5F2EB] disabled:opacity-40 hover:bg-[#5a564d] md:px-4 md:text-sm">
                记录
              </button>
            </div>
            <TagInput tags={sparkTags} onChange={setSparkTags} placeholder="打标签：输入后按 Enter 或逗号确认" />
          </div>
          {sparks.length === 0 && <p className="text-[14px] text-[#7A7468] py-4">还没有关联记录。</p>}
          {sparks.map(s => <SparkItem key={s.id} spark={s} onDelete={id => { deleteSpark(id); refreshSparks() }} />)}
        </div>
      )}
    </div>
  )
}
