"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.83 1.9-4.27 0-7.75-3.5-7.75-7.75s3.48-7.75 7.75-7.75c2.38 0 4.02 1.02 4.94 1.9l2.62-2.62C19.03 2.18 16.25 1 12.48 1 5.88 1 1 5.88 1 12s4.88 11 11.48 11c6.6 0 11.12-4.38 11.12-11.12 0-.75-.06-1.48-.18-2.18H12.48z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const [firebaseConfigured, setFirebaseConfigured] = useState(true);

  useEffect(() => {
    if (!auth) {
      setFirebaseConfigured(false);
      setError("Firebase is not configured. Please add your Firebase project credentials to the environment variables to enable login.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseConfigured) return;

    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth!, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!firebaseConfigured) return;

    setGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth!, provider);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // This is a common case, don't show an error.
      } else {
        setError('An unexpected error occurred during Google sign-in. Please try again.');
        console.error(err);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Select a login method to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
            <Alert variant="destructive">
               <AlertTitle>{!firebaseConfigured ? "Configuration Error" : "Login Failed"}</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={!firebaseConfigured || loading || googleLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required disabled={!firebaseConfigured || loading || googleLoading} />
          </div>
          <Button type="submit" disabled={loading || googleLoading || !firebaseConfigured} className="w-full">
            {loading && !googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Login with Email
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>
        
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={googleLoading || loading || !firebaseConfigured}>
          {googleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}
          Sign in with Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  );
}
