import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadBlogPost } from '../lib/content';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined);

  useEffect(() => {
    loadBlogPost(slug).then(setPost).catch(() => setPost(null));
  }, [slug]);

  if (post === undefined) return <main className="status-page"><p>Loading…</p></main>;
  if (!post) return <main className="status-page"><h1>Article not found.</h1></main>;

  return <main className="article-page shared-wrap">
    <div className="shared-eyebrow">{post.category || 'Development'}</div>
    <h1>{post.title}</h1>
    {post.excerpt && <p className="article-lead">{post.excerpt}</p>}
    {post.featured_image && <img className="article-image" src={post.featured_image} alt=""/>}
    <div className="article-body" dangerouslySetInnerHTML={{ __html: post.body || '' }}/>
  </main>;
}
