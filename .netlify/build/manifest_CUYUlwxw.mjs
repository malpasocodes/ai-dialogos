import '@astrojs/internal-helpers/path';
import '@astrojs/internal-helpers/remote';
import 'piccolore';
import { N as NOOP_MIDDLEWARE_HEADER, j as decodeKey } from './chunks/astro/server_BVlOemje.mjs';
import 'clsx';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/","cacheDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/node_modules/.astro/","outDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/dist/","srcDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/","publicDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/public/","buildClientDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/dist/","buildServerDir":"file:///Users/leibniz/Documents/DevProjects/monad/ai-dialogos/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"book/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/book","isIndex":false,"type":"page","pattern":"^\\/book\\/?$","segments":[[{"content":"book","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/book.astro","pathname":"/book","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"lessons/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/lessons","isIndex":true,"type":"page","pattern":"^\\/lessons\\/?$","segments":[[{"content":"lessons","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/lessons/index.astro","pathname":"/lessons","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"modules/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/modules","isIndex":true,"type":"page","pattern":"^\\/modules\\/?$","segments":[[{"content":"modules","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/modules/index.astro","pathname":"/modules","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"podcast/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/podcast","isIndex":false,"type":"page","pattern":"^\\/podcast\\/?$","segments":[[{"content":"podcast","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/podcast.astro","pathname":"/podcast","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"search/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/search","isIndex":false,"type":"page","pattern":"^\\/search\\/?$","segments":[[{"content":"search","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/search.astro","pathname":"/search","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"series/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/series","isIndex":false,"type":"page","pattern":"^\\/series\\/?$","segments":[[{"content":"series","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/series.astro","pathname":"/series","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"substack/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/substack","isIndex":false,"type":"page","pattern":"^\\/substack\\/?$","segments":[[{"content":"substack","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/substack.astro","pathname":"/substack","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"volumes/rethinking-business-strategy/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/volumes/rethinking-business-strategy","isIndex":false,"type":"page","pattern":"^\\/volumes\\/rethinking-business-strategy\\/?$","segments":[[{"content":"volumes","dynamic":false,"spread":false}],[{"content":"rethinking-business-strategy","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/volumes/rethinking-business-strategy.astro","pathname":"/volumes/rethinking-business-strategy","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"volumes/shaping-the-future-of-innovation/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/volumes/shaping-the-future-of-innovation","isIndex":false,"type":"page","pattern":"^\\/volumes\\/shaping-the-future-of-innovation\\/?$","segments":[[{"content":"volumes","dynamic":false,"spread":false}],[{"content":"shaping-the-future-of-innovation","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/volumes/shaping-the-future-of-innovation.astro","pathname":"/volumes/shaping-the-future-of-innovation","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://example.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/lessons/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/lessons/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/lessons/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/lessons/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/modules/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/modules/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/modules/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/modules/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/podcast/[slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/podcast/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/search.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/search@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/book.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/podcast.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/series.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/substack.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/volumes/rethinking-business-strategy.astro",{"propagation":"none","containsHead":true}],["/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/src/pages/volumes/shaping-the-future-of-innovation.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/book@_@astro":"pages/book.astro.mjs","\u0000@astro-page:src/pages/lessons/[slug]@_@astro":"pages/lessons/_slug_.astro.mjs","\u0000@astro-page:src/pages/lessons/index@_@astro":"pages/lessons.astro.mjs","\u0000@astro-page:src/pages/modules/[slug]@_@astro":"pages/modules/_slug_.astro.mjs","\u0000@astro-page:src/pages/modules/index@_@astro":"pages/modules.astro.mjs","\u0000@astro-page:src/pages/podcast/[slug]@_@astro":"pages/podcast/_slug_.astro.mjs","\u0000@astro-page:src/pages/podcast@_@astro":"pages/podcast.astro.mjs","\u0000@astro-page:src/pages/search@_@astro":"pages/search.astro.mjs","\u0000@astro-page:src/pages/series@_@astro":"pages/series.astro.mjs","\u0000@astro-page:src/pages/substack@_@astro":"pages/substack.astro.mjs","\u0000@astro-page:src/pages/volumes/rethinking-business-strategy@_@astro":"pages/volumes/rethinking-business-strategy.astro.mjs","\u0000@astro-page:src/pages/volumes/shaping-the-future-of-innovation@_@astro":"pages/volumes/shaping-the-future-of-innovation.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CUYUlwxw.mjs","/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/node_modules/unstorage/drivers/netlify-blobs.mjs":"chunks/netlify-blobs_DM36vZAS.mjs","/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/.astro/content-assets.mjs":"chunks/content-assets_DleWbedO.mjs","\u0000astro:assets":"chunks/_astro_assets_9O_hgyb2.mjs","/Users/leibniz/Documents/DevProjects/monad/ai-dialogos/.astro/content-modules.mjs":"chunks/content-modules_Dz-S_Wwv.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_coOfPAlu.mjs","@astrojs/react/client.js":"_astro/client.CUcGXuCy.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/rethinking-business-strategy.CwdAkn3W.jpeg","/_astro/shaping-future-innovation.F6hGcotG.jpeg","/_astro/ai-bookcover.v0AFtBvm.jpeg","/_astro/about.COFEdgCK.css","/_astro/client.CUcGXuCy.js","/about/index.html","/book/index.html","/lessons/index.html","/modules/index.html","/podcast/index.html","/search/index.html","/series/index.html","/substack/index.html","/volumes/rethinking-business-strategy/index.html","/volumes/shaping-the-future-of-innovation/index.html","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"Go2DQn2GFebCHsyQvp9cqzLprk8le6dKg/FIn7IJArY=","sessionConfig":{"driver":"netlify-blobs","options":{"name":"astro-sessions","consistency":"strong"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/netlify-blobs_DM36vZAS.mjs');

export { manifest };
