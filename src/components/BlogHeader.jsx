export default function BlogHeader({ error, welcomeName, compact = false }) {
  return (
    <header className={`px-2 text-center ${compact ? 'pb-6 pt-7 sm:py-8' : 'pb-8 pt-10 sm:py-12'}`}>
      {error && (
        <p className="mb-6 rounded-sm bg-[#fff2ef] p-3 text-sm text-[#a12718]" role="alert">
          {error}
        </p>
      )}
      <h1 className={`${compact ? 'font-[var(--sans)]' : 'font-[var(--serif)]'} text-4xl font-semibold tracking-[0.08em] sm:text-5xl`}>MY BLOG</h1>
      <p className="mt-2 text-sm text-[#55564f]">
        {welcomeName ? (
          <>Welcome to the blog of <span className="inline-block bg-[#292b27] px-2 py-1 text-white">{welcomeName}</span></>
        ) : (
          'Stories, places, and small moments worth remembering.'
        )}
      </p>
    </header>
  )
}
