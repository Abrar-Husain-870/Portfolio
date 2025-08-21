import { Helmet } from 'react-helmet-async'
import Navbar from './components/layout/Navbar'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Projects from './components/sections/Projects'
import Contact from './components/sections/Contact'
import Chatbot from './components/sections/Chatbot'
import Footer from './components/layout/Footer'
import { SplashCursor } from './components/react-bits'
import { ChatDock } from './components/react-bits'

function App() {
  return (
    <>
      <Helmet>
        <title>Syed Abrar Husain - Frontend Engineer</title>
        <meta name="description" content="Frontend Engineer crafting memorable web experiences with React, TypeScript, and modern web technologies." />
        <meta property="og:title" content="Syed Abrar Husain - Frontend Engineer" />
        <meta property="og:description" content="I craft web experiences people remember." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <SplashCursor>
        <div className="min-h-screen bg-slate-950">
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 btn-primary z-50"
          >
            Skip to main content
          </a>
          
          <Navbar />
          
          <main id="main-content">
            <Hero />
            <About />
            <Projects />
            <Chatbot />
            <Contact />
          </main>
          
          <Footer />
          <ChatDock />
        </div>
      </SplashCursor>
    </>
  )
}

export default App
