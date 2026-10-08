import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import AdminUserPostsPage from './components/AdminUserPostsPage.jsx'
import AuthPage from './components/AuthPage.jsx'
import BlogHeader from './components/BlogHeader.jsx'
import BlogNavbar from './components/BlogNavbar.jsx'
import BlogSidebar from './components/BlogSidebar.jsx'
import PostManager from './components/PostManager.jsx'
import PostEditorPage from './components/PostEditorPage.jsx'
import PostDetailPage from './components/PostDetailPage.jsx'
import PostsFeed from './components/PostsFeed.jsx'
import PublicNavbar from './components/PublicNavbar.jsx'
import UserDirectory from './components/UserDirectory.jsx'
import { apiRequest } from './services/api.js'

function CenteredMessage({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f7f2] text-sm text-[#55564f]">
      {children}
    </main>
  )
}

function ProtectedLayout({ user, onLogout }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2]">
      <BlogNavbar user={user} onLogout={onLogout} />
      <Outlet />
    </div>
  )
}

function DashboardPage({
  children,
  sidebar = false,
  user,
  posts = [],
  welcomeName,
  selectedTag,
  onSelectTag,
}) {
  return (
    <>
      <div className={sidebar ? 'bg-[#f1f1f1]' : ''}>
        <div className={`mx-auto px-4 sm:px-6 ${sidebar ? 'max-w-[1400px]' : 'max-w-7xl'}`}>
          <BlogHeader welcomeName={welcomeName} compact={sidebar} />
          <div className={`grid items-start gap-8 pb-10 ${sidebar ? 'lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]' : ''}`}>
            <main className="min-w-0" aria-label="Page content">{children}</main>
            {sidebar && (
              <aside>
                <BlogSidebar
                  posts={posts}
                  user={user}
                  selectedTag={selectedTag}
                  onSelectTag={onSelectTag}
                />
              </aside>
            )}
          </div>
        </div>
        <footer className="bg-[#292b27] px-4 py-8 text-center text-sm text-white/70">
          Stories, places, and small moments worth remembering.
        </footer>
      </div>
    </>
  )
}

