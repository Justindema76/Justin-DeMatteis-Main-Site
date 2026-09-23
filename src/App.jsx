import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import SEO from './components/SEO';
import ManagedPage from './pages/ManagedPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import WorkPost from './pages/WorkPost';

export default function App() {
  return <>
    <SEO />
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ManagedPage pageId="home" />} />
        <Route path="/work" element={<ManagedPage pageId="work" />} />
        <Route path="/work/jill-and-the-beanstalk" element={<ManagedPage pageId="work-jill" />} />
        <Route path="/work/wheels-automotive" element={<ManagedPage pageId="work-wheels" />} />
        <Route path="/work/wordpress-websites" element={<ManagedPage pageId="work-wordpress" />} />
        <Route path="/work/:slug" element={<WorkPost />} />
        <Route path="/about" element={<ManagedPage pageId="about" />} />
        <Route path="/ai-development" element={<ManagedPage pageId="ai-development" />} />
        <Route path="/experience" element={<ManagedPage pageId="experience" />} />
        <Route path="/contact" element={<ManagedPage pageId="contact" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<main className="status-page"><h1>Page not found.</h1></main>} />
      </Route>
    </Routes>
  </>;
}
