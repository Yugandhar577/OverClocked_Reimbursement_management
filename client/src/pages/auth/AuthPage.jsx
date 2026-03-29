import { useState } from 'react'
import { ArrowRight, Building2, LogIn, UserPlus } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { resolveHomePath } from '../../components/auth/AuthGuard.jsx'
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

const demoAccounts = [
  {
    label: 'Demo Employee',
    email: 'employee.demo+20260329@example.com',
    password: 'Employee1234',
  },
  {
    label: 'Demo Manager',
    email: 'manager.demo+20260329@example.com',
    password: 'Manager1234',
  },
  {
    label: 'Demo Admin',
    email: 'devsm.admin+20260329@example.com',
    password: 'Admin1234',
  },
]

function getErrorMessage(error) {
  if (!error?.response && /network error/i.test(error?.message ?? '')) {
    return 'Unable to reach the backend API. Start the server or set VITE_API_URL if it is running on a different host or port.'
  }

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
  const redirectTo = location.state?.from?.pathname

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const session = await login(loginState)
      navigate(redirectTo ?? resolveHomePath(session.user), { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const session = await signup(signupState)
      navigate(resolveHomePath(session.user), { replace: true })
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-6 py-10 text-ink-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.95fr]">
        <section className="surface-soft flex flex-col justify-between p-8 lg:p-10">
          <div className="space-y-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-brand-900 text-white shadow-soft">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="space-y-4">
              <p className="section-eyebrow">Enterprise Expense Workspace</p>
              <h1 className="text-5xl font-semibold tracking-[-0.07em] text-ink-950">
                Review expenses, approvals, reports, and payouts in one place.
              </h1>
              <p className="max-w-xl text-base leading-8 text-ink-600">
                The app now has separate employee, manager, and admin review surfaces.
                Use the demo credentials below to inspect each flow directly.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Odoo-inspired desktop expense layouts',
              'Employee, manager, and admin role flows',
              'Live Express and Prisma backend',
            ].map((item) => (
              <div key={item} className="rounded-md border border-line bg-white px-4 py-4 shadow-soft">
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
                : 'Use the role-based credentials below or your company account to access the right workspace.'}
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
                  autoComplete="organization"
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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
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
                    autoComplete="email"
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
                    autoComplete="country-name"
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
                  autoComplete="new-password"
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
                  autoComplete="email"
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
                  autoComplete="current-password"
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

              <div className="space-y-3 border-t border-line pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-500">
                  Quick Access
                </p>
                <div className="grid gap-2 md:grid-cols-3">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.label}
                      className="rounded-md border border-line bg-[#f7f8fa] px-3 py-3 text-left text-sm"
                      onClick={() => {
                        setLoginState({
                          email: account.email,
                          password: account.password,
                        })
                      }}
                      type="button"
                    >
                      <p className="font-semibold text-ink-950">{account.label}</p>
                      <p className="mt-1 truncate text-xs text-ink-500">{account.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          <div className="mt-8 flex items-center justify-between gap-4 text-sm">
            <span className="text-ink-500">
              {isSignup ? 'Already have an account?' : 'Need to create the first admin?'}
            </span>
            <Link
              className="inline-flex items-center gap-2 font-semibold text-brand-800"
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