function Blog() {
  const navigate = useNavigate()
  const location = useLocation()
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [appError, setAppError] = useState('')
  const [publicPostsState, setPublicPostsState] = useState(null)
  const [publicPostsError, setPublicPostsError] = useState('')
  const [ownPostsState, setOwnPostsState] = useState(null)
  const [usersState, setUsersState] = useState(null)
  const [selectedTag, setSelectedTag] = useState('')
  const ownPosts = user && ownPostsState?.userId === user.id ? ownPostsState.posts : []
  const users = user && usersState?.userId === user.id ? usersState.users : []
  const publicPosts = publicPostsState || []
  const popularPosts = [...publicPosts].sort((first, second) =>
    (second.views || 0) - (first.views || 0)
      || new Date(second.createdAt) - new Date(first.createdAt),
  )
  const isLoadingOwnPosts = Boolean(user && ownPostsState?.userId !== user.id)
  const isLoadingUsers = Boolean(user?.role === 'superadmin' && usersState?.userId !== user.id)
  const isLoadingPublicPosts = publicPostsState === null && !publicPostsError

  useEffect(() => {
    document.title = location.pathname === '/login' && !user ? 'Log in | My Blog' : 'My Blog'
  }, [location.pathname, user])

  useEffect(() => {
    let cancelled = false

    apiRequest('/api/auth/me')
      .then(({ user: currentUser }) => {
        if (!cancelled) {
          setUser(currentUser)
        }
      })
      .catch((error) => {
        if (!cancelled && error.message !== 'Not signed in.') {
          setAppError(error.message)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsCheckingSession(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    apiRequest('/api/posts/public')
      .then(({ posts: currentPosts }) => {
        if (!cancelled) {
          setPublicPostsState(currentPosts)
          setPublicPostsError('')
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setPublicPostsError(error.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!user) {
      return undefined
    }

    let cancelled = false
    apiRequest('/api/posts')
      .then(({ posts: currentPosts }) => {
        if (!cancelled) {
          setOwnPostsState({ userId: user.id, posts: currentPosts })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAppError(error.message)
          setOwnPostsState({ userId: user.id, posts: [] })
        }
      })

    if (user.role === 'superadmin') {
      apiRequest('/api/users')
        .then(({ users: allUsers }) => {
          if (!cancelled) {
            setUsersState({ userId: user.id, users: allUsers })
          }
        })
        .catch((error) => {
          if (!cancelled) {
            setAppError(error.message)
            setUsersState({ userId: user.id, users: [] })
          }
        })
    }

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleAuthenticate(account, isSignUp) {
    if (isSignUp) {
      const result = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(account),
      })
      setAppError('')
      return result
    }

    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(account),
    })
    setUser(result.user)
    setAppError('')
    navigate('/home')
  }

  async function handleVerifySignup(verification) {
    const result = await apiRequest('/api/auth/verify-signup', {
      method: 'POST',
      body: JSON.stringify(verification),
    })
    setUser(result.user)
    setAppError('')
    navigate('/home')
  }

  async function handleResendSignupCode(email) {
    return apiRequest('/api/auth/resend-signup-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async function handleLogout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
      navigate('/')
      setAppError('')
      setAuthMode('login')
      setOwnPostsState(null)
      setUsersState(null)
      setUser(null)
    } catch (error) {
      setAppError(error.message)
    }
  }

  async function handleCreatePost(postInput) {
    const { post } = await apiRequest('/api/posts', {
      method: 'POST',
      body: postInput,
    })
    setOwnPostsState((current) => ({
      userId: user.id,
      posts: [post, ...(current?.userId === user.id ? current.posts : [])],
    }))
    setPublicPostsState((currentPosts) => [
      { ...post, author: { _id: user.id, name: user.name } },
      ...(currentPosts || []),
    ])
    return post
  }

  async function handleUpdatePost(postId, postInput) {
    const { post } = await apiRequest(`/api/posts/${postId}`, {
      method: 'PATCH',
      body: postInput,
    })
    setOwnPostsState((current) => ({
      userId: user.id,
      posts: (current?.userId === user.id ? current.posts : []).map((item) =>
        item._id === postId ? post : item,
      ),
    }))
    setPublicPostsState((currentPosts) =>
      (currentPosts || []).map((item) =>
        item._id === postId ? { ...post, author: item.author } : item,
      ),
    )
    return post
  }

  async function handleDeletePost(postId) {
    await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' })
    setOwnPostsState((current) => ({
      userId: user.id,
      posts: (current?.userId === user.id ? current.posts : []).filter((post) => post._id !== postId),
    }))
    setPublicPostsState((currentPosts) =>
      (currentPosts || []).filter((post) => post._id !== postId),
    )
  }

  const handlePostViewed = useCallback((viewedPost) => {
    setPublicPostsState((currentPosts) =>
      (currentPosts || []).map((post) => post._id === viewedPost._id
        ? { ...viewedPost, author: post.author || viewedPost.author }
        : post),
    )
    if (user) {
      setOwnPostsState((current) => current?.userId === user.id
        ? {
          ...current,
          posts: current.posts.map((post) => post._id === viewedPost._id ? viewedPost : post),
        }
        : current)
    }
  }, [user])

  if (isCheckingSession) {
    return <CenteredMessage>Checking your session…</CenteredMessage>
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user
            ? <Navigate to="/home" replace />
            : (
              <div className="min-h-screen bg-[#f8f7f2]">
                <PublicNavbar onLogin={() => setAuthMode('login')} />
                <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9">
                  <PostsFeed
                    carousel
                    posts={popularPosts}
                    isLoading={isLoadingPublicPosts}
                    error={publicPostsError}
                    onExplore={() => navigate('/login')}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                  />
                </main>
                <footer className="bg-[#292b27] px-4 py-8 text-center text-sm text-white/70">
                  Stories, places, and small moments worth remembering.
                </footer>
              </div>
            )
        }
      />
      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/home" replace />
            : (
              <AuthPage
                mode={authMode}
                onModeChange={setAuthMode}
                connectionError={appError}
                onAuthenticate={handleAuthenticate}
                onVerifySignup={handleVerifySignup}
                onResendSignupCode={handleResendSignupCode}
                onGoHome={() => navigate('/')}
              />
            )
        }
      />
      <Route
        path="/posts/:postId"
        element={
          <div className="min-h-screen bg-[#f1f1f1]">
            {user ? <BlogNavbar user={user} onLogout={handleLogout} /> : <PublicNavbar onLogin={() => setAuthMode('login')} />}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              <PostDetailPage
                onViewed={handlePostViewed}
                onSelectTag={(tag) => {
                  setSelectedTag(tag)
                  navigate(user ? '/home' : '/')
                }}
              />
            </main>
            <footer className="bg-[#292b27] px-4 py-8 text-center text-sm text-white/70">
              Stories, places, and small moments worth remembering.
            </footer>
          </div>
        }
      />
      <Route element={<ProtectedLayout user={user} onLogout={handleLogout} />}>
        <Route
          path="/home"
          element={
            <DashboardPage
              sidebar
              user={user}
              posts={popularPosts}
              welcomeName={user?.name}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
            >
              <PostsFeed
                posts={publicPosts}
                isLoading={isLoadingPublicPosts}
                error={publicPostsError}
                selectedTag={selectedTag}
                onSelectTag={setSelectedTag}
              />
            </DashboardPage>
          }
        />
        <Route
          path="/my-posts"
          element={
            <DashboardPage>
              {isLoadingOwnPosts ? (
                <p className="text-sm text-[#55564f]">Loading your posts…</p>
              ) : (
                <PostManager
                  sectionId="my-posts"
                  title="My posts"
                  posts={ownPosts}
                  onCreate={handleCreatePost}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                  createHref="/create"
                />
              )}
            </DashboardPage>
          }
        />
        <Route
          path="/create"
          element={
            <DashboardPage>
              <PostEditorPage onCreate={handleCreatePost} onUpdate={handleUpdatePost} />
            </DashboardPage>
          }
        />
        <Route
          path="/posts/:postId/edit"
          element={
            <DashboardPage>
              <PostEditorPage onCreate={handleCreatePost} onUpdate={handleUpdatePost} />
            </DashboardPage>
          }
        />
        <Route
          path="/admin/users"
          element={
            user?.role === 'superadmin'
              ? (
                <DashboardPage>
                  {isLoadingUsers ? (
                    <p className="text-sm text-[#55564f]">Loading users…</p>
                  ) : (
                    <UserDirectory users={users} />
                  )}
                </DashboardPage>
              )
              : <Navigate to="/home" replace />
          }
        />
        <Route
          path="/admin/users/:userId/posts"
          element={
            user?.role === 'superadmin'
              ? (
                <DashboardPage>
                  <AdminUserPostsPage onDelete={handleDeletePost} />
                </DashboardPage>
              )
              : <Navigate to="/home" replace />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/home' : '/'} replace />} />
    </Routes>
  )
}

export default Blog
