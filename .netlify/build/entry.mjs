import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CvSoi7hX.mjs';
import { manifest } from './manifest_CUYUlwxw.mjs';
import { createExports } from '@astrojs/netlify/ssr-function.js';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/about.astro.mjs');
const _page1 = () => import('./pages/book.astro.mjs');
const _page2 = () => import('./pages/lessons/_slug_.astro.mjs');
const _page3 = () => import('./pages/lessons.astro.mjs');
const _page4 = () => import('./pages/modules/_slug_.astro.mjs');
const _page5 = () => import('./pages/modules.astro.mjs');
const _page6 = () => import('./pages/podcast/_slug_.astro.mjs');
const _page7 = () => import('./pages/podcast.astro.mjs');
const _page8 = () => import('./pages/search.astro.mjs');
const _page9 = () => import('./pages/series.astro.mjs');
const _page10 = () => import('./pages/substack.astro.mjs');
const _page11 = () => import('./pages/volumes/rethinking-business-strategy.astro.mjs');
const _page12 = () => import('./pages/volumes/shaping-the-future-of-innovation.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["src/pages/about.astro", _page0],
    ["src/pages/book.astro", _page1],
    ["src/pages/lessons/[slug].astro", _page2],
    ["src/pages/lessons/index.astro", _page3],
    ["src/pages/modules/[slug].astro", _page4],
    ["src/pages/modules/index.astro", _page5],
    ["src/pages/podcast/[slug].astro", _page6],
    ["src/pages/podcast.astro", _page7],
    ["src/pages/search.astro", _page8],
    ["src/pages/series.astro", _page9],
    ["src/pages/substack.astro", _page10],
    ["src/pages/volumes/rethinking-business-strategy.astro", _page11],
    ["src/pages/volumes/shaping-the-future-of-innovation.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "73b3970a-1fb3-4f52-bfcb-fb95cccce98c"
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
