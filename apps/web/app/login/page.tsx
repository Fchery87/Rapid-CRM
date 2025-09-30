export const dynamic = "force-static";

export default function LoginPage() {
  return (
    <div aria-labelledby="login-title" className="bg-white p-6 rounded-lg shadow border">
      <h1 id="login-title" className="text-xl font-semibold mb-4">
        Sign in
      </h1>
      <form className="space-y-4" noValidate aria-describedby="login-help">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <p id="login-help" className="text-sm text-gray-600">
          This is a demo login form for accessibility gate checks.
        </p>
        <button
          type="submit"
          className="w-full rounded-md bg-brand-700 text-white px-4 py-2 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          Continue
        </button>
      </form>
    </div>
  );
}