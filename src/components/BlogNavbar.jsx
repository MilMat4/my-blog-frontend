import { Link } from 'react-router-dom'

export default function BlogNavbar({ user, onLogout }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-[#deddd5] bg-[#f8f7f2]/95 shadow-sm backdrop-blur" aria-label="Main navigation">
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link className="font-[var(--serif)] text-xl font-semibold tracking-[0.12em] text-[#292b27] no-underline" to="/home">
            MY BLOG
          </Link>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-sm font-medium">
            <Link className="text-[#55564f] no-underline transition hover:text-[#b8563d]" to="/home">Home</Link>
            <Link className="text-[#55564f] no-underline transition hover:text-[#b8563d]" to="/my-posts">My Posts</Link>
            {user.role === 'superadmin' && (
              <Link className="text-[#55564f] no-underline transition hover:text-[#b8563d]" to="/admin/users">Users</Link>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-[#55564f] lg:inline">
              {user.name || user.email}
            </span>
            <button
              className="rounded-sm border border-[#292b27] px-3 py-2 text-xs transition hover:bg-[#292b27] hover:text-white sm:text-sm"
              type="button"
              onClick={onLogout}
            >
              Log out
            </button>
          </div>
        </div>

      </div>
    </nav>
  )
}
