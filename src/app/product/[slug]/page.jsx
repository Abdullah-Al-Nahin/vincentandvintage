import { redirect } from 'next/navigation';

export default async function ProductRedirectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  if (slug) {
    redirect(`/products/${slug}`);
  }
  redirect('/');
}

