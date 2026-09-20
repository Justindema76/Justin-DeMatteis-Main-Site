import { useEffect, useState } from 'react';
import { loadPublishedPage } from '../lib/content';
import PageRenderer from '../components/PageRenderer';

export default function ManagedPage({ pageId }) {
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setPage(null);
    setError('');
    loadPublishedPage(pageId)
      .then(value => { if (active) setPage(value); })
      .catch(err => { if (active) setError(err.message || 'Unable to load page'); });
    return () => { active = false; };
  }, [pageId]);

  if (error) return <main className="status-page"><h1>Unable to load this page.</h1><p>{error}</p></main>;
  if (!page) return <main className="status-page"><p>Loading…</p></main>;
  return <PageRenderer data={page.content}/>;
}
