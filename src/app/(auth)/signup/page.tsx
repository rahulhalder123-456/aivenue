"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
            <title>Google</title>
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.63 1.9-3.87 0-7-3.13-7-7s3.13-7 7-7c2.18 0 3.66.86 4.49 1.64l2.69-2.69C18.43 2.12 15.82 1 12.48 1 5.88 1 1 5.88 1 12.48s4.88 11.48 11.48 11.48c6.48 0 11.48-5.27 11.48-11.48 0-.79-.09-1.54-.23-2.26H12.48z"/>
        </svg>
    )
}

const ensureUserDocument = async (user: User) => {
    if (!db || !user) return;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        try {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous User',
                photoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
                overallProgress: 0,
                completedMilestones: 0,
                aiAssistantQueries: 0,
                activeStreak: 1,
                lastLoginDate: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    }
};

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!auth) {
        setError("Firebase is not configured. Please check your environment variables.");
        setLoading(false);
        return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserDocument(userCredential.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

    const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    if (!auth) {
        setError("Firebase is not configured. Please check your environment variables.");
        setLoading(false);
        return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await ensureUserDocument(result.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
        <CardHeader className="text-center">
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Get started with DevMap Pro for free.</CardDescription>
        </CardHeader>
        <CardContent>
             {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Signup Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
            </form>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn} disabled={loading}>
                <GoogleIcon className="h-4 w-4" />
                Sign up with Google
            </Button>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
        </CardFooter>
    </Card>
  );
}
