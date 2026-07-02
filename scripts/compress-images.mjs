import sharp from 'sharp'
import { statSync } from 'node:fs'

const jobs = [
  { in: 'public/og-cover.jpg',              out: 'public/og-cover.jpg',              resize: { width: 1200, height: 630 }, jpegQuality: 78 },
  { in: 'public/ihkaam-logo.png',           out: 'public/ihkaam-logo.png',           pngCompression: 9 },
  { in: 'public/ihkaam-screen-circles.png', out: 'public/ihkaam-screen-circles.png', pngCompression: 9 },
  { in: 'public/ihkaam-screen-student.png', out: 'public/ihkaam-screen-student.png', pngCompression: 9 },
  { in: 'src/assets/profile.png.jpg',       out: 'src/assets/profile.png.jpg',       jpegQuality: 80 },
]

for (const job of jobs) {
  const before = statSync(job.in).size
  const tmp = job.out + '.tmp'
  let pipeline = sharp(job.in)
  if (job.resize) pipeline = pipeline.resize(job.resize.width, job.resize.height, { fit: 'cover' })
  if (job.jpegQuality) pipeline = pipeline.jpeg({ quality: job.jpegQuality, mozjpeg: true })
  if (job.pngCompression) pipeline = pipeline.png({ compressionLevel: job.pngCompression, palette: true })
  await pipeline.toFile(tmp)
  const after = statSync(tmp).size
  const { renameSync } = await import('node:fs')
  renameSync(tmp, job.out)
  console.log(`${job.in}: ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB`)
}
