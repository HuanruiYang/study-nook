import { useState, useRef } from 'react'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ tags, onChange, placeholder }: Props) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const tag = raw.trim().replace(/,$/, '')
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center cursor-text min-h-[32px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map(t => (
        <span
          key={t}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#3D3A32]/10 rounded-full text-[12px] text-[#3D3A32]"
        >
          {t}
          <button
            onClick={e => { e.stopPropagation(); removeTag(t) }}
            className="text-[#7A7468] hover:text-[#C5705A] leading-none"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-[13px] text-[#3D3A32] placeholder-[#7A7468] outline-none"
      />
    </div>
  )
}
