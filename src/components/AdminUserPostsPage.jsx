import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PostManager from './PostManager.jsx'
import { apiRequest } from '../services/api.js'

export default function AdminUserPostsPage({ onDelete }) {
  const { userId } = useParams()
  const [resultState, setResultState] = useState(null)
  const [errorState, setErrorState] = useState(null)
  const queryKey = userId
  const data = resultState?.key === queryKey ? resultState.data : null
  const error = errorState?.key === queryKey ? errorState.error : ''

  useEffect(() => {
    let cancelled = false
    apiRequest(`/api/users/${userId}/posts`)
      .then((result) => {
        if (!cancelled) {
          setResultState({ key: queryKey, data: result })
          setErrorState(null)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setErrorState({ key: queryKey, error: requestError.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [queryKey, userId])

  async function deletePost(postId) {
    await onDelete(postId)
    setResultState((current) => current?.key === queryKey
      ? {
          ...current,
          data: {
            ...current.data,
            posts: current.data.posts.filter((post) => post._id !== postId),
          },
        }
      : current)
  }

  if (error) {
    return <p className="rounded-sm bg-[#fff2ef] p-4 text-sm text-[#a12718]" role="alert">{error}</p>
  }
  if (!data) {
    return <p className="text-sm text-[#55564f]">Loading user posts…</p>
  }

  return (
    <section className="space-y-5">
      <Link className="text-sm font-semibold text-[#b8563d] hover:underline" to="/admin/users">
        ← All users
      </Link>
      <p className="text-sm text-[#85867e]">{data.user.email}</p>
      <PostManager
        sectionId="selected-user-posts"
        title={`${data.user.name}'s posts`}
        posts={data.posts}
        onDelete={deletePost}
      />
    </section>
  )
}
