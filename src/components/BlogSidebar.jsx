import { Link } from 'react-router-dom'

function getAuthorName(post) {
  return typeof post.author === 'object' ? post.author?.name || 'Unknown author' : 'Community member'
}

function getTopicTags(posts) {
  const tagCounts = new Map()
  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1))
  })
  return [...tagCounts.entries()].sort((first, second) => second[1] - first[1]).slice(0, 14).map(([tag]) => tag)
}

export default function BlogSidebar({ posts, user, selectedTag = '', onSelectTag = () => {} }) {
  const popularPosts = posts.slice(0, 4)
  const avatar = posts.find((post) => post.imageUrl)?.imageUrl
  const topicTags = getTopicTags(posts)

  return (
    <aside className="space-y-6" aria-label="Blog information">
      <section className="overflow-hidden bg-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
        {avatar && <img className="max-h-56 w-full object-cover" src={avatar} alt="A story from the blog" />}
        <div className="p-4">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="mt-2 text-sm leading-6 text-[#555]">
            {user.email}<br />
            {user.role === 'superadmin' ? 'Superadmin' : 'Community member'} of this journal.
          </p>
        </div>
      </section>

      <section className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]" aria-labelledby="popular-posts-heading">
        <h2 id="popular-posts-heading" className="p-4 text-lg font-semibold">Popular Posts</h2>
        {popularPosts.length ? (
          <ul className="divide-y divide-[#eee]">
            {popularPosts.map((post) => (
              <li key={post._id}>
                <Link
                  className="flex items-center gap-3 p-3 text-inherit no-underline transition hover:bg-[#f1f1f1]"
                  to={`/posts/${post._id}`}
                >
                  {post.imageUrl && (
                    <img className="h-12 w-12 shrink-0 object-cover" src={post.imageUrl} alt="" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{post.title}</p>
                    <p className="truncate text-xs text-[#666]">{getAuthorName(post)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 pb-4 text-sm text-[#555]">No posts have been published yet.</p>
        )}
      </section>

      <section className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]" aria-labelledby="post-tags-heading">
        <h2 id="post-tags-heading" className="p-4 text-lg font-semibold">Tags</h2>
        <div className="flex flex-wrap gap-2 p-4 pt-0">
          {topicTags.length ? topicTags.map((tag) => (
            <button
              className={`px-2 py-1 text-xs transition hover:bg-[#343c32] hover:text-white ${
                selectedTag === tag
                  ? 'bg-[#343c32] text-white'
                  : 'bg-[#eee] text-[#333]'
              }`}
              key={tag}
              type="button"
              aria-pressed={selectedTag === tag}
              onClick={() => onSelectTag(selectedTag === tag ? '' : tag)}
            >
              {tag}
            </button>
          )) : <span className="text-sm text-[#555]">Tags will appear when posts are published.</span>}
        </div>
      </section>
    </aside>
  )
}
