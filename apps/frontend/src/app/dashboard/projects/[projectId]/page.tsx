import { SlideEditorView } from '@/components/slide/SlideEditorView';

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;

  return <SlideEditorView projectId={projectId} />;
}
