import { useState } from 'react'

export default function AuthPage({
  mode,
  onModeChange,
  onAuthenticate,
  onVerifySignup,
  onResendSignupCode,
  connectionError,
  onGoHome,
}) {
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const isSignUp = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email').toString().trim()
    const name = formData.get('name')?.toString().trim()
    const password = formData.get('password').toString()

    if (isSignUp && formData.get('password') !== formData.get('confirmPassword')) {
      setError('Your passwords do not match.')
      return
    }

    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      const result = await onAuthenticate({ email, name, password }, isSignUp)
      form.reset()
      if (isSignUp) {
        setVerificationEmail(result.email)
        setNotice('A six-digit verification code has been sent. Check your Mailtrap sandbox inbox.')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVerify(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const code = formData.get('code').toString().trim()
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      await onVerifySignup({ email: verificationEmail, code })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendCode() {
    setError('')
    setNotice('')
    setIsSubmitting(true)
    try {
      const result = await onResendSignupCode(verificationEmail)
      setNotice(result.message)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white md:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <section
        className="flex min-h-[260px] overflow-hidden bg-cover bg-center px-6 py-7 text-white sm:px-10 md:min-h-screen md:px-[clamp(32px,7vw,104px)]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgb(25 34 28 / 32%), rgb(25 34 28 / 58%)), url("https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1800&q=90")',
        }}
        aria-label="About the blog"
      >
        <div className="mx-auto flex w-full max-w-[620px] flex-1 flex-col justify-between">
          <a className="inline-flex w-fit items-center gap-3 text-[13px] font-bold tracking-[0.16em] text-white no-underline" href="/" aria-label="My Blog home">
            <span className="grid h-[38px] w-[38px] place-items-center rounded-full border border-white/70 font-[var(--serif)] text-[23px] font-normal tracking-normal">M</span>
            <span>MY BLOG</span>
          </a>
          <div className="max-w-[500px] py-9 md:py-[60px]">
            <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-[#e9c0a8]">A JOURNAL FOR THE CURIOUS</p>
            <h1 className="font-[var(--serif)] text-[clamp(44px,6vw,76px)] font-medium leading-[0.98]">Find a little more wonder in the everyday.</h1>
            <p className="mt-5 max-w-[350px] text-base leading-7 text-white/85">Stories, places, and small moments worth remembering.</p>
          </div>
          <p className="hidden text-xs tracking-wide text-white/70 md:block">A quiet corner of the internet.</p>
        </div>
      </section>

      <section className="grid min-h-[calc(100vh-260px)] place-items-center px-6 py-11 sm:px-10 md:min-h-screen md:px-[clamp(28px,6vw,88px)]" aria-labelledby="auth-title">
        <div className="w-full max-w-[420px]">
          <button
            className="mb-8 text-sm font-semibold text-[#55564f] transition hover:text-[#b8563d]"
            type="button"
            onClick={onGoHome}
          >
            ← Back to home
          </button>
          <p className="mb-2 text-[11px] font-bold tracking-[0.12em] text-[#b8563d]">
            {verificationEmail ? 'VERIFY YOUR EMAIL' : isSignUp ? 'JOIN THE JOURNAL' : 'YOUR JOURNAL AWAITS'}
          </p>
          <h2 id="auth-title" className="font-[var(--serif)] text-4xl font-medium leading-tight sm:text-[42px]">
            {verificationEmail ? 'Check your inbox' : isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mb-7 mt-3 leading-relaxed text-[#686960]">
            {verificationEmail
              ? `Enter the six-digit code sent to ${verificationEmail}. In development, find it in the Mailtrap sandbox inbox.`
              : isSignUp
                ? 'Make yourself at home. Sign up to get started.'
                : 'Log in to continue to your little corner of the internet.'}
          </p>

          {connectionError && (
            <p className="mb-4 rounded-sm bg-[#fff2ef] p-3 text-sm text-[#a12718]" role="alert">
              {connectionError}
            </p>
          )}
          {notice && (
            <p className="mb-4 rounded-sm bg-[#eef3eb] p-3 text-sm text-[#343c32]" role="status">
              {notice}
            </p>
          )}
          {verificationEmail ? (
            <div className="grid gap-4">
              <form className="grid gap-4" onSubmit={handleVerify}>
                <label className="grid gap-1.5 text-sm font-semibold text-[#383a35]">
                  Verification code
                  <input
                    className="w-full rounded-sm border border-[#deddd5] bg-white px-3 py-3 font-normal tracking-[0.25em] text-[#292b27] placeholder:text-[#9b9c94] focus:border-[#b8563d] focus:outline-2 focus:outline-[#b8563d]/20"
                    type="text"
                    name="code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    required
                  />
                </label>
                {error && <p className="m-0 text-[13px] text-[#a12718]" role="alert">{error}</p>}
                <button className="mt-1 flex items-center justify-between rounded-sm bg-[#343c32] px-4 py-3.5 font-bold text-white transition hover:bg-[#4b5747] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Please wait…' : 'Verify email'}
                  <span aria-hidden="true">→</span>
                </button>
              </form>
              <button
                className="text-sm font-semibold text-[#b8563d] disabled:opacity-60"
                type="button"
                onClick={handleResendCode}
                disabled={isSubmitting}
              >
                Resend verification code
              </button>
              <button
                className="text-sm font-semibold text-[#55564f] transition hover:text-[#b8563d]"
                type="button"
                onClick={() => {
                  setVerificationEmail('')
                  setError('')
                  setNotice('')
                }}
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={handleSubmit}>
            {isSignUp && (
              <label className="grid gap-1.5 text-sm font-semibold text-[#383a35]">
                Name
                <input
                  className="w-full rounded-sm border border-[#deddd5] bg-white px-3 py-3 font-normal text-[#292b27] placeholder:text-[#9b9c94] focus:border-[#b8563d] focus:outline-2 focus:outline-[#b8563d]/20"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                />
              </label>
            )}
            <label className="grid gap-1.5 text-sm font-semibold text-[#383a35]">
              Email address
              <input
                className="w-full rounded-sm border border-[#deddd5] bg-white px-3 py-3 font-normal text-[#292b27] placeholder:text-[#9b9c94] focus:border-[#b8563d] focus:outline-2 focus:outline-[#b8563d]/20"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-[#383a35]">
              Password
              <input
                className="w-full rounded-sm border border-[#deddd5] bg-white px-3 py-3 font-normal text-[#292b27] placeholder:text-[#9b9c94] focus:border-[#b8563d] focus:outline-2 focus:outline-[#b8563d]/20"
                type="password"
                name="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                placeholder="At least 8 characters"
                minLength="8"
                required
              />
            </label>
            {isSignUp && (
              <label className="grid gap-1.5 text-sm font-semibold text-[#383a35]">
                Confirm password
                <input
                  className="w-full rounded-sm border border-[#deddd5] bg-white px-3 py-3 font-normal text-[#292b27] placeholder:text-[#9b9c94] focus:border-[#b8563d] focus:outline-2 focus:outline-[#b8563d]/20"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  minLength="8"
                  required
                />
              </label>
            )}
            {error && <p className="m-0 text-[13px] text-[#a12718]" role="alert">{error}</p>}
            <button className="mt-1 flex items-center justify-between rounded-sm bg-[#343c32] px-4 py-3.5 font-bold text-white transition hover:bg-[#4b5747] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Log in'}
              <span aria-hidden="true">→</span>
            </button>
            </form>
          )}

          {!verificationEmail && (
            <>
              <p className="mt-5 text-center text-sm">
                {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
                <button
                  type="button"
                  className="font-bold text-[#b8563d]"
                  onClick={() => {
                    setError('')
                    setNotice('')
                    onModeChange(isSignUp ? 'login' : 'signup')
                  }}
                >
                  {isSignUp ? 'Log in' : 'Sign up'}
                </button>
              </p>
              <p className="mt-5 text-center text-xs text-[#77786f]">
                Passwords are securely hashed before your account is saved.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
