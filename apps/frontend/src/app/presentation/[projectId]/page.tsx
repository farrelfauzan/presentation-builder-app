import { PresentationView } from '@/components/presentation/PresentationView';

interface PresentationPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const { projectId } = await params;

  return <PresentationView projectId={projectId} />;
}
