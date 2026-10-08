import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api.js'

function authorName(post) {
  return post.author && typeof post.author === 'object'
    ? post.author.name || 'Unknown author'
    : 'Community member'
}

export default function PostDetailPage({ onViewed, onSelectTag }) {
  const { postId } = useParams()
  const viewRequest = useRef(null)
  const [post, setPost] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (viewRequest.current?.postId !== postId) {
      viewRequest.current = {
        postId,
        promise: apiRequest(`/api/posts/${postId}/view`, { method: 'POST' }),
      }
    }
    let cancelled = false

    viewRequest.current.promise
      .then(({ post: viewedPost }) => {
        if (!cancelled) {
          setPost(viewedPost)
          onViewed(viewedPost)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [onViewed, postId])

  return (
    <article className="mx-auto max-w-4xl space-y-5 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.16)] sm:p-8">
      <Link className="inline-block text-sm font-semibold text-[#343c32] hover:underline" to="/home">
        ← Back to stories
      </Link>
      {error ? (
        <p className="rounded-sm bg-[#fff2ef] p-4 text-sm text-[#a12718]" role="alert">{error}</p>
      ) : !post ? (
        <p className="text-sm text-[#55564f]">Opening story…</p>
      ) : (
        <>
          {post.imageUrl && <img className="max-h-[520px] w-full object-cover" src={post.imageUrl} alt={`Cover for ${post.title}`} />}
          <header>
            <p className="text-sm text-[#666]">
              By {authorName(post)} · {new Date(post.createdAt).toLocaleDateString()}
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{post.title}</h1>
            <p className="mt-2 text-sm text-[#666]">{post.views} {post.views === 1 ? 'view' : 'views'}</p>
          </header>
          <p className="whitespace-pre-wrap text-base leading-8 text-[#333]">{post.content}</p>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Post tags">
              {post.tags.map((tag) => (
                <button
                  className="bg-[#eee] px-2 py-1 text-xs text-[#333] transition hover:bg-[#343c32] hover:text-white"
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  )
}
