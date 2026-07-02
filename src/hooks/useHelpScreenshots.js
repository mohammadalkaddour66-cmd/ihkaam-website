import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetches gallery screenshots tagged for a help article.
 *
 * Upload convention: when adding a screenshot for an article,
 * set its `category` in gallery_items to "help:[article-slug]"
 * e.g.  category = "help:daily-recitation"
 *       category = "help:attendance-batch"
 */
export function useHelpScreenshots(slug) {
  const [images, setImages]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) { setLoading(false); return }

    setLoading(true)
    supabase
      .from('gallery_items')
      .select('id, title, image_url, order_index')
      .eq('is_active', true)
      .eq('category', `help:${slug}`)
      .order('order_index', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setImages(data)
        setLoading(false)
      })
  }, [slug])

  return { images, loading }
}
