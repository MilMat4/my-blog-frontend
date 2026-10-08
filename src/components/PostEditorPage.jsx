import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api.js'

const emptyForm = { title: '', content: '', tags: '' }

export default function PostEditorPage({ onCreate, onUpdate }) {
  const { postId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const isEditing = Boolean(postId)
  const [postState, setPostState] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const isLoading = isEditing && !postState && !error
  const previewUrl = useMemo(() => image ? URL.createObjectURL(image) : '', [image])

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!isEditing) {
      return undefined
    }

    let cancelled = false
    apiRequest(`/api/posts/${postId}`)
      .then(({ post }) => {
        if (!cancelled) {
          setPostState(post)
          setForm({ title: post.title, content: post.content, tags: (post.tags || []).join(', ') })
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
  }, [isEditing, postId])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSaving(true)
    const data = new FormData()
    data.set('title', form.title)
    data.set('content', form.content)
    data.set('tags', form.tags)
    if (image) {
      data.set('image', image)
    } else if (removeImage) {
      data.set('removeImage', 'true')
    }

    try {
      if (isEditing) {
        await onUpdate(postId, data)
        navigate(location.state?.returnTo || '/my-posts')
      } else {
        await onCreate(data)
        navigate('/my-posts')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-[#55564f]">Loading post…</p>
  }

  if (error && isEditing && !postState) {
    return (
      <section className="space-y-4">
        <p className="rounded-sm bg-[#fff2ef] p-4 text-sm text-[#a12718]" role="alert">{error}</p>
        <Link className="text-sm font-semibold text-[#b8563d]" to="/my-posts">Back to My Posts</Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b8563d]">
          {isEditing ? 'Update your story' : 'Share with the community'}
        </p>
        <h2 className="mt-2 font-[var(--serif)] text-4xl font-semibold">
          {isEditing ? 'Edit post' : 'Create a post'}
        </h2>
      </header>

      {error && <p className="rounded-sm bg-[#fff2ef] p-3 text-sm text-[#a12718]" role="alert">{error}</p>}

      <form className="grid gap-5 rounded-sm bg-white p-5 shadow-[0_2px_12px_rgba(41,43,39,0.08)] sm:p-7" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm font-semibold">
          Title
          <input
            className="rounded-sm border border-[#deddd5] px-3 py-3 font-normal"
            name="title"
            value={form.title}
            onChange={updateField}
            maxLength="120"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Story
          <textarea
            className="min-h-56 rounded-sm border border-[#deddd5] px-3 py-3 font-normal leading-6"
            name="content"
            value={form.content}
            onChange={updateField}
            maxLength="20000"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Tags
          <input
            className="rounded-sm border border-[#deddd5] px-3 py-3 font-normal"
            name="tags"
            value={form.tags}
            onChange={updateField}
            placeholder="travel, food, everyday"
            maxLength="240"
          />
          <span className="font-normal text-[#85867e]">Separate up to 8 tags with commas.</span>
        </label>

        {(previewUrl || (postState?.imageUrl && !removeImage)) && (
          <div className="space-y-3">
            <img
              className="max-h-96 w-full rounded-sm object-cover"
              src={previewUrl || postState.imageUrl}
              alt="Post image preview"
            />
            {postState?.imageUrl && !image && (
              <label className="flex items-center gap-2 text-sm text-[#55564f]">
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(event) => setRemoveImage(event.target.checked)}
                />
                Remove current image
              </label>
            )}
          </div>
        )}

        <label className="grid gap-2 text-sm font-semibold">
          {isEditing ? 'Replace image (optional)' : 'Add an image (optional)'}
          <input
            className="rounded-sm border border-[#deddd5] p-3 text-sm font-normal"
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => {
              setImage(event.target.files?.[0] || null)
              setRemoveImage(false)
            }}
          />
          <span className="font-normal text-[#85867e]">JPEG, PNG, WebP, or GIF; maximum 5 MB.</span>
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="w-fit rounded-sm border border-[#343c32] px-6 py-3 text-sm font-semibold text-[#343c32] no-underline transition hover:bg-[#f3f2ec]"
            to={location.state?.returnTo || '/my-posts'}
          >
            ← Cancel and go back
          </Link>
          <button
            className="w-fit rounded-sm bg-[#343c32] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4b5747] disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Publish post'}
          </button>
        </div>
      </form>
    </section>
  )
}
