import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnMain = nextUrl.pathname.startsWith('/main');
            if (isOnDashboard || isOnMain) {
                if (isLoggedIn) {
                    if (isOnDashboard && auth.user.role === 'TEAM_MEMBER') {
                        return Response.redirect(new URL('/main', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // Redirect logged-in users away from login page to dashboard
                if (nextUrl.pathname === '/login') {
                    if (auth.user.role === 'TEAM_MEMBER') {
                        return Response.redirect(new URL('/main', nextUrl));
                    }
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            }
            return true;
        },
        jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string; // or explicit cast to alias
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
