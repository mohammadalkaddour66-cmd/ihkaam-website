import { useEffect, useState } from 'react'
import { supabase } from '../config/supabaseClient'

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
  const [loading, setLoading] = useState(!!slug)

  useEffect(() => {
    if (!slug) return

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('gallery_items')
        .select('id, title, image_url, order_index')
        .eq('is_active', true)
        .eq('category', `help:${slug}`)
        .order('order_index', { ascending: true })
      if (!error && data) setImages(data)
      setLoading(false)
    }
    load()
  }, [slug])

  return { images, loading }
}
