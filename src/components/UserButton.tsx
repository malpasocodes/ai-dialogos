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

  // Shown to any signed-in user; /admin itself redirects anyone who isn't ADMIN_USER_ID.
  return (
    <>
      <a href="/admin" className="nav-link whitespace-nowrap">
        Admin
      </a>
      <ClerkUserButton />
    </>
  );
}
