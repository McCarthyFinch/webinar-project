'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

// Component that uses searchParams
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the 'from' parameter to redirect after login
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Redirect to the 'from' path or home page on successful login
      router.push(from);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className={styles.link}>
            Create account
          </Link>
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Fallback component while the LoginForm is loading
function LoginFormFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome back!</h1>
        <p className={styles.subtitle}>Loading login form...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
} 