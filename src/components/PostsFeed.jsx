import { useState } from 'react'
import { Link } from 'react-router-dom'

const featureImages = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=85',
]

function authorName(post) {
  if (post.author && typeof post.author === 'object') {
    return post.author.name || 'Unknown author'
  }
  return 'Author'
}

function PostCard({ post, selectedTag, onSelectTag }) {
  return (
    <article className="mb-7 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.16)]">
      {post.imageUrl && (
        <img
          className="max-h-[440px] w-full object-cover"
          src={post.imageUrl}
          alt={`Cover for ${post.title}`}
        />
      )}
      <div className="px-4 pb-3 pt-2 sm:px-5">
        <h3 className="text-2xl font-bold sm:text-3xl">{post.title}</h3>
        <h4 className="mt-1 text-base font-medium text-[#666]">
          By {authorName(post)}, <span className="font-normal">{new Date(post.createdAt).toLocaleDateString()}</span>
        </h4>
      </div>
      <div className="px-4 pb-4 sm:px-5">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#333]">
          {post.content.length > 420 ? `${post.content.slice(0, 420).trimEnd()}…` : post.content}
        </p>
        {post.tags?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Post tags">
            {post.tags.map((tag) => (
              <button
                className={`px-2 py-1 text-xs transition hover:bg-[#343c32] hover:text-white ${
                  selectedTag === tag ? 'bg-[#343c32] text-white' : 'bg-[#eee] text-[#333]'
                }`}
                type="button"
                aria-pressed={selectedTag === tag}
                key={tag}
                onClick={() => onSelectTag(selectedTag === tag ? '' : tag)}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-4">
          <Link
            className="border border-[#777] bg-white px-4 py-2 text-sm font-bold no-underline transition hover:bg-[#eee]"
            to={`/posts/${post._id}`}
          >
            READ MORE »
          </Link>
          <span className="text-sm text-[#555]">{post.views || 0} {(post.views || 0) === 1 ? 'view' : 'views'}</span>
        </div>
      </div>
      <div className="border-t border-[#eee] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#555] sm:px-5">
        Shared by {authorName(post)}
      </div>
    </article>
  )
}

export default function PostsFeed({
  posts,
  isLoading,
  error,
  carousel = false,
  onExplore,
  selectedTag = '',
  onSelectTag = () => {},
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags?.includes(selectedTag))
    : posts
  const activePost = filteredPosts.length > 0 ? filteredPosts[activeIndex % filteredPosts.length] : null
  const featureImage = activePost?.imageUrl || featureImages[(activeIndex % featureImages.length)]
  const pageSize = 4
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(filteredPosts.length / pageSize)
  const visiblePage = Math.min(page, Math.max(0, pageCount - 1))
  const pagePosts = filteredPosts.slice(visiblePage * pageSize, (visiblePage + 1) * pageSize)

  function selectTag(tag) {
    setActiveIndex(0)
    setPage(0)
    onSelectTag(tag)
  }

  function moveSlide(direction) {
    setActiveIndex((index) => (index + direction + filteredPosts.length) % filteredPosts.length)
  }

  return (
    <section id={carousel ? 'home' : 'home-feed'} className="scroll-mt-24 space-y-6" aria-label={carousel ? 'Featured posts' : 'All posts'}>
      {carousel ? (
        <div className="space-y-7">
          <header className="mx-auto max-w-3xl py-3 text-center sm:py-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b8563d]">A journal for the curious</p>
            <h1 className="mt-4 font-[var(--serif)] text-5xl font-medium leading-[0.98] tracking-tight sm:text-7xl">
              Find a little more wonder in the everyday.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#686960] sm:text-base">
              Thoughtful stories, new perspectives, and small moments worth remembering.
            </p>
          </header>

          <div className="overflow-hidden rounded-sm bg-white shadow-[0_10px_35px_rgba(41,43,39,0.12)]">
            <div className="grid md:min-h-[410px] md:grid-cols-[1.02fr_0.98fr]">
              <div
                className="relative min-h-[240px] bg-cover bg-center sm:min-h-[300px] md:min-h-full"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgb(25 34 28 / 5%), rgb(25 34 28 / 25%)), url("${featureImage}")`,
                }}
                role="img"
                aria-label="A quiet landscape from the journal"
              >
                <span className="absolute left-5 top-5 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#343c32]">
                  On the journal
                </span>
              </div>

              <div className="flex flex-col justify-between gap-8 bg-white p-6 sm:p-9 md:p-11">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b8563d]">Featured story</p>
                  {filteredPosts.length > 0 && (
                    <span className="text-xs tabular-nums text-[#85867e]">
                      {activeIndex % filteredPosts.length + 1} <span className="px-1">/</span> {filteredPosts.length}
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <p className="text-sm text-[#55564f]">Finding the latest stories…</p>
                ) : error ? (
                  <p className="rounded-sm bg-[#fff2ef] p-4 text-sm text-[#a12718]" role="alert">{error}</p>
                ) : activePost ? (
                  <div aria-live="polite" key={activePost._id}>
                    <p className="text-sm text-[#b8563d]">A story by {authorName(activePost)}</p>
                    <h2 className="mt-3 font-[var(--serif)] text-4xl font-semibold leading-tight text-[#292b27] sm:text-5xl">
                      {activePost.title}
                    </h2>
                    <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-7 text-[#686960] sm:text-base">
                      {activePost.content}
                    </p>
                    <p className="mt-5 text-xs text-[#85867e]">{new Date(activePost.createdAt).toLocaleDateString()}</p>
                    <p className="mt-2 text-xs text-[#85867e]">{activePost.views || 0} {(activePost.views || 0) === 1 ? 'view' : 'views'}</p>
                    {activePost.tags?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2" aria-label="Post tags">
                        {activePost.tags.map((tag) => (
                          <button
                            className={`px-2 py-1 text-xs transition hover:bg-[#343c32] hover:text-white ${
                              selectedTag === tag ? 'bg-[#343c32] text-white' : 'bg-[#eee] text-[#333]'
                            }`}
                            type="button"
                            aria-pressed={selectedTag === tag}
                            key={tag}
                            onClick={() => selectTag(selectedTag === tag ? '' : tag)}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                    <Link
                      className="mt-4 inline-block border border-[#777] px-4 py-2 text-sm font-bold text-[#292b27] no-underline transition hover:bg-[#eee]"
                      to={`/posts/${activePost._id}`}
                    >
                      Read the featured story »
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-[#b8563d]">Your next favorite story is waiting</p>
                    <h2 className="mt-3 font-[var(--serif)] text-4xl font-semibold leading-tight text-[#292b27] sm:text-5xl">
                      Stories begin with a single moment.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#686960]">
                      Come back soon to discover the first stories shared by our community.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#eeede7] pt-5">
                  <span className="text-xs uppercase tracking-[0.12em] text-[#85867e]">Stories worth slowing down for</span>
                  {filteredPosts.length > 1 && (
                    <div className="flex gap-2">
                      <button className="grid h-10 w-10 place-items-center rounded-full border border-[#deddd5] text-[#343c32] transition hover:bg-[#343c32] hover:text-white" type="button" aria-label="Previous featured post" onClick={() => moveSlide(-1)}>←</button>
                      <button className="grid h-10 w-10 place-items-center rounded-full border border-[#deddd5] text-[#343c32] transition hover:bg-[#343c32] hover:text-white" type="button" aria-label="Next featured post" onClick={() => moveSlide(1)}>→</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <p className="text-sm text-[#686960]">Curious to see where the stories take you?</p>
            <button
              className="rounded-sm bg-[#343c32] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4b5747]"
              type="button"
              onClick={onExplore}
            >
              Explore the journal <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="grid gap-4 border-y border-[#deddd5] py-6 text-center sm:grid-cols-3 sm:py-7">
            <div>
              <p className="font-[var(--serif)] text-2xl font-semibold">Discover</p>
              <p className="mt-1 text-xs text-[#85867e]">Fresh perspectives from the community</p>
            </div>
            <div>
              <p className="font-[var(--serif)] text-2xl font-semibold">Take a moment</p>
              <p className="mt-1 text-xs text-[#85867e]">Read at your own pace</p>
            </div>
            <div>
              <p className="font-[var(--serif)] text-2xl font-semibold">Share yours</p>
              <p className="mt-1 text-xs text-[#85867e]">Every good story has a beginning</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="mb-2 text-2xl font-bold">
              {selectedTag ? `Stories tagged #${selectedTag}` : 'Latest stories'}
            </h2>
            {selectedTag && (
              <button
                className="mb-2 text-sm font-semibold text-[#343c32] underline underline-offset-4"
                type="button"
                onClick={() => selectTag('')}
              >
                Clear tag filter
              </button>
            )}
          </div>
          {isLoading ? (
            <p className="text-sm text-[#55564f]">Loading posts…</p>
          ) : error ? (
            <p className="rounded-sm bg-[#fff2ef] p-4 text-sm text-[#a12718]" role="alert">{error}</p>
          ) : filteredPosts.length === 0 ? (
            <p className="rounded-sm bg-white p-5 text-sm text-[#55564f]">
              {selectedTag
                ? `No posts have been published with the tag #${selectedTag}.`
                : 'No posts have been published yet.'}
            </p>
          ) : (
            <div aria-live="polite">
              {pagePosts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  selectedTag={selectedTag}
                  onSelectTag={selectTag}
                />
              ))}
            </div>
          )}
          {pageCount > 1 && (
            <nav className="flex items-center justify-between border-t border-[#ccc] pt-4" aria-label="Post pages">
              <button
                className="border border-[#777] bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={visiblePage === 0}
                onClick={() => setPage(Math.max(visiblePage - 1, 0))}
              >
                « Previous
              </button>
              <span className="text-sm text-[#555]" aria-live="polite">Page {visiblePage + 1} of {pageCount}</span>
              <button
                className="border border-[#777] bg-white px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={visiblePage + 1 >= pageCount}
                onClick={() => setPage(Math.min(visiblePage + 1, pageCount - 1))}
              >
                Next »
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
