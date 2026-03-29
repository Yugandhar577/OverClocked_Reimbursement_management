import { useState } from 'react'
import { ArrowRight, Building2, LogIn, UserPlus } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore.js'
import { Button } from '../../components/ui/button.jsx'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx'
import { Input } from '../../components/ui/input.jsx'

const initialSignupState = {
  companyName: '',
  country: 'India',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

const initialLoginState = {
  email: '',
  password: '',
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    'Unable to complete the request. Check the server and try again.'
  )
}

export function AuthPage({ mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const signup = useAuthStore((state) => state.signup)
  const status = useAuthStore((state) => state.status)
  const [loginState, setLoginState] = useState(initialLoginState)
  const [signupState, setSignupState] = useState(initialSignupState)
  const [error, setError] = useState('')
  const isSignup = mode === 'signup'
  const redirectTo = location.state?.from?.pathname ?? '/admin/dashboard'

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await login(loginState)
      navigate(redirectTo, { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await signup(signupState)
      navigate('/admin/dashboard', { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f2f6_0%,#f4efee_32%,#f7f3f1_100%)] px-6 py-10 text-ink-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.95fr]">
        <section className="surface-soft flex flex-col justify-between p-8 lg:p-10">
          <div className="space-y-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 text-white shadow-float">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-4">
              <p className="section-eyebrow">Enterprise Admin</p>
              <h1 className="font-display text-5xl font-black tracking-[-0.07em] text-ink-950">
                Operate reimbursements from one disciplined control room.
              </h1>
              <p className="max-w-xl text-base leading-8 text-ink-600">
                Sign in to the desktop workspace or create the first company admin
                to activate the merged backend and the admin dashboard together.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Live auth and refresh-cookie flow',
              'Approval, payment, and hierarchy APIs',
              'Desktop admin shell wired to Express',
            ].map((item) => (
              <div key={item} className="rounded-[24px] bg-white/80 px-4 py-4 shadow-soft">
                <p className="text-sm font-semibold leading-6 text-ink-700">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="flex flex-col justify-center p-8 lg:p-10">
          <CardHeader className="mb-8">
            <CardTitle className="text-3xl">
              {isSignup ? 'Create admin workspace' : 'Sign in'}
            </CardTitle>
            <CardDescription>
              {isSignup
                ? 'Create the first company admin and start using the live backend.'
                : 'Use your company admin credentials to access the desktop control surface.'}
            </CardDescription>
          </CardHeader>

          {error ? (
            <div className="mb-6 rounded-[20px] bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isSignup ? (
            <form className="space-y-5" onSubmit={handleSignupSubmit}>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Company Name
                </label>
                <Input
                  onChange={(event) =>
                    setSignupState((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                  placeholder="ExpenseFlow Enterprise"
                  value={signupState.companyName}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                    First Name
                  </label>
                  <Input
                    onChange={(event) =>
                      setSignupState((current) => ({
                        ...current,
                        firstName: event.target.value,
                      }))
                    }
                    placeholder="Elena"
                    value={signupState.firstName}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                    Last Name
                  </label>
                  <Input
                    onChange={(event) =>
                      setSignupState((current) => ({
                        ...current,
                        lastName: event.target.value,
                      }))
                    }
                    placeholder="Vance"
                    value={signupState.lastName}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[1.35fr_0.85fr]">
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                    Email
                  </label>
                  <Input
                    onChange={(event) =>
                      setSignupState((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="admin@company.com"
                    type="email"
                    value={signupState.email}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                    Country
                  </label>
                  <Input
                    onChange={(event) =>
                      setSignupState((current) => ({
                        ...current,
                        country: event.target.value,
                      }))
                    }
                    placeholder="India"
                    value={signupState.country}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Password
                </label>
                <Input
                  onChange={(event) =>
                    setSignupState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Create a secure password"
                  type="password"
                  value={signupState.password}
                />
              </div>

              <Button className="w-full" disabled={status === 'loading'} size="lg" type="submit">
                <UserPlus className="h-4 w-4" />
                Create Admin
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Email
                </label>
                <Input
                  onChange={(event) =>
                    setLoginState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="admin@company.com"
                  type="email"
                  value={loginState.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-500">
                  Password
                </label>
                <Input
                  onChange={(event) =>
                    setLoginState((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  type="password"
                  value={loginState.password}
                />
              </div>

              <Button className="w-full" disabled={status === 'loading'} size="lg" type="submit">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-8 flex items-center justify-between gap-4 text-sm">
            <span className="text-ink-500">
              {isSignup ? 'Already have an account?' : 'Need to create the first admin?'}
            </span>
            <Link
              className="inline-flex items-center gap-2 font-semibold text-brand-800 transition hover:text-brand-950"
              to={isSignup ? '/login' : '/signup'}
            >
              {isSignup ? 'Go to sign in' : 'Create admin'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
