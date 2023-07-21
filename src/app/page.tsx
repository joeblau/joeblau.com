import { curriculumVitae } from "@/lib/models/curriculum-vitae";

export default function Home() {
  return (
    <main>
      <div className={"mx-auto max-w-xl px-4 sm:px-6 lg:px-8 text-neutral"}>
        <div>
          <h1>Joe Blau</h1>
          <h2>Founder • Investor</h2>
        </div>

        <div>
          {curriculumVitae.map((section) => (
            <div key={section.id}>
              <div>{section.title}</div>
              {section.items.map((item) => (
                <div key={item.id}>
                  <div>{item.title}</div>
                  <div>{item.description}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
