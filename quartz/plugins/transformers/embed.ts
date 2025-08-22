import { QuartzTransformerPlugin } from '../types';
import { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { parse } from 'yaml';

export const Embed: QuartzTransformerPlugin = () => ({
	name: 'Embed',
	markdownPlugins() {
		return [
			() => (tree: Root, _file) => {
				visit(tree, 'code', node => {
					if (node.lang === 'embed') {
						let data: Record<string, string> = {};
						try {
							data = parse(node.value);
						} catch (e) {
							console.error('Error parsing embed block:', e);
							return;
						}

						if (!data.url) {
							return;
						}

						const title = data.title ?? data.url;
						const description = data.description ?? '';
						const image = 'https://images.weserv.nl/?url=' + data.image;
						const favicon = 'https://images.weserv.nl/?url=' + data.favicon;
						const url = data.url;

						const html = `
              <div class="embed-card">

                <div class="embed-left">
                  <img class="embed-image" src="${image}" alt="${title}" />
                </div>

                <div class="embed-right">

                  <div class="wrapper">

                    <div class="title" title="${title}">${title}</div>
                    <div class="description" title="${description}">${description}</div>
                    <div class="url">
                      <div>
                        <a href="${url}" target="_blank" rel="noopener noreferrer">
                          <img src="${favicon}" alt="" />
                          <span>${url}</span>
                        </a>
                      </div>
                    </div>

                  </div>

                </div>
              
              </div>
            `;

						node.type = 'html' as 'code';
						node.value = html;
					}
				});
			}
		];
	}
});
