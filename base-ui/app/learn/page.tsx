import { headers } from 'next/headers';
import { getAppConfig, getOrigin } from '@/lib/utils';
import LearningSessionPage from '@/components/pages/learning-session';

export default async function LearnPage() {
  const hdrs = await headers();
  const origin = getOrigin(hdrs);
  const appConfig = await getAppConfig(origin);

  return <LearningSessionPage appConfig={appConfig} />;
} 