'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from '../login/page.module.css';

// Component that uses searchParams
function SignupForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  
  // Get the 'from' parameter to redirect after signup and login
  const from = searchParams.get('from') || '/';

  // Clear any RSC parameters from the URL on mount
  useEffect(() => {
    if (window.location.href.includes('_rsc=')) {
      const cleanUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
        credentials: 'include', // Ensure cookies are sent with the request
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('Signup successful, now logging in');

      // After successful signup, log in automatically
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Ensure cookies are sent with the request
      });

      if (!loginResponse.ok) {
        console.log('Auto-login failed, redirecting to login page');
        // If auto-login fails, redirect to login page using window.location
        window.location.href = '/login';
        return;
      }

      console.log('Login successful, redirecting to:', from);
      
      // Add a small delay before redirect to ensure cookie is set
      setTimeout(() => {
        // Use window.location.href for full page navigation
        window.location.href = from;
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>
          Already have an account?{' '}
          <Link href="/login" className={styles.link}>
            Sign in
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
            <label htmlFor="username" className={styles.label}>
              Username <span className={styles.required}>*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
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
              placeholder="At least 8 characters"
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm Password <span className={styles.required}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Fallback component while the SignupForm is loading
function SignupFormFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Loading signup form...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFormFallback />}>
      <SignupForm />
    </Suspense>
  );
} 