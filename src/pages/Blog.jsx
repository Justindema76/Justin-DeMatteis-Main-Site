import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadBlogPosts } from '../lib/content';

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadBlogPosts().then(setPosts).catch(() => setPosts([]));
  }, []);

  return <main className="blog-page shared-wrap">
    <div className="shared-eyebrow">Blog</div>
    <h1>Development notes, projects and lessons learned.</h1>
    {posts.length === 0 ? <p className="shared-lead">No posts published yet.</p> :
      <div className="blog-grid">
        {posts.map(post => <article className="blog-card" key={post.id || post.slug}>
          <div className="shared-eyebrow">{post.category || 'Development'}</div>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <Link to={`/blog/${post.slug}`}>Read article →</Link>
        </article>)}
      </div>}
  </main>;
}
