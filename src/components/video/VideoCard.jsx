import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import LiteYouTube from './LiteYouTube'
import { durationLabel } from '../../data/videos'

/* فيديو وتحته اسمه ووصفه وروابط إلى ما يشرحه مكتوباً.
   links: [[مسار, نص]]. تُعرض بالأسلوب نفسه في صفحة الميزة ومقال المساعدة،
   فيصل الزائر من الفيديو إلى الشرح المكتوب ومن الشرح إلى الفيديو. */
export default function VideoCard({ video, links = [], heading = 'h3' }) {
  const H = heading
  return (
    <figure className="m-0">
      <LiteYouTube video={video} />
      <figcaption className="pt-4">
        <H className="font-bold text-[#1A2E28] text-[17px] leading-snug">{video.name}</H>
        <p className="mt-1.5 text-[15px] leading-[1.85] text-[#4A5D56]">
          {video.desc} <span className="whitespace-nowrap font-bold tabular-nums" style={{ color: '#8A6425' }}>({durationLabel(video.seconds)})</span>
        </p>
        {links.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {links.map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="group inline-flex items-center gap-1 text-[14px] font-bold text-[#1F6F52] hover:text-[#0B3B33]">
                  {label}
                  <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </figcaption>
    </figure>
  )
}
