import { notFound } from "next/navigation";
import { AppPage } from "@/components/app/app-page";
import { T } from "@/components/i18n";
import { ALL_STEPS } from "@/setup/steps/index";
import { isLocale } from "@/shared/i18n/settings";

/**
 * Setup overview (/[locale]/setup). Read only registry of the 25 wizard
 * steps with their docs, plus the command that runs them. The interactive
 * wizard itself runs from the CLI; this page makes the system visible.
 */
export default async function SetupPage({ params }: PageProps<"/[locale]/setup">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <AppPage titleKey="setup.title">
      <p className="text-muted-foreground">
        <T k="setup.description" />
      </p>
      <p className="mt-2 font-mono text-sm">
        <T k="setup.run.hint" />
      </p>
      <ol className="mt-6 flex flex-col gap-4">
        {ALL_STEPS.map((step, index) => (
          <li key={step.id}>
            <p className="font-medium">
              {index + 1}. {step.title}
            </p>
            <p className="text-sm text-muted-foreground">{step.docs}</p>
          </li>
        ))}
      </ol>
    </AppPage>
  );
}
