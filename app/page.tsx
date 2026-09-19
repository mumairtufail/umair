import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Fun from "@/components/Fun";
import ChatWidget from "@/components/ChatWidget";
import Buddy from "@/components/Buddy";
import RevealObserver from "@/components/RevealObserver";
import Footer from "@/components/Footer";
import DotBackground from "@/components/DotBackground";

export default function Home() {
  return (
    <>
      <DotBackground />
      <Nav />
      <div className="wrap" id="top">
        <Hero />
        <Experience />
        <Projects />
        <Fun />
        <Footer />
      </div>
      <ChatWidget />
      <Buddy />
      <RevealObserver />
    </>
  );
}
