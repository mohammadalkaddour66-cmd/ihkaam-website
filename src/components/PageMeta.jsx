import { useEffect } from 'react'

export default function PageMeta({ title, description, keywords }) {
  useEffect(() => {
    if (title) document.title = title + ' | إحكام'
    const desc = document.querySelector('meta[name="description"]')
    if (desc && description) desc.setAttribute('content', description)
    const kw = document.querySelector('meta[name="keywords"]')
    if (kw && keywords) kw.setAttribute('content', keywords)
    return () => {
      document.title = 'إحكام — نظام إدارة المعاهد القرآنية'
    }
  }, [title, description, keywords])
  return null
}
