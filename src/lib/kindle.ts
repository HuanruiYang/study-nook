export interface KindleClipping {
  bookTitle: string
  author: string
  type: 'highlight' | 'note' | 'bookmark'
  location: string
  addedAt: string
  content: string
  highlightColor: 'yellow' | 'blue' | 'pink' | 'orange'
}

export function parseKindleClippings(raw: string): KindleClipping[] {
  const SEPARATOR = '=========='
  const entries = raw.split(SEPARATOR).map(s => s.trim()).filter(Boolean)
  const results: KindleClipping[] = []

  for (const entry of entries) {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) continue

    const titleLine = lines[0].replace(/^﻿/, '')
    const titleMatch = titleLine.match(/^[《「]?(.+?)[》」]?\s*[(\（](.+)[)\）]\s*$/)
    const bookTitle = titleMatch ? titleMatch[1].trim() : titleLine.trim()
    const author = titleMatch ? titleMatch[2].trim() : ''

    const metaLine = lines[1]
    if (!metaLine.startsWith('-')) continue

    let type: KindleClipping['type'] = 'highlight'
    if (metaLine.includes('笔记')) type = 'note'
    else if (metaLine.includes('书签')) type = 'bookmark'
    if (type === 'bookmark') continue

    let highlightColor: KindleClipping['highlightColor'] = 'yellow'
    if (metaLine.includes('蓝色')) highlightColor = 'blue'
    else if (metaLine.includes('粉红') || metaLine.includes('红色')) highlightColor = 'pink'
    else if (metaLine.includes('橙色')) highlightColor = 'orange'

    const locationMatch = metaLine.match(/位置\s*[#＃]?(\d+(?:[–\-]\d+)?)|第\s*(\d+)\s*页/)
    const location = locationMatch
      ? locationMatch[1] ? `位置 ${locationMatch[1]}` : `第 ${locationMatch[2]} 页`
      : ''

    const dateMatch = metaLine.match(/(\d{4}年\d+月\d+日.+?\d{2}:\d{2}:\d{2})/)
    const addedAt = dateMatch ? dateMatch[1] : ''

    const content = lines.slice(2).join('\n').trim()
    if (!content) continue

    results.push({ bookTitle, author, type, location, addedAt, content, highlightColor })
  }

  return results
}
