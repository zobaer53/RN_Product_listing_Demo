import { useRouter } from 'expo-router';

import { NotFoundState } from '@shared/ui/NotFoundState';

export default function NotFoundRoute() {
  const router = useRouter();
  return <NotFoundState onBack={() => router.replace('/')} />;
}
