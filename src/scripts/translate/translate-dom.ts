const SKIP_SELECTOR = 'pre, code, script, style, kbd, samp';

export function translatorSupported(): boolean {
  return typeof window !== 'undefined' && 'Translator' in window;
}

export async function getAvailability(): Promise<string> {
  const T = (window as any).Translator;
  return T.availability({ sourceLanguage: 'id', targetLanguage: 'en' });
}

// Harus dipanggil langsung dari event klik (user activation)
export function createTranslator(onProgress?: (ratio: number) => void): Promise<any> {
  const T = (window as any).Translator;
  return T.create({
    sourceLanguage: 'id',
    targetLanguage: 'en',
    monitor(m: EventTarget) {
      m.addEventListener('downloadprogress', (e: any) => onProgress?.(e.loaded ?? 0));
    },
  });
}

function collectTextNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

export async function translateContainer(root: HTMLElement, translator: any): Promise<Map<Text, string>> {
  const originals = new Map<Text, string>();
  const nodes = collectTextNodes(root);

  for (const node of nodes) {
    const original = node.nodeValue ?? '';
    originals.set(node, original);

    const leading = original.match(/^\s*/)?.[0] ?? '';
    const trailing = original.match(/\s*$/)?.[0] ?? '';
    const translated: string = await translator.translate(original.trim());
    node.nodeValue = leading + translated + trailing;
  }

  return originals;
}

export function restoreContainer(originals: Map<Text, string>): void {
  originals.forEach((text, node) => {
    node.nodeValue = text;
  });
}
