import Link from 'next/link'

export default function AnnouncementBar() {
  return (
    <div className="announce-bar">
      <span>Dërgesa falas për porosi mbi €50</span>
      <span className="sep">·</span>
      <span>Dyqane të reja çdo javë</span>
      <span className="sep">·</span>
      <span>
        <Link href="/auth/register">Regjistrohu dhe merr 10% zbritje në porosinë e parë</Link>
      </span>
    </div>
  )
}
