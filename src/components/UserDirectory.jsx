import { Link } from 'react-router-dom'

export default function UserDirectory({ users }) {
  return (
    <section id="users" className="scroll-mt-24 overflow-hidden rounded-sm bg-white shadow-[0_2px_12px_rgba(41,43,39,0.08)]">
      <div className="border-b border-[#eeede7] px-5 py-4">
        <h2 className="font-[var(--serif)] text-2xl font-semibold">All users</h2>
        <p className="mt-1 text-sm text-[#85867e]">Choose a user to view and manage their posts.</p>
      </div>
      {users.length === 0 ? (
        <p className="p-5 text-sm text-[#55564f]">No users found.</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li className="border-b border-[#eeede7] last:border-b-0" key={user._id}>
              <Link
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left no-underline transition hover:bg-[#f8f7f2]"
                to={`/admin/users/${user._id}/posts`}
              >
                <span>
                  <span className="block font-semibold">{user.name}</span>
                  <span className="mt-1 block text-sm text-[#85867e]">{user.email}</span>
                </span>
                <span className="shrink-0 text-xs uppercase tracking-wide text-[#85867e]">{user.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
