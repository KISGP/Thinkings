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
						let data: Record<string, string | number> = {};
						try {
							data = parse(node.value);
						} catch (e) {
							console.error('Error parsing embed block:', e);
							return;
						}

						if (!data.url) return;

						if (data.aspectRatio) {
							data.aspectRatio = Number(data.aspectRatio) / 100;
						} else {
							data.aspectRatio = 0.5;
						}

						const html = `
              <div class="embed-card">

                <div class="embed-left" style="width: ${120 / data.aspectRatio}px;height: 120px">
                  <img class="embed-image" src="https://images.weserv.nl/?url=${data.image}" alt="${data.title}" />
                </div>

                <div class="embed-right">

                  <div class="wrapper">

                    <div class="title" title="${data.title}">${data.title}</div>
                    <div class="description" title="${data.description}">${data.description}</div>
                    <div class="url">
                      <div>
                        <a href="${data.url}" target="_blank" rel="noopener noreferrer">
                          <img src="https://images.weserv.nl/?url=${data.favicon}" alt="favicon" />
                          <span>${data.url}</span>
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
