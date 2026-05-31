import { redirect } from 'next/navigation';

/**
 * Root page — redirect langsung ke /login
 */
export default function HomePage() {
  redirect('/login');
}
