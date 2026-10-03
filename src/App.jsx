import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteHeader from './components/layout/SiteHeader.jsx';
import SiteFooter from './components/layout/SiteFooter.jsx';
import RouteEffects from './components/layout/RouteEffects.jsx';
import Home from './pages/Home.jsx';

const About = lazy(() => import('./pages/About.jsx'));
const Experience = lazy(() => import('./pages/Experience.jsx'));
const Skills = lazy(() => import('./pages/Skills.jsx'));
const Projects = lazy(() => import('./pages/Projects.jsx'));
const ProjectDetails = lazy(() => import('./pages/ProjectDetails.jsx'));
const Research = lazy(() => import('./pages/Research.jsx'));
const Achievements = lazy(() => import('./pages/Achievements.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Academic = lazy(() => import('./pages/Academic.jsx'));
const Course = lazy(() => import('./pages/Course.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <RouteEffects />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" aria-hidden="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetails />} />
            <Route path="/research" element={<Research />} />
            <Route path="/experience" element={<Experience />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/academic" element={<Academic />} />
            {/* Courses; older /academic/:slug project URLs redirect from here too. */}
            <Route path="/academic/:slug/*" element={<Course />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
