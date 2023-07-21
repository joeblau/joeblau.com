import { curriculumVitae } from "@/lib/models/curriculum-vitae";

export default function Home() {
  return (
    <main>
      <div className={"mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-neutral"}>
        <code className="lowercase">
          <div>
            <h1>Joe Blau</h1>
            <h2>Founder • Investor</h2>
            <div>&nbsp;</div>
          </div>
          <div>
            {curriculumVitae.map((section, index) => (
              <div key={index}>
                <div>~$ ./blau {section.title.replaceAll(" ", "-")}</div>
                <div>&nbsp;</div>
                <ul className="pl-8">
                  {section.items.map((item, index) => (
                    <li key={index}>
                      <div className="font-medium inline">
                        {item.link ? <a href={item.link}>{item.title}</a> : <span>{item.title}</span>}
                      </div>
                      {item.badge && (
                        <span
                          title={item.badge.title}
                          className="font-extralight inline"
                        >{` [${item.badge.symbol}]`}</span>
                      )}
                      <span className="font-light inline">{` - ${item.description}`}</span>
                    </li>
                  ))}
                </ul>
                <div>&nbsp;</div>
              </div>
            ))}
            <div>
              ~$
              <span className="inline blink"> █</span>
            </div>
          </div>
        </code>
      </div>
    </main>
  );
}
