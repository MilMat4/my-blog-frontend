import { Link } from 'react-router-dom'

export default function PublicNavbar({ onLogin }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-[#deddd5] bg-[#f8f7f2]/95 backdrop-blur" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link className="font-[var(--serif)] text-xl font-semibold tracking-[0.12em] text-[#292b27] no-underline" to="/">
          MY BLOG
        </Link>
        <Link
          className="rounded-sm border border-[#343c32] px-5 py-2 text-sm font-semibold text-[#343c32] transition hover:bg-[#343c32] hover:text-white"
          to="/login"
          onClick={onLogin}
        >
          Log in
        </Link>
      </div>
    </nav>
  )
}
