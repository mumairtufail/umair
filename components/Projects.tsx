import { projects } from "@/data/content";
import { publicFileExists } from "@/lib/publicFile";
import ProjectCards from "@/components/ProjectCards";

// Server side: work out which screenshots exist, then hand off to the (client) flip cards.
export default function Projects() {
  return (
    <section className="block" id="projects">
      <div className="h-row" data-reveal>
        <h2>Projects</h2>
        <span className="hint">tap a card to flip it</span>
      </div>
      <ProjectCards items={projects.map((p) => ({ ...p, hasImage: !!p.image && publicFileExists(p.image) }))} />
    </section>
  );
}
