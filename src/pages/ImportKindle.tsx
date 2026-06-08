import { useAuth } from '../hooks/useAuth'
import KindleImporter from '../components/KindleImporter'

export default function ImportKindle() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-[22px] font-medium text-[#3D3A32] mb-6" style={{ fontFamily: '"Georgia", "Noto Serif SC", serif' }}>
        导入 Kindle 书摘
      </h1>
      <KindleImporter userId={user!.id} />
    </div>
  )
}
