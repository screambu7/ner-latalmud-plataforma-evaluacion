import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir siempre al login desde la página principal
  redirect('/login');
}
