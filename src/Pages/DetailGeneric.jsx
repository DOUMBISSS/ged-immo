import SectionImmobilier from "./Sections/SectionImmobilier";
import SectionMagasin from "./Sections/SectionMagasin";
import SectionBureau from "./Sections/SectionBureau";
import SectionEntrepot from "./Sections/SectionEntrepot";
import SectionTerrain from "./Sections/SectionTerrain";

export default function DetailGeneric({ project }) {
  if (!project) return <p>Chargement du projet...</p>;

  return (
    <div>
      {project.type === "immobilier" && <SectionImmobilier project={project} />}
      {project.type === "magasin" && <SectionMagasin project={project} />}
      {project.type === "bureau" && <SectionBureau project={project} />}
      {project.type === "entrepot" && <SectionEntrepot project={project} />}
      {project.type === "terrain" && <SectionTerrain project={project} />}
    </div>
  );
}