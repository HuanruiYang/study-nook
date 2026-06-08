export const SPINE_COLORS = [
  '#F5F2EB',
  '#E8E3D8',
  '#3D3A32',
  '#7A7468',
  '#C5705A',
  '#5B7FA3',
  '#6B8F6A',
  '#C4A84B',
]

export function assignSpineColor(bookCount: number): string {
  return SPINE_COLORS[bookCount % SPINE_COLORS.length]
}

export function textColorForBackground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? '#3D3A32' : '#F5F2EB'
}
