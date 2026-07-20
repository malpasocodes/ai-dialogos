import { useAuth, UserButton as ClerkUserButton } from '@clerk/astro/react';

export function UserButton() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <a href="/sign-in" className="nav-link whitespace-nowrap">
        Sign In
      </a>
    );
  }

  return <ClerkUserButton />;
}
