import { useState, useEffect } from 'react'
import { supabase } from '../config/supabaseClient'

/* لقطات التطبيق الفعّالة من gallery_items، تُجلب في المتصفّح فقط حين enabled */
export function useGalleryShots(enabled) {
  const [shots, setShots] = useState([])
  useEffect(() => {
    if (!enabled) return
    let off = false
    supabase.from('gallery_items').select('id,image_url,title,category').eq('is_active', true)
      .order('order_index', { ascending: true })
      .then(({ data }) => { if (!off && data) setShots(data) })
    return () => { off = true }
  }, [enabled])
  return shots
}
