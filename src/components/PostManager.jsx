import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function PostManager({
  title,
  posts,
  onDelete,
  sectionId,
  createHref,
}) {
  const [error, setError] = useState('')
  const location = useLocation()

  async function handleDelete(postId) {
    setError('')
    try {
      await onDelete(postId)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section id={sectionId} className="scroll-mt-24 space-y-5" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-[var(--serif)] text-3xl font-semibold">{title}</h2>
        {createHref && (
          <Link
            className="rounded-sm bg-[#343c32] px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-[#4b5747]"
            to={createHref}
          >
            + Create a post
          </Link>
        )}
      </div>
      {error && <p className="rounded-sm bg-[#fff2ef] p-3 text-sm text-[#a12718]" role="alert">{error}</p>}

      {posts.length === 0 ? (
        <p className="rounded-sm bg-white p-5 text-sm text-[#55564f]">No posts yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <article className="rounded-sm bg-white p-5 shadow-[0_2px_12px_rgba(41,43,39,0.08)]" key={post._id}>
              {post.imageUrl && (
                <img className="mb-4 max-h-80 w-full rounded-sm object-cover" src={post.imageUrl} alt={`Cover for ${post.title}`} />
              )}
              <h3 className="font-[var(--serif)] text-2xl font-semibold">{post.title}</h3>
              <p className="mt-1 text-xs text-[#85867e]">{new Date(post.createdAt).toLocaleDateString()}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#55564f]">{post.content}</p>
              {post.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Post tags">
                  {post.tags.map((tag) => (
                    <span className="rounded-sm bg-[#f1f1f1] px-2 py-1 text-xs text-[#444]" key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2 border-t border-[#eeede7] pt-4">
                <Link
                  className="rounded-sm border border-[#292b27] px-3 py-2 text-sm no-underline"
                  to={`/posts/${post._id}/edit`}
                  state={{ returnTo: location.pathname }}
                >
                  Edit
                </Link>
                <button className="rounded-sm border border-[#a12718] px-3 py-2 text-sm text-[#a12718]" type="button" onClick={() => handleDelete(post._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
