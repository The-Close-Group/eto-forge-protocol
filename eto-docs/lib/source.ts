import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, type LoaderPlugin, loader } from 'fumadocs-core/source';
import type { ReactNode } from 'react';
import { resolveDocsIcon } from './docs-icons';

// See https://fumadocs.dev/docs/headless/source-api for more info
function createIconPlugin(resolveIcon: (icon?: string) => ReactNode): LoaderPlugin {
  const replaceIcon = (node: { icon?: unknown }) => {
    if (node.icon === undefined || typeof node.icon === 'string') {
      node.icon = resolveIcon(node.icon as string | undefined);
    }

    return node;
  };

  return {
    name: 'custom:docs-icons',
    transformPageTree: {
      file: replaceIcon,
      folder: replaceIcon,
      separator: replaceIcon,
    },
  };
}

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  plugins: [createIconPlugin(resolveDocsIcon)],
});

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  };
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed');

  return `# ${page.data.title}

${processed}`;
}
