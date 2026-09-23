import { Text } from "@/components";
import { TokenExplorer } from "@/components/TokenExplorer";
import { getDarkTokens, getTokens } from "@/docs/css";

export default function TokensPage() {
  return (
    <>
      <header className="docs__header">
        <Text size="display">Design tokens</Text>
        <Text size="lg" tone="muted" relaxed>
          Every variable in tokens.css. Base tokens hold literal values; derived tokens reference others, shown as &ldquo;derives from&rdquo; and &ldquo;used by&rdquo;.
          Edit any value and the whole page updates live. Changes are kept while you browse and cleared on reload.
        </Text>
      </header>
      <TokenExplorer tokens={getTokens()} dark={getDarkTokens()} />
    </>
  );
}
