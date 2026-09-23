import { Text } from "@/components";
import { ColorsExplorer } from "@/components/ColorsExplorer";
import { getDarkTokens, getTokens } from "@/docs/css";

export default function ColorsPage() {
  return (
    <>
      <header className="docs__header">
        <Text size="display">Colors</Text>
        <Text size="lg" tone="muted" relaxed>
          Grouped by role. Six base colors set the whole palette: a light and a dark page background plus four accents. Neutrals take their
          hue from the background; accents get hover, soft and contrast colors derived automatically. Change a base color and watch everything follow.
        </Text>
      </header>
      <ColorsExplorer tokens={getTokens()} dark={getDarkTokens()} />
    </>
  );
}
