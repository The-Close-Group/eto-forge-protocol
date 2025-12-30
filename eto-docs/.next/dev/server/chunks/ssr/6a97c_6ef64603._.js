module.exports = [
"[project]/eto-docs/node_modules/fumadocs-mdx/dist/chunk-5OBUOALK.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/runtime/server.ts
__turbopack_context__.s([
    "server",
    ()=>server,
    "toFumadocsSource",
    ()=>toFumadocsSource
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
function server(options = {}) {
    const { doc: { passthroughs: docPassthroughs = [] } = {} } = options;
    function fileInfo(file, base) {
        if (file.startsWith("./")) {
            file = file.slice(2);
        }
        return {
            path: file,
            fullPath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](base, file)
        };
    }
    function mapDocData(entry) {
        const data = {
            body: entry.default,
            toc: entry.toc,
            structuredData: entry.structuredData,
            _exports: entry
        };
        for (const key of docPassthroughs){
            data[key] = entry[key];
        }
        return data;
    }
    return {
        async doc (_name, base, glob) {
            const out = await Promise.all(Object.entries(glob).map(async ([k, v])=>{
                const data = typeof v === "function" ? await v() : v;
                return {
                    ...mapDocData(data),
                    ...data.frontmatter,
                    ...createDocMethods(fileInfo(k, base), ()=>data)
                };
            }));
            return out;
        },
        async docLazy (_name, base, head, body) {
            const out = await Promise.all(Object.entries(head).map(async ([k, v])=>{
                const data = typeof v === "function" ? await v() : v;
                const content = body[k];
                return {
                    ...data,
                    ...createDocMethods(fileInfo(k, base), content),
                    async load () {
                        return mapDocData(await content());
                    }
                };
            }));
            return out;
        },
        async meta (_name, base, glob) {
            const out = await Promise.all(Object.entries(glob).map(async ([k, v])=>{
                const data = typeof v === "function" ? await v() : v;
                return {
                    info: fileInfo(k, base),
                    ...data
                };
            }));
            return out;
        },
        async docs (name, base, metaGlob, docGlob) {
            const entry = {
                docs: await this.doc(name, base, docGlob),
                meta: await this.meta(name, base, metaGlob),
                toFumadocsSource () {
                    return toFumadocsSource(this.docs, this.meta);
                }
            };
            return entry;
        },
        async docsLazy (name, base, metaGlob, docHeadGlob, docBodyGlob) {
            const entry = {
                docs: await this.docLazy(name, base, docHeadGlob, docBodyGlob),
                meta: await this.meta(name, base, metaGlob),
                toFumadocsSource () {
                    return toFumadocsSource(this.docs, this.meta);
                }
            };
            return entry;
        }
    };
}
function toFumadocsSource(pages, metas) {
    const files = [];
    for (const entry of pages){
        files.push({
            type: "page",
            path: entry.info.path,
            absolutePath: entry.info.fullPath,
            data: entry
        });
    }
    for (const entry of metas){
        files.push({
            type: "meta",
            path: entry.info.path,
            absolutePath: entry.info.fullPath,
            data: entry
        });
    }
    return {
        files
    };
}
function createDocMethods(info, load) {
    return {
        info,
        async getText (type) {
            if (type === "raw") {
                const fs = await __turbopack_context__.A("[externals]/fs/promises [external] (fs/promises, cjs, async loader)");
                return (await fs.readFile(info.fullPath)).toString();
            }
            const data = await load();
            if (typeof data._markdown !== "string") throw new Error("getText('processed') requires `includeProcessedMarkdown` to be enabled in your collection config.");
            return data._markdown;
        },
        async getMDAST () {
            const data = await load();
            if (!data._mdast) throw new Error("getMDAST() requires `includeMDAST` to be enabled in your collection config.");
            return JSON.parse(data._mdast);
        }
    };
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-mdx/dist/runtime/server.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$mdx$2f$dist$2f$chunk$2d$5OBUOALK$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-mdx/dist/chunk-5OBUOALK.js [app-rsc] (ecmascript)");
;
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-FAEPKD7U.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/source/plugins/icon.ts
__turbopack_context__.s([
    "iconPlugin",
    ()=>iconPlugin
]);
function iconPlugin(resolveIcon) {
    function replaceIcon(node) {
        if (node.icon === void 0 || typeof node.icon === "string") node.icon = resolveIcon(node.icon);
        return node;
    }
    return {
        name: "fumadocs:icon",
        transformPageTree: {
            file: replaceIcon,
            folder: replaceIcon,
            separator: replaceIcon
        }
    };
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-U67V476Y.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "__commonJS",
    ()=>__commonJS,
    "__export",
    ()=>__export,
    "__toESM",
    ()=>__toESM
]);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod)=>function __require() {
        return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = {
            exports: {}
        }).exports, mod), mod.exports;
    };
var __export = (target, all)=>{
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = (to, from, except, desc)=>{
    if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
            get: ()=>from[key],
            enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
    }
    return to;
};
var __toESM = (mod, isNodeMode, target)=>(target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(// If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod));
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-XZSI7AHE.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "basename",
    ()=>basename,
    "dirname",
    ()=>dirname,
    "extname",
    ()=>extname,
    "joinPath",
    ()=>joinPath,
    "path_exports",
    ()=>path_exports,
    "slash",
    ()=>slash,
    "splitPath",
    ()=>splitPath
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$U67V476Y$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-U67V476Y.js [app-rsc] (ecmascript)");
;
// src/source/path.ts
var path_exports = {};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$U67V476Y$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["__export"])(path_exports, {
    basename: ()=>basename,
    dirname: ()=>dirname,
    extname: ()=>extname,
    joinPath: ()=>joinPath,
    slash: ()=>slash,
    splitPath: ()=>splitPath
});
function basename(path, ext) {
    const idx = path.lastIndexOf("/");
    return path.substring(idx === -1 ? 0 : idx + 1, ext ? path.length - ext.length : path.length);
}
function extname(path) {
    const dotIdx = path.lastIndexOf(".");
    if (dotIdx !== -1) {
        return path.substring(dotIdx);
    }
    return "";
}
function dirname(path) {
    return path.split("/").slice(0, -1).join("/");
}
function splitPath(path) {
    return path.split("/").filter((p)=>p.length > 0);
}
function joinPath(...paths) {
    const out = [];
    const parsed = paths.flatMap(splitPath);
    for (const seg of parsed){
        switch(seg){
            case "..":
                out.pop();
                break;
            case ".":
                break;
            default:
                out.push(seg);
        }
    }
    return out.join("/");
}
function slash(path) {
    const isExtendedLengthPath = path.startsWith("\\\\?\\");
    if (isExtendedLengthPath) {
        return path;
    }
    return path.replaceAll("\\", "/");
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-PFNP6PEB.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/utils/normalize-url.tsx
__turbopack_context__.s([
    "normalizeUrl",
    ()=>normalizeUrl
]);
function normalizeUrl(url) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (!url.startsWith("/")) url = "/" + url;
    if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
    return url;
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-XKUN7AUK.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/page-tree/utils.ts
__turbopack_context__.s([
    "findNeighbour",
    ()=>findNeighbour,
    "findPath",
    ()=>findPath,
    "flattenTree",
    ()=>flattenTree,
    "getPageTreePeers",
    ()=>getPageTreePeers,
    "getPageTreeRoots",
    ()=>getPageTreeRoots,
    "visit",
    ()=>visit
]);
function flattenTree(nodes) {
    const out = [];
    for (const node of nodes){
        if (node.type === "folder") {
            if (node.index) out.push(node.index);
            out.push(...flattenTree(node.children));
        } else if (node.type === "page") {
            out.push(node);
        }
    }
    return out;
}
function findNeighbour(tree, url, options) {
    const { separateRoot = true } = options ?? {};
    const roots = separateRoot ? getPageTreeRoots(tree) : [
        tree
    ];
    if (tree.fallback) roots.push(tree.fallback);
    for (const root of roots){
        const list = flattenTree(root.children);
        const idx = list.findIndex((item)=>item.url === url);
        if (idx === -1) continue;
        return {
            previous: list[idx - 1],
            next: list[idx + 1]
        };
    }
    return {};
}
function getPageTreeRoots(pageTree) {
    const result = pageTree.children.flatMap((child)=>{
        if (child.type !== "folder") return [];
        const roots = getPageTreeRoots(child);
        if (child.root) roots.push(child);
        return roots;
    });
    if (!("type" in pageTree)) result.push(pageTree);
    return result;
}
function getPageTreePeers(treeOrTrees, url) {
    if ("children" in treeOrTrees) {
        const tree = treeOrTrees;
        const parent = findParentFromTree(tree, url);
        if (!parent) return [];
        return parent.children.filter((item)=>item.type === "page" && item.url !== url);
    }
    for(const lang in treeOrTrees){
        const result = getPageTreePeers(treeOrTrees[lang], url);
        if (result) return result;
    }
    return [];
}
function findParentFromTree(from, url) {
    let result;
    visit(from, (node, parent)=>{
        if ("type" in node && node.type === "page" && node.url === url) {
            result = parent;
            return "break";
        }
    });
    return result;
}
function findPath(nodes, matcher, options = {}) {
    const { includeSeparator = true } = options;
    function run(nodes2) {
        let separator;
        for (const node of nodes2){
            if (matcher(node)) {
                const items = [];
                if (separator) items.push(separator);
                items.push(node);
                return items;
            }
            if (node.type === "separator" && includeSeparator) {
                separator = node;
                continue;
            }
            if (node.type === "folder") {
                const items = node.index && matcher(node.index) ? [
                    node.index
                ] : run(node.children);
                if (items) {
                    items.unshift(node);
                    if (separator) items.unshift(separator);
                    return items;
                }
            }
        }
    }
    return run(nodes) ?? null;
}
var VisitBreak = Symbol("VisitBreak");
function visit(root, visitor) {
    function onNode(node, parent) {
        const result = visitor(node, parent);
        switch(result){
            case "skip":
                return node;
            case "break":
                throw VisitBreak;
            default:
                if (result) node = result;
        }
        if ("index" in node && node.index) {
            node.index = onNode(node.index, node);
        }
        if ("fallback" in node && node.fallback) {
            node.fallback = onNode(node.fallback, node);
        }
        if ("children" in node) {
            for(let i = 0; i < node.children.length; i++){
                node.children[i] = onNode(node.children[i], node);
            }
        }
        return node;
    }
    try {
        return onNode(root);
    } catch (e) {
        if (e === VisitBreak) return root;
        throw e;
    }
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/source/index.js [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FileSystem",
    ()=>FileSystem,
    "createGetUrl",
    ()=>createGetUrl,
    "getSlugs",
    ()=>getSlugs,
    "loader",
    ()=>loader,
    "map",
    ()=>map,
    "multiple",
    ()=>multiple
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$FAEPKD7U$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-FAEPKD7U.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-XZSI7AHE.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$PFNP6PEB$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-PFNP6PEB.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XKUN7AUK$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-XKUN7AUK.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$U67V476Y$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/chunk-U67V476Y.js [app-rsc] (ecmascript)");
;
;
;
;
;
// src/source/source.ts
function multiple(sources) {
    const out = {
        files: []
    };
    for (const [type, source] of Object.entries(sources)){
        for (const file of source.files){
            out.files.push({
                ...file,
                data: {
                    ...file.data,
                    type
                }
            });
        }
    }
    return out;
}
function map(source) {
    return {
        page (fn) {
            return {
                files: source.files.map((file)=>file.type === "page" ? fn(file) : file)
            };
        },
        meta (fn) {
            return {
                files: source.files.map((file)=>file.type === "meta" ? fn(file) : file)
            };
        }
    };
}
// src/source/storage/file-system.ts
var FileSystem = class {
    constructor(inherit){
        this.files = /* @__PURE__ */ new Map();
        this.folders = /* @__PURE__ */ new Map();
        if (inherit) {
            for (const [k, v1] of inherit.folders){
                this.folders.set(k, v1);
            }
            for (const [k, v1] of inherit.files){
                this.files.set(k, v1);
            }
        } else {
            this.folders.set("", []);
        }
    }
    read(path) {
        return this.files.get(path);
    }
    /**
   * get the direct children of folder (in virtual file path)
   */ readDir(path) {
        return this.folders.get(path);
    }
    write(path, file) {
        if (!this.files.has(path)) {
            const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dirname"])(path);
            this.makeDir(dir);
            this.readDir(dir)?.push(path);
        }
        this.files.set(path, file);
    }
    /**
   * Delete files at specified path.
   *
   * @param path - the target path.
   * @param [recursive=false] - if set to `true`, it will also delete directories.
   */ delete(path, recursive = false) {
        if (this.files.delete(path)) return true;
        if (recursive) {
            const folder = this.folders.get(path);
            if (!folder) return false;
            this.folders.delete(path);
            for (const child of folder){
                this.delete(child);
            }
            return true;
        }
        return false;
    }
    getFiles() {
        return Array.from(this.files.keys());
    }
    makeDir(path) {
        const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["splitPath"])(path);
        for(let i = 0; i < segments.length; i++){
            const segment = segments.slice(0, i + 1).join("/");
            if (this.folders.has(segment)) continue;
            this.folders.set(segment, []);
            this.folders.get((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dirname"])(segment)).push(segment);
        }
    }
};
// src/source/storage/content.ts
function isLocaleValid(locale) {
    return locale.length > 0 && !/\d+/.test(locale);
}
var parsers = {
    dir (path) {
        const [locale, ...segs] = path.split("/");
        if (locale && segs.length > 0 && isLocaleValid(locale)) return [
            segs.join("/"),
            locale
        ];
        return [
            path
        ];
    },
    dot (path) {
        const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dirname"])(path);
        const base = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(path);
        const parts = base.split(".");
        if (parts.length < 3) return [
            path
        ];
        const [locale] = parts.splice(parts.length - 2, 1);
        if (!isLocaleValid(locale)) return [
            path
        ];
        return [
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinPath"])(dir, parts.join(".")),
            locale
        ];
    },
    none (path) {
        return [
            path
        ];
    }
};
function buildContentStorage(loaderConfig, defaultLanguage) {
    const { source, plugins = [], i18n = {
        defaultLanguage,
        parser: "none",
        languages: [
            defaultLanguage
        ]
    } } = loaderConfig;
    const parser = parsers[i18n.parser ?? "dot"];
    const storages = {};
    const normalized = /* @__PURE__ */ new Map();
    for (const inputFile of source.files){
        let file;
        if (inputFile.type === "page") {
            file = {
                format: "page",
                path: normalizePath(inputFile.path),
                // will be generated by the slugs plugin if unspecified
                slugs: inputFile.slugs,
                data: inputFile.data,
                absolutePath: inputFile.absolutePath
            };
        } else {
            file = {
                format: "meta",
                path: normalizePath(inputFile.path),
                absolutePath: inputFile.absolutePath,
                data: inputFile.data
            };
        }
        const [pathWithoutLocale, locale = i18n.defaultLanguage] = parser(file.path);
        const list = normalized.get(locale) ?? [];
        list.push({
            pathWithoutLocale,
            file
        });
        normalized.set(locale, list);
    }
    const fallbackLang = i18n.fallbackLanguage !== null ? i18n.fallbackLanguage ?? i18n.defaultLanguage : null;
    function scan(lang) {
        if (storages[lang]) return;
        let storage;
        if (fallbackLang && fallbackLang !== lang) {
            scan(fallbackLang);
            storage = new FileSystem(storages[fallbackLang]);
        } else {
            storage = new FileSystem();
        }
        for (const { pathWithoutLocale, file } of normalized.get(lang) ?? []){
            storage.write(pathWithoutLocale, file);
        }
        const context = {
            storage
        };
        for (const plugin of plugins){
            plugin.transformStorage?.(context);
        }
        storages[lang] = storage;
    }
    for (const lang of i18n.languages)scan(lang);
    return storages;
}
function normalizePath(path) {
    const segments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["splitPath"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["slash"])(path));
    if (segments[0] === "." || segments[0] === "..") throw new Error("It must not start with './' or '../'");
    return segments.join("/");
}
// src/source/page-tree/transformer-fallback.ts
function transformerFallback() {
    const addedFiles = /* @__PURE__ */ new Set();
    return {
        root (root) {
            const isolatedStorage = new FileSystem();
            for (const file of this.storage.getFiles()){
                if (addedFiles.has(file)) continue;
                const content = this.storage.read(file);
                if (content) isolatedStorage.write(file, content);
            }
            if (isolatedStorage.getFiles().length === 0) return root;
            root.fallback = this.builder.build(isolatedStorage, {
                ...this.options,
                id: `fallback-${root.$id ?? ""}`,
                generateFallback: false
            });
            addedFiles.clear();
            return root;
        },
        file (node, file) {
            if (file) addedFiles.add(file);
            return node;
        },
        folder (node, _dir, metaPath) {
            if (metaPath) addedFiles.add(metaPath);
            return node;
        }
    };
}
// src/source/page-tree/builder.ts
var group = /^\((?<name>.+)\)$/;
var link = /^(?<external>external:)?(?:\[(?<icon>[^\]]+)])?\[(?<name>[^\]]+)]\((?<url>[^)]+)\)$/;
var separator = /^---(?:\[(?<icon>[^\]]+)])?(?<name>.+)---|^---$/;
var rest = "...";
var restReversed = "z...a";
var extractPrefix = "...";
var excludePrefix = "!";
function createPageTreeBuilder(loaderConfig) {
    const { plugins = [], url, pageTree: defaultOptions = {} } = loaderConfig;
    return {
        build (storage, options = defaultOptions) {
            const key = "";
            return this.buildI18n({
                [key]: storage
            }, options)[key];
        },
        buildI18n (storages, options = defaultOptions) {
            let nextId = 0;
            const out = {};
            const transformers = [];
            if (options.transformers) {
                transformers.push(...options.transformers);
            }
            for (const plugin of plugins){
                if (plugin.transformPageTree) transformers.push(plugin.transformPageTree);
            }
            if (options.generateFallback ?? true) {
                transformers.push(transformerFallback());
            }
            for (const [locale, storage] of Object.entries(storages)){
                let rootId = locale.length === 0 ? "root" : locale;
                if (options.id) rootId = `${options.id}-${rootId}`;
                out[locale] = createPageTreeBuilderUtils({
                    rootId,
                    transformers,
                    builder: this,
                    options,
                    getUrl: url,
                    locale,
                    storage,
                    storages,
                    generateNodeId () {
                        return "_" + nextId++;
                    }
                }).root();
            }
            return out;
        }
    };
}
function createFlattenPathResolver(storage) {
    const map2 = /* @__PURE__ */ new Map();
    const files = storage.getFiles();
    for (const file of files){
        const content = storage.read(file);
        const flattenPath = file.substring(0, file.length - (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extname"])(file).length);
        map2.set(flattenPath + "." + content.format, file);
    }
    return (name, format)=>{
        return map2.get(name + "." + format) ?? name;
    };
}
function createPageTreeBuilderUtils(ctx) {
    const resolveFlattenPath = createFlattenPathResolver(ctx.storage);
    const visitedPaths = /* @__PURE__ */ new Set();
    function nextNodeId(localId = ctx.generateNodeId()) {
        return `${ctx.rootId}:${localId}`;
    }
    return {
        buildPaths (paths, reversed = false) {
            const items = [];
            const folders = [];
            const sortedPaths = paths.sort((a, b)=>a.localeCompare(b) * (reversed ? -1 : 1));
            for (const path of sortedPaths){
                const fileNode = this.file(path);
                if (fileNode) {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(path, (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extname"])(path)) === "index") items.unshift(fileNode);
                    else items.push(fileNode);
                    continue;
                }
                const dirNode = this.folder(path, false);
                if (dirNode) folders.push(dirNode);
            }
            items.push(...folders);
            return items;
        },
        resolveFolderItem (folderPath, item) {
            if (item === rest || item === restReversed) return item;
            let match = separator.exec(item);
            if (match?.groups) {
                let node = {
                    $id: nextNodeId(),
                    type: "separator",
                    icon: match.groups.icon,
                    name: match.groups.name
                };
                for (const transformer of ctx.transformers){
                    if (!transformer.separator) continue;
                    node = transformer.separator.call(ctx, node);
                }
                return [
                    node
                ];
            }
            match = link.exec(item);
            if (match?.groups) {
                const { icon, url, name, external } = match.groups;
                let node = {
                    $id: nextNodeId(),
                    type: "page",
                    icon,
                    name,
                    url,
                    external: external ? true : void 0
                };
                for (const transformer of ctx.transformers){
                    if (!transformer.file) continue;
                    node = transformer.file.call(ctx, node);
                }
                return [
                    node
                ];
            }
            const isExcept = item.startsWith(excludePrefix);
            const isExtract = !isExcept && item.startsWith(extractPrefix);
            let filename = item;
            if (isExcept) {
                filename = item.slice(excludePrefix.length);
            } else if (isExtract) {
                filename = item.slice(extractPrefix.length);
            }
            const path = resolveFlattenPath((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinPath"])(folderPath, filename), "page");
            if (isExcept) {
                visitedPaths.add(path);
                return [];
            }
            const dirNode = this.folder(path, false);
            if (dirNode) {
                return isExtract ? dirNode.children : [
                    dirNode
                ];
            }
            const fileNode = this.file(path);
            return fileNode ? [
                fileNode
            ] : [];
        },
        folder (folderPath, isGlobalRoot) {
            const { storage, options, transformers } = ctx;
            const files = storage.readDir(folderPath);
            if (!files) return;
            const metaPath = resolveFlattenPath((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinPath"])(folderPath, "meta"), "meta");
            const indexPath = resolveFlattenPath((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinPath"])(folderPath, "index"), "page");
            let meta = storage.read(metaPath);
            if (meta && meta.format !== "meta") meta = void 0;
            const metadata = meta?.data ?? {};
            const { root = isGlobalRoot, pages } = metadata;
            let index;
            let children;
            if (pages) {
                const resolved = pages.flatMap((item)=>this.resolveFolderItem(folderPath, item));
                if (!root && !visitedPaths.has(indexPath)) {
                    index = this.file(indexPath);
                }
                for(let i = 0; i < resolved.length; i++){
                    const item = resolved[i];
                    if (item !== rest && item !== restReversed) continue;
                    const items = this.buildPaths(files.filter((file)=>!visitedPaths.has(file)), item === restReversed);
                    resolved.splice(i, 1, ...items);
                    break;
                }
                children = resolved;
            } else {
                if (!root && !visitedPaths.has(indexPath)) {
                    index = this.file(indexPath);
                }
                children = this.buildPaths(files.filter((file)=>!visitedPaths.has(file)));
            }
            let node = {
                type: "folder",
                name: metadata.title ?? index?.name ?? (()=>{
                    const folderName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(folderPath);
                    return pathToName(group.exec(folderName)?.[1] ?? folderName);
                })(),
                icon: metadata.icon,
                root: metadata.root,
                defaultOpen: metadata.defaultOpen,
                description: metadata.description,
                collapsible: metadata.collapsible,
                index,
                children,
                $id: nextNodeId(folderPath),
                $ref: !options.noRef && meta ? {
                    metaFile: metaPath
                } : void 0
            };
            visitedPaths.add(folderPath);
            for (const transformer of transformers){
                if (!transformer.folder) continue;
                node = transformer.folder.call(ctx, node, folderPath, metaPath);
            }
            return node;
        },
        file (path) {
            const { options, getUrl, storage, locale, transformers } = ctx;
            const page = storage.read(path);
            if (page?.format !== "page") return;
            const { title, description, icon } = page.data;
            let item = {
                $id: nextNodeId(path),
                type: "page",
                name: title ?? pathToName((0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(path, (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extname"])(path))),
                description,
                icon,
                url: getUrl(page.slugs, locale),
                $ref: !options.noRef ? {
                    file: path
                } : void 0
            };
            visitedPaths.add(path);
            for (const transformer of transformers){
                if (!transformer.file) continue;
                item = transformer.file.call(ctx, item, path);
            }
            return item;
        },
        root () {
            const folder = this.folder("", true);
            let root = {
                $id: ctx.rootId,
                name: folder.name || "Docs",
                children: folder.children
            };
            for (const transformer of ctx.transformers){
                if (!transformer.root) continue;
                root = transformer.root.call(ctx, root);
            }
            return root;
        }
    };
}
function pathToName(name) {
    const result = [];
    for (const c of name){
        if (result.length === 0) result.push(c.toLocaleUpperCase());
        else if (c === "-") result.push(" ");
        else result.push(c);
    }
    return result.join("");
}
// src/source/plugins/index.ts
var priorityMap = {
    pre: 1,
    default: 0,
    post: -1
};
function buildPlugins(plugins, sort = true) {
    const flatten = [];
    for (const plugin of plugins){
        if (Array.isArray(plugin)) flatten.push(...buildPlugins(plugin, false));
        else if (plugin) flatten.push(plugin);
    }
    if (sort) return flatten.sort((a, b)=>priorityMap[b.enforce ?? "default"] - priorityMap[a.enforce ?? "default"]);
    return flatten;
}
// src/source/plugins/slugs.ts
function slugsPlugin(slugsFn) {
    function isIndex(file) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(file, (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extname"])(file)) === "index";
    }
    return {
        name: "fumadocs:slugs",
        transformStorage ({ storage }) {
            const indexFiles = /* @__PURE__ */ new Set();
            const taken = /* @__PURE__ */ new Set();
            const autoIndex = slugsFn === void 0;
            for (const path of storage.getFiles()){
                const file = storage.read(path);
                if (!file || file.format !== "page" || file.slugs) continue;
                if (isIndex(path) && autoIndex) {
                    indexFiles.add(path);
                    continue;
                }
                file.slugs = slugsFn ? slugsFn({
                    path
                }) : getSlugs(path);
                const key = file.slugs.join("/");
                if (taken.has(key)) throw new Error("Duplicated slugs");
                taken.add(key);
            }
            for (const path of indexFiles){
                const file = storage.read(path);
                if (file?.format !== "page") continue;
                file.slugs = getSlugs(path);
                if (taken.has(file.slugs.join("/"))) file.slugs.push("index");
            }
        }
    };
}
var GroupRegex = /^\(.+\)$/;
function getSlugs(file) {
    const dir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dirname"])(file);
    const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["basename"])(file, (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extname"])(file));
    const slugs = [];
    for (const seg of dir.split("/")){
        if (seg.length > 0 && !GroupRegex.test(seg)) slugs.push(encodeURI(seg));
    }
    if (GroupRegex.test(name)) throw new Error(`Cannot use folder group in file names: ${file}`);
    if (name !== "index") {
        slugs.push(encodeURI(name));
    }
    return slugs;
}
// src/source/loader.ts
function indexPages(storages, { url }) {
    const result = {
        // (locale.slugs -> page)
        pages: /* @__PURE__ */ new Map(),
        // (locale.path -> page)
        pathToMeta: /* @__PURE__ */ new Map(),
        // (locale.path -> meta)
        pathToPage: /* @__PURE__ */ new Map()
    };
    for (const [lang, storage] of Object.entries(storages)){
        for (const filePath of storage.getFiles()){
            const item = storage.read(filePath);
            const path = `${lang}.${filePath}`;
            if (item.format === "meta") {
                result.pathToMeta.set(path, {
                    path: item.path,
                    absolutePath: item.absolutePath,
                    data: item.data
                });
                continue;
            }
            const page = {
                absolutePath: item.absolutePath,
                path: item.path,
                url: url(item.slugs, lang),
                slugs: item.slugs,
                data: item.data,
                locale: lang
            };
            result.pathToPage.set(path, page);
            result.pages.set(`${lang}.${page.slugs.join("/")}`, page);
        }
    }
    return result;
}
function createGetUrl(baseUrl, i18n) {
    const baseSlugs = baseUrl.split("/");
    return (slugs, locale)=>{
        const hideLocale = i18n?.hideLocale ?? "never";
        let urlLocale;
        if (hideLocale === "never") {
            urlLocale = locale;
        } else if (hideLocale === "default-locale" && locale !== i18n?.defaultLanguage) {
            urlLocale = locale;
        }
        const paths = [
            ...baseSlugs,
            ...slugs
        ];
        if (urlLocale) paths.unshift(urlLocale);
        return `/${paths.filter((v1)=>v1.length > 0).join("/")}`;
    };
}
function loader(...args) {
    const loaderConfig = args.length === 2 ? resolveConfig(args[0], args[1]) : resolveConfig(args[0].source, args[0]);
    const { i18n } = loaderConfig;
    const defaultLanguage = i18n?.defaultLanguage ?? "";
    const storages = buildContentStorage(loaderConfig, defaultLanguage);
    const walker = indexPages(storages, loaderConfig);
    const builder = createPageTreeBuilder(loaderConfig);
    let pageTrees;
    function getPageTrees() {
        return pageTrees ??= builder.buildI18n(storages);
    }
    return {
        _i18n: i18n,
        get pageTree () {
            const trees = getPageTrees();
            return i18n ? trees : trees[defaultLanguage];
        },
        set pageTree (v){
            if (i18n) {
                pageTrees = v;
            } else {
                pageTrees ??= {};
                pageTrees[defaultLanguage] = v;
            }
        },
        getPageByHref (href, { dir = "", language = defaultLanguage } = {}) {
            const [value, hash] = href.split("#", 2);
            let target;
            if (value.startsWith(".") && (value.endsWith(".md") || value.endsWith(".mdx"))) {
                const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XZSI7AHE$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["joinPath"])(dir, value);
                target = walker.pathToPage.get(`${language}.${path}`);
            } else {
                target = this.getPages(language).find((item)=>item.url === value);
            }
            if (target) return {
                page: target,
                hash
            };
        },
        getPages (language) {
            const pages = [];
            for (const [key, value] of walker.pages.entries()){
                if (language === void 0 || key.startsWith(`${language}.`)) {
                    pages.push(value);
                }
            }
            return pages;
        },
        getLanguages () {
            const list = [];
            if (!i18n) return list;
            for (const language of i18n.languages){
                list.push({
                    language,
                    pages: this.getPages(language)
                });
            }
            return list;
        },
        // the slugs plugin generates encoded slugs by default.
        // we can assume page slugs are always URI encoded.
        getPage (slugs = [], language = defaultLanguage) {
            let page = walker.pages.get(`${language}.${slugs.join("/")}`);
            if (page) return page;
            page = walker.pages.get(`${language}.${slugs.map(decodeURI).join("/")}`);
            if (page) return page;
        },
        getNodeMeta (node, language = defaultLanguage) {
            const ref = node.$ref?.metaFile;
            if (!ref) return;
            return walker.pathToMeta.get(`${language}.${ref}`);
        },
        getNodePage (node, language = defaultLanguage) {
            const ref = node.$ref?.file;
            if (!ref) return;
            return walker.pathToPage.get(`${language}.${ref}`);
        },
        getPageTree (locale = defaultLanguage) {
            const trees = getPageTrees();
            return trees[locale] ?? trees[defaultLanguage];
        },
        // @ts-expect-error -- ignore this
        generateParams (slug, lang) {
            if (i18n) {
                return this.getLanguages().flatMap((entry)=>entry.pages.map((page)=>({
                            [slug ?? "slug"]: page.slugs,
                            [lang ?? "lang"]: entry.language
                        })));
            }
            return this.getPages().map((page)=>({
                    [slug ?? "slug"]: page.slugs
                }));
        },
        async serializePageTree (tree) {
            const { renderToString } = await __turbopack_context__.A("[project]/eto-docs/node_modules/next/dist/compiled/react-dom/server.edge.js [app-rsc] (ecmascript, async loader)");
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$XKUN7AUK$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["visit"])(tree, (node)=>{
                node = {
                    ...node
                };
                if ("icon" in node && node.icon) {
                    node.icon = renderToString(node.icon);
                }
                if (node.name) {
                    node.name = renderToString(node.name);
                }
                if ("children" in node) {
                    node.children = [
                        ...node.children
                    ];
                }
                return node;
            });
        }
    };
}
function resolveConfig(source, { slugs, icon, plugins = [], baseUrl, url, ...base }) {
    let config = {
        ...base,
        url: url ? (...args)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$PFNP6PEB$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizeUrl"])(url(...args)) : createGetUrl(baseUrl, base.i18n),
        source,
        plugins: buildPlugins([
            slugsPlugin(slugs),
            icon && (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$chunk$2d$FAEPKD7U$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["iconPlugin"])(icon),
            ...typeof plugins === "function" ? plugins({
                typedPlugin: (plugin)=>plugin
            }) : plugins
        ])
    };
    for (const plugin of config.plugins ?? []){
        const result = plugin.config?.(config);
        if (result) config = result;
    }
    return config;
}
;
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/link.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/eto-docs/node_modules/fumadocs-core/dist/link.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/eto-docs/node_modules/fumadocs-core/dist/link.js <module evaluation>", "default");
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/link.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/eto-docs/node_modules/fumadocs-core/dist/link.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/eto-docs/node_modules/fumadocs-core/dist/link.js", "default");
}),
"[project]/eto-docs/node_modules/fumadocs-core/dist/link.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/link.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/fumadocs-core/dist/link.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$fumadocs$2d$core$2f$dist$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/eto-docs/node_modules/clsx/dist/clsx.mjs [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clsx",
    ()=>clsx,
    "default",
    ()=>__TURBOPACK__default__export__
]);
function r(e) {
    var t, f, n = "";
    if ("string" == typeof e || "number" == typeof e) n += e;
    else if ("object" == typeof e) if (Array.isArray(e)) {
        var o = e.length;
        for(t = 0; t < o; t++)e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
    } else for(f in e)e[f] && (n && (n += " "), n += f);
    return n;
}
function clsx() {
    for(var e, t, f = 0, n = "", o = arguments.length; f < o; f++)(e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
    return n;
}
const __TURBOPACK__default__export__ = clsx;
}),
"[project]/eto-docs/node_modules/class-variance-authority/dist/index.mjs [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Copyright 2022 Joe Bell. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR REPRESENTATIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */ __turbopack_context__.s([
    "cva",
    ()=>cva,
    "cx",
    ()=>cx
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/clsx/dist/clsx.mjs [app-rsc] (ecmascript)");
;
const falsyToString = (value)=>typeof value === "boolean" ? `${value}` : value === 0 ? "0" : value;
const cx = __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clsx"];
const cva = (base, config)=>(props)=>{
        var _config_compoundVariants;
        if ((config === null || config === void 0 ? void 0 : config.variants) == null) return cx(base, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
        const { variants, defaultVariants } = config;
        const getVariantClassNames = Object.keys(variants).map((variant)=>{
            const variantProp = props === null || props === void 0 ? void 0 : props[variant];
            const defaultVariantProp = defaultVariants === null || defaultVariants === void 0 ? void 0 : defaultVariants[variant];
            if (variantProp === null) return null;
            const variantKey = falsyToString(variantProp) || falsyToString(defaultVariantProp);
            return variants[variant][variantKey];
        });
        const propsWithoutUndefined = props && Object.entries(props).reduce((acc, param)=>{
            let [key, value] = param;
            if (value === undefined) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
        const getCompoundVariantClassNames = config === null || config === void 0 ? void 0 : (_config_compoundVariants = config.compoundVariants) === null || _config_compoundVariants === void 0 ? void 0 : _config_compoundVariants.reduce((acc, param)=>{
            let { class: cvClass, className: cvClassName, ...compoundVariantOptions } = param;
            return Object.entries(compoundVariantOptions).every((param)=>{
                let [key, value] = param;
                return Array.isArray(value) ? value.includes({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                }[key]) : ({
                    ...defaultVariants,
                    ...propsWithoutUndefined
                })[key] === value;
            }) ? [
                ...acc,
                cvClass,
                cvClassName
            ] : acc;
        }, []);
        return cx(base, getVariantClassNames, getCompoundVariantClassNames, props === null || props === void 0 ? void 0 : props.class, props === null || props === void 0 ? void 0 : props.className);
    };
}),
"[project]/eto-docs/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
exports._ = _interop_require_default;
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/utils/warn-once.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "warnOnce", {
    enumerable: true,
    get: function() {
        return warnOnce;
    }
});
let warnOnce = (_)=>{};
if ("TURBOPACK compile-time truthy", 1) {
    const warnings = new Set();
    warnOnce = (msg)=>{
        if (!warnings.has(msg)) {
            console.warn(msg);
        }
        warnings.add(msg);
    };
} //# sourceMappingURL=warn-once.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/image-blur-svg.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * A shared function, used on both client and server, to generate a SVG blur placeholder.
 */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getImageBlurSvg", {
    enumerable: true,
    get: function() {
        return getImageBlurSvg;
    }
});
function getImageBlurSvg({ widthInt, heightInt, blurWidth, blurHeight, blurDataURL, objectFit }) {
    const std = 20;
    const svgWidth = blurWidth ? blurWidth * 40 : widthInt;
    const svgHeight = blurHeight ? blurHeight * 40 : heightInt;
    const viewBox = svgWidth && svgHeight ? `viewBox='0 0 ${svgWidth} ${svgHeight}'` : '';
    const preserveAspectRatio = viewBox ? 'none' : objectFit === 'contain' ? 'xMidYMid' : objectFit === 'cover' ? 'xMidYMid slice' : 'none';
    return `%3Csvg xmlns='http://www.w3.org/2000/svg' ${viewBox}%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3CfeColorMatrix values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 100 -1' result='s'/%3E%3CfeFlood x='0' y='0' width='100%25' height='100%25'/%3E%3CfeComposite operator='out' in='s'/%3E%3CfeComposite in2='SourceGraphic'/%3E%3CfeGaussianBlur stdDeviation='${std}'/%3E%3C/filter%3E%3Cimage width='100%25' height='100%25' x='0' y='0' preserveAspectRatio='${preserveAspectRatio}' style='filter: url(%23b);' href='${blurDataURL}'/%3E%3C/svg%3E`;
} //# sourceMappingURL=image-blur-svg.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/image-config.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    VALID_LOADERS: null,
    imageConfigDefault: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    VALID_LOADERS: function() {
        return VALID_LOADERS;
    },
    imageConfigDefault: function() {
        return imageConfigDefault;
    }
});
const VALID_LOADERS = [
    'default',
    'imgix',
    'cloudinary',
    'akamai',
    'custom'
];
const imageConfigDefault = {
    deviceSizes: [
        640,
        750,
        828,
        1080,
        1200,
        1920,
        2048,
        3840
    ],
    imageSizes: [
        32,
        48,
        64,
        96,
        128,
        256,
        384
    ],
    path: '/_next/image',
    loader: 'default',
    loaderFile: '',
    /**
   * @deprecated Use `remotePatterns` instead to protect your application from malicious users.
   */ domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 14400,
    formats: [
        'image/webp'
    ],
    maximumRedirects: 3,
    dangerouslyAllowLocalIP: false,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: `script-src 'none'; frame-src 'none'; sandbox;`,
    contentDispositionType: 'attachment',
    localPatterns: undefined,
    remotePatterns: [],
    qualities: [
        75
    ],
    unoptimized: false
}; //# sourceMappingURL=image-config.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/get-img-props.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "getImgProps", {
    enumerable: true,
    get: function() {
        return getImgProps;
    }
});
const _warnonce = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/utils/warn-once.js [app-rsc] (ecmascript)");
const _imageblursvg = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/image-blur-svg.js [app-rsc] (ecmascript)");
const _imageconfig = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/image-config.js [app-rsc] (ecmascript)");
const VALID_LOADING_VALUES = [
    'lazy',
    'eager',
    undefined
];
// Object-fit values that are not valid background-size values
const INVALID_BACKGROUND_SIZE_VALUES = [
    '-moz-initial',
    'fill',
    'none',
    'scale-down',
    undefined
];
function isStaticRequire(src) {
    return src.default !== undefined;
}
function isStaticImageData(src) {
    return src.src !== undefined;
}
function isStaticImport(src) {
    return !!src && typeof src === 'object' && (isStaticRequire(src) || isStaticImageData(src));
}
const allImgs = new Map();
let perfObserver;
function getInt(x) {
    if (typeof x === 'undefined') {
        return x;
    }
    if (typeof x === 'number') {
        return Number.isFinite(x) ? x : NaN;
    }
    if (typeof x === 'string' && /^[0-9]+$/.test(x)) {
        return parseInt(x, 10);
    }
    return NaN;
}
function getWidths({ deviceSizes, allSizes }, width, sizes) {
    if (sizes) {
        // Find all the "vw" percent sizes used in the sizes prop
        const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
        const percentSizes = [];
        for(let match; match = viewportWidthRe.exec(sizes); match){
            percentSizes.push(parseInt(match[2]));
        }
        if (percentSizes.length) {
            const smallestRatio = Math.min(...percentSizes) * 0.01;
            return {
                widths: allSizes.filter((s)=>s >= deviceSizes[0] * smallestRatio),
                kind: 'w'
            };
        }
        return {
            widths: allSizes,
            kind: 'w'
        };
    }
    if (typeof width !== 'number') {
        return {
            widths: deviceSizes,
            kind: 'w'
        };
    }
    const widths = [
        ...new Set(// > are actually 3x in the green color, but only 1.5x in the red and
        // > blue colors. Showing a 3x resolution image in the app vs a 2x
        // > resolution image will be visually the same, though the 3x image
        // > takes significantly more data. Even true 3x resolution screens are
        // > wasteful as the human eye cannot see that level of detail without
        // > something like a magnifying glass.
        // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
        [
            width,
            width * 2 /*, width * 3*/ 
        ].map((w)=>allSizes.find((p)=>p >= w) || allSizes[allSizes.length - 1]))
    ];
    return {
        widths,
        kind: 'x'
    };
}
function generateImgAttrs({ config, src, unoptimized, width, quality, sizes, loader }) {
    if (unoptimized) {
        return {
            src,
            srcSet: undefined,
            sizes: undefined
        };
    }
    const { widths, kind } = getWidths(config, width, sizes);
    const last = widths.length - 1;
    return {
        sizes: !sizes && kind === 'w' ? '100vw' : sizes,
        srcSet: widths.map((w, i)=>`${loader({
                config,
                src,
                quality,
                width: w
            })} ${kind === 'w' ? w : i + 1}${kind}`).join(', '),
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        src: loader({
            config,
            src,
            quality,
            width: widths[last]
        })
    };
}
function getImgProps({ src, sizes, unoptimized = false, priority = false, preload = false, loading, className, quality, width, height, fill = false, style, overrideSrc, onLoad, onLoadingComplete, placeholder = 'empty', blurDataURL, fetchPriority, decoding = 'async', layout, objectFit, objectPosition, lazyBoundary, lazyRoot, ...rest }, _state) {
    const { imgConf, showAltText, blurComplete, defaultLoader } = _state;
    let config;
    let c = imgConf || _imageconfig.imageConfigDefault;
    if ('allSizes' in c) {
        config = c;
    } else {
        const allSizes = [
            ...c.deviceSizes,
            ...c.imageSizes
        ].sort((a, b)=>a - b);
        const deviceSizes = c.deviceSizes.sort((a, b)=>a - b);
        const qualities = c.qualities?.sort((a, b)=>a - b);
        config = {
            ...c,
            allSizes,
            deviceSizes,
            qualities
        };
    }
    if (typeof defaultLoader === 'undefined') {
        throw Object.defineProperty(new Error('images.loaderFile detected but the file is missing default export.\nRead more: https://nextjs.org/docs/messages/invalid-images-config'), "__NEXT_ERROR_CODE", {
            value: "E163",
            enumerable: false,
            configurable: true
        });
    }
    let loader = rest.loader || defaultLoader;
    // Remove property so it's not spread on <img> element
    delete rest.loader;
    delete rest.srcSet;
    // This special value indicates that the user
    // didn't define a "loader" prop or "loader" config.
    const isDefaultLoader = '__next_img_default' in loader;
    if (isDefaultLoader) {
        if (config.loader === 'custom') {
            throw Object.defineProperty(new Error(`Image with src "${src}" is missing "loader" prop.` + `\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader`), "__NEXT_ERROR_CODE", {
                value: "E252",
                enumerable: false,
                configurable: true
            });
        }
    } else {
        // The user defined a "loader" prop or config.
        // Since the config object is internal only, we
        // must not pass it to the user-defined "loader".
        const customImageLoader = loader;
        loader = (obj)=>{
            const { config: _, ...opts } = obj;
            return customImageLoader(opts);
        };
    }
    if (layout) {
        if (layout === 'fill') {
            fill = true;
        }
        const layoutToStyle = {
            intrinsic: {
                maxWidth: '100%',
                height: 'auto'
            },
            responsive: {
                width: '100%',
                height: 'auto'
            }
        };
        const layoutToSizes = {
            responsive: '100vw',
            fill: '100vw'
        };
        const layoutStyle = layoutToStyle[layout];
        if (layoutStyle) {
            style = {
                ...style,
                ...layoutStyle
            };
        }
        const layoutSizes = layoutToSizes[layout];
        if (layoutSizes && !sizes) {
            sizes = layoutSizes;
        }
    }
    let staticSrc = '';
    let widthInt = getInt(width);
    let heightInt = getInt(height);
    let blurWidth;
    let blurHeight;
    if (isStaticImport(src)) {
        const staticImageData = isStaticRequire(src) ? src.default : src;
        if (!staticImageData.src) {
            throw Object.defineProperty(new Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include src. Received ${JSON.stringify(staticImageData)}`), "__NEXT_ERROR_CODE", {
                value: "E460",
                enumerable: false,
                configurable: true
            });
        }
        if (!staticImageData.height || !staticImageData.width) {
            throw Object.defineProperty(new Error(`An object should only be passed to the image component src parameter if it comes from a static image import. It must include height and width. Received ${JSON.stringify(staticImageData)}`), "__NEXT_ERROR_CODE", {
                value: "E48",
                enumerable: false,
                configurable: true
            });
        }
        blurWidth = staticImageData.blurWidth;
        blurHeight = staticImageData.blurHeight;
        blurDataURL = blurDataURL || staticImageData.blurDataURL;
        staticSrc = staticImageData.src;
        if (!fill) {
            if (!widthInt && !heightInt) {
                widthInt = staticImageData.width;
                heightInt = staticImageData.height;
            } else if (widthInt && !heightInt) {
                const ratio = widthInt / staticImageData.width;
                heightInt = Math.round(staticImageData.height * ratio);
            } else if (!widthInt && heightInt) {
                const ratio = heightInt / staticImageData.height;
                widthInt = Math.round(staticImageData.width * ratio);
            }
        }
    }
    src = typeof src === 'string' ? src : staticSrc;
    let isLazy = !priority && !preload && (loading === 'lazy' || typeof loading === 'undefined');
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
        // https://developer.mozilla.org/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
        unoptimized = true;
        isLazy = false;
    }
    if (config.unoptimized) {
        unoptimized = true;
    }
    if (isDefaultLoader && !config.dangerouslyAllowSVG && src.split('?', 1)[0].endsWith('.svg')) {
        // Special case to make svg serve as-is to avoid proxying
        // through the built-in Image Optimization API.
        unoptimized = true;
    }
    const qualityInt = getInt(quality);
    if ("TURBOPACK compile-time truthy", 1) {
        if (config.output === 'export' && isDefaultLoader && !unoptimized) {
            throw Object.defineProperty(new Error(`Image Optimization using the default loader is not compatible with \`{ output: 'export' }\`.
  Possible solutions:
    - Remove \`{ output: 'export' }\` and run "next start" to run server mode including the Image Optimization API.
    - Configure \`{ images: { unoptimized: true } }\` in \`next.config.js\` to disable the Image Optimization API.
  Read more: https://nextjs.org/docs/messages/export-image-api`), "__NEXT_ERROR_CODE", {
                value: "E500",
                enumerable: false,
                configurable: true
            });
        }
        if (!src) {
            // React doesn't show the stack trace and there's
            // no `src` to help identify which image, so we
            // instead console.error(ref) during mount.
            unoptimized = true;
        } else {
            if (fill) {
                if (width) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has both "width" and "fill" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                        value: "E96",
                        enumerable: false,
                        configurable: true
                    });
                }
                if (height) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has both "height" and "fill" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                        value: "E115",
                        enumerable: false,
                        configurable: true
                    });
                }
                if (style?.position && style.position !== 'absolute') {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.position" properties. Images with "fill" always use position absolute - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                        value: "E216",
                        enumerable: false,
                        configurable: true
                    });
                }
                if (style?.width && style.width !== '100%') {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.width" properties. Images with "fill" always use width 100% - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                        value: "E73",
                        enumerable: false,
                        configurable: true
                    });
                }
                if (style?.height && style.height !== '100%') {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has both "fill" and "style.height" properties. Images with "fill" always use height 100% - it cannot be modified.`), "__NEXT_ERROR_CODE", {
                        value: "E404",
                        enumerable: false,
                        configurable: true
                    });
                }
            } else {
                if (typeof widthInt === 'undefined') {
                    throw Object.defineProperty(new Error(`Image with src "${src}" is missing required "width" property.`), "__NEXT_ERROR_CODE", {
                        value: "E451",
                        enumerable: false,
                        configurable: true
                    });
                } else if (isNaN(widthInt)) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "width" property. Expected a numeric value in pixels but received "${width}".`), "__NEXT_ERROR_CODE", {
                        value: "E66",
                        enumerable: false,
                        configurable: true
                    });
                }
                if (typeof heightInt === 'undefined') {
                    throw Object.defineProperty(new Error(`Image with src "${src}" is missing required "height" property.`), "__NEXT_ERROR_CODE", {
                        value: "E397",
                        enumerable: false,
                        configurable: true
                    });
                } else if (isNaN(heightInt)) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "height" property. Expected a numeric value in pixels but received "${height}".`), "__NEXT_ERROR_CODE", {
                        value: "E444",
                        enumerable: false,
                        configurable: true
                    });
                }
                // eslint-disable-next-line no-control-regex
                if (/^[\x00-\x20]/.test(src)) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" cannot start with a space or control character. Use src.trimStart() to remove it or encodeURIComponent(src) to keep it.`), "__NEXT_ERROR_CODE", {
                        value: "E176",
                        enumerable: false,
                        configurable: true
                    });
                }
                // eslint-disable-next-line no-control-regex
                if (/[\x00-\x20]$/.test(src)) {
                    throw Object.defineProperty(new Error(`Image with src "${src}" cannot end with a space or control character. Use src.trimEnd() to remove it or encodeURIComponent(src) to keep it.`), "__NEXT_ERROR_CODE", {
                        value: "E21",
                        enumerable: false,
                        configurable: true
                    });
                }
            }
        }
        if (!VALID_LOADING_VALUES.includes(loading)) {
            throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "loading" property. Provided "${loading}" should be one of ${VALID_LOADING_VALUES.map(String).join(',')}.`), "__NEXT_ERROR_CODE", {
                value: "E357",
                enumerable: false,
                configurable: true
            });
        }
        if (priority && loading === 'lazy') {
            throw Object.defineProperty(new Error(`Image with src "${src}" has both "priority" and "loading='lazy'" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                value: "E218",
                enumerable: false,
                configurable: true
            });
        }
        if (preload && loading === 'lazy') {
            throw Object.defineProperty(new Error(`Image with src "${src}" has both "preload" and "loading='lazy'" properties. Only one should be used.`), "__NEXT_ERROR_CODE", {
                value: "E803",
                enumerable: false,
                configurable: true
            });
        }
        if (preload && priority) {
            throw Object.defineProperty(new Error(`Image with src "${src}" has both "preload" and "priority" properties. Only "preload" should be used.`), "__NEXT_ERROR_CODE", {
                value: "E802",
                enumerable: false,
                configurable: true
            });
        }
        if (placeholder !== 'empty' && placeholder !== 'blur' && !placeholder.startsWith('data:image/')) {
            throw Object.defineProperty(new Error(`Image with src "${src}" has invalid "placeholder" property "${placeholder}".`), "__NEXT_ERROR_CODE", {
                value: "E431",
                enumerable: false,
                configurable: true
            });
        }
        if (placeholder !== 'empty') {
            if (widthInt && heightInt && widthInt * heightInt < 1600) {
                (0, _warnonce.warnOnce)(`Image with src "${src}" is smaller than 40x40. Consider removing the "placeholder" property to improve performance.`);
            }
        }
        if (qualityInt && config.qualities && !config.qualities.includes(qualityInt)) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" is using quality "${qualityInt}" which is not configured in images.qualities [${config.qualities.join(', ')}]. Please update your config to [${[
                ...config.qualities,
                qualityInt
            ].sort().join(', ')}].` + `\nRead more: https://nextjs.org/docs/messages/next-image-unconfigured-qualities`);
        }
        if (placeholder === 'blur' && !blurDataURL) {
            const VALID_BLUR_EXT = [
                'jpeg',
                'png',
                'webp',
                'avif'
            ] // should match next-image-loader
            ;
            throw Object.defineProperty(new Error(`Image with src "${src}" has "placeholder='blur'" property but is missing the "blurDataURL" property.
        Possible solutions:
          - Add a "blurDataURL" property, the contents should be a small Data URL to represent the image
          - Change the "src" property to a static import with one of the supported file types: ${VALID_BLUR_EXT.join(',')} (animated images not supported)
          - Remove the "placeholder" property, effectively no blur effect
        Read more: https://nextjs.org/docs/messages/placeholder-blur-data-url`), "__NEXT_ERROR_CODE", {
                value: "E371",
                enumerable: false,
                configurable: true
            });
        }
        if ('ref' in rest) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" is using unsupported "ref" property. Consider using the "onLoad" property instead.`);
        }
        if (!unoptimized && !isDefaultLoader) {
            const urlStr = loader({
                config,
                src,
                width: widthInt || 400,
                quality: qualityInt || 75
            });
            let url;
            try {
                url = new URL(urlStr);
            } catch (err) {}
            if (urlStr === src || url && url.pathname === src && !url.search) {
                (0, _warnonce.warnOnce)(`Image with src "${src}" has a "loader" property that does not implement width. Please implement it or use the "unoptimized" property instead.` + `\nRead more: https://nextjs.org/docs/messages/next-image-missing-loader-width`);
            }
        }
        if (onLoadingComplete) {
            (0, _warnonce.warnOnce)(`Image with src "${src}" is using deprecated "onLoadingComplete" property. Please use the "onLoad" property instead.`);
        }
        for (const [legacyKey, legacyValue] of Object.entries({
            layout,
            objectFit,
            objectPosition,
            lazyBoundary,
            lazyRoot
        })){
            if (legacyValue) {
                (0, _warnonce.warnOnce)(`Image with src "${src}" has legacy prop "${legacyKey}". Did you forget to run the codemod?` + `\nRead more: https://nextjs.org/docs/messages/next-image-upgrade-to-13`);
            }
        }
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    const imgStyle = Object.assign(fill ? {
        position: 'absolute',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        objectFit,
        objectPosition
    } : {}, showAltText ? {} : {
        color: 'transparent'
    }, style);
    const backgroundImage = !blurComplete && placeholder !== 'empty' ? placeholder === 'blur' ? `url("data:image/svg+xml;charset=utf-8,${(0, _imageblursvg.getImageBlurSvg)({
        widthInt,
        heightInt,
        blurWidth,
        blurHeight,
        blurDataURL: blurDataURL || '',
        objectFit: imgStyle.objectFit
    })}")` : `url("${placeholder}")` // assume `data:image/`
     : null;
    const backgroundSize = !INVALID_BACKGROUND_SIZE_VALUES.includes(imgStyle.objectFit) ? imgStyle.objectFit : imgStyle.objectFit === 'fill' ? '100% 100%' // the background-size equivalent of `fill`
     : 'cover';
    let placeholderStyle = backgroundImage ? {
        backgroundSize,
        backgroundPosition: imgStyle.objectPosition || '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundImage
    } : {};
    if ("TURBOPACK compile-time truthy", 1) {
        if (placeholderStyle.backgroundImage && placeholder === 'blur' && blurDataURL?.startsWith('/')) {
            // During `next dev`, we don't want to generate blur placeholders with webpack
            // because it can delay starting the dev server. Instead, `next-image-loader.js`
            // will inline a special url to lazily generate the blur placeholder at request time.
            placeholderStyle.backgroundImage = `url("${blurDataURL}")`;
        }
    }
    const imgAttributes = generateImgAttrs({
        config,
        src,
        unoptimized,
        width: widthInt,
        quality: qualityInt,
        sizes,
        loader
    });
    const loadingFinal = isLazy ? 'lazy' : loading;
    if ("TURBOPACK compile-time truthy", 1) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    const props = {
        ...rest,
        loading: loadingFinal,
        fetchPriority,
        width: widthInt,
        height: heightInt,
        decoding,
        className,
        style: {
            ...imgStyle,
            ...placeholderStyle
        },
        sizes: imgAttributes.sizes,
        srcSet: imgAttributes.srcSet,
        src: overrideSrc || imgAttributes.src
    };
    const meta = {
        unoptimized,
        preload: preload || priority,
        placeholder,
        fill
    };
    return {
        props,
        meta
    };
} //# sourceMappingURL=get-img-props.js.map
}),
"[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__, module, exports) => {

// This file is generated by next-core EcmascriptClientReferenceModule.
const { createClientModuleProxy } = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
__turbopack_context__.n(createClientModuleProxy("[project]/eto-docs/node_modules/next/dist/client/image-component.js <module evaluation>"));
}),
"[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (client reference proxy)", ((__turbopack_context__, module, exports) => {

// This file is generated by next-core EcmascriptClientReferenceModule.
const { createClientModuleProxy } = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
__turbopack_context__.n(createClientModuleProxy("[project]/eto-docs/node_modules/next/dist/client/image-component.js"));
}),
"[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$eto$2d$docs$2f$node_modules$2f$next$2f$dist$2f$client$2f$image$2d$component$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/find-closest-quality.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "findClosestQuality", {
    enumerable: true,
    get: function() {
        return findClosestQuality;
    }
});
function findClosestQuality(quality, config) {
    const q = quality || 75;
    if (!config?.qualities?.length) {
        return q;
    }
    return config.qualities.reduce((prev, cur)=>Math.abs(cur - q) < Math.abs(prev - q) ? cur : prev, 0);
} //# sourceMappingURL=find-closest-quality.js.map
}),
"[project]/eto-docs/node_modules/next/dist/compiled/picomatch/index.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

(()=>{
    "use strict";
    var t = {
        170: (t, e, u)=>{
            const n = u(510);
            const isWindows = ()=>{
                if (typeof navigator !== "undefined" && navigator.platform) {
                    const t = navigator.platform.toLowerCase();
                    return t === "win32" || t === "windows";
                }
                if (typeof process !== "undefined" && process.platform) {
                    return process.platform === "win32";
                }
                return false;
            };
            function picomatch(t, e, u = false) {
                if (e && (e.windows === null || e.windows === undefined)) {
                    e = {
                        ...e,
                        windows: isWindows()
                    };
                }
                return n(t, e, u);
            }
            Object.assign(picomatch, n);
            t.exports = picomatch;
        },
        154: (t)=>{
            const e = "\\\\/";
            const u = `[^${e}]`;
            const n = "\\.";
            const o = "\\+";
            const s = "\\?";
            const r = "\\/";
            const a = "(?=.)";
            const i = "[^/]";
            const c = `(?:${r}|$)`;
            const p = `(?:^|${r})`;
            const l = `${n}{1,2}${c}`;
            const f = `(?!${n})`;
            const A = `(?!${p}${l})`;
            const _ = `(?!${n}{0,1}${c})`;
            const R = `(?!${l})`;
            const E = `[^.${r}]`;
            const h = `${i}*?`;
            const g = "/";
            const b = {
                DOT_LITERAL: n,
                PLUS_LITERAL: o,
                QMARK_LITERAL: s,
                SLASH_LITERAL: r,
                ONE_CHAR: a,
                QMARK: i,
                END_ANCHOR: c,
                DOTS_SLASH: l,
                NO_DOT: f,
                NO_DOTS: A,
                NO_DOT_SLASH: _,
                NO_DOTS_SLASH: R,
                QMARK_NO_DOT: E,
                STAR: h,
                START_ANCHOR: p,
                SEP: g
            };
            const C = {
                ...b,
                SLASH_LITERAL: `[${e}]`,
                QMARK: u,
                STAR: `${u}*?`,
                DOTS_SLASH: `${n}{1,2}(?:[${e}]|$)`,
                NO_DOT: `(?!${n})`,
                NO_DOTS: `(?!(?:^|[${e}])${n}{1,2}(?:[${e}]|$))`,
                NO_DOT_SLASH: `(?!${n}{0,1}(?:[${e}]|$))`,
                NO_DOTS_SLASH: `(?!${n}{1,2}(?:[${e}]|$))`,
                QMARK_NO_DOT: `[^.${e}]`,
                START_ANCHOR: `(?:^|[${e}])`,
                END_ANCHOR: `(?:[${e}]|$)`,
                SEP: "\\"
            };
            const y = {
                alnum: "a-zA-Z0-9",
                alpha: "a-zA-Z",
                ascii: "\\x00-\\x7F",
                blank: " \\t",
                cntrl: "\\x00-\\x1F\\x7F",
                digit: "0-9",
                graph: "\\x21-\\x7E",
                lower: "a-z",
                print: "\\x20-\\x7E ",
                punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
                space: " \\t\\r\\n\\v\\f",
                upper: "A-Z",
                word: "A-Za-z0-9_",
                xdigit: "A-Fa-f0-9"
            };
            t.exports = {
                MAX_LENGTH: 1024 * 64,
                POSIX_REGEX_SOURCE: y,
                REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
                REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
                REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
                REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
                REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
                REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
                REPLACEMENTS: {
                    "***": "*",
                    "**/**": "**",
                    "**/**/**": "**"
                },
                CHAR_0: 48,
                CHAR_9: 57,
                CHAR_UPPERCASE_A: 65,
                CHAR_LOWERCASE_A: 97,
                CHAR_UPPERCASE_Z: 90,
                CHAR_LOWERCASE_Z: 122,
                CHAR_LEFT_PARENTHESES: 40,
                CHAR_RIGHT_PARENTHESES: 41,
                CHAR_ASTERISK: 42,
                CHAR_AMPERSAND: 38,
                CHAR_AT: 64,
                CHAR_BACKWARD_SLASH: 92,
                CHAR_CARRIAGE_RETURN: 13,
                CHAR_CIRCUMFLEX_ACCENT: 94,
                CHAR_COLON: 58,
                CHAR_COMMA: 44,
                CHAR_DOT: 46,
                CHAR_DOUBLE_QUOTE: 34,
                CHAR_EQUAL: 61,
                CHAR_EXCLAMATION_MARK: 33,
                CHAR_FORM_FEED: 12,
                CHAR_FORWARD_SLASH: 47,
                CHAR_GRAVE_ACCENT: 96,
                CHAR_HASH: 35,
                CHAR_HYPHEN_MINUS: 45,
                CHAR_LEFT_ANGLE_BRACKET: 60,
                CHAR_LEFT_CURLY_BRACE: 123,
                CHAR_LEFT_SQUARE_BRACKET: 91,
                CHAR_LINE_FEED: 10,
                CHAR_NO_BREAK_SPACE: 160,
                CHAR_PERCENT: 37,
                CHAR_PLUS: 43,
                CHAR_QUESTION_MARK: 63,
                CHAR_RIGHT_ANGLE_BRACKET: 62,
                CHAR_RIGHT_CURLY_BRACE: 125,
                CHAR_RIGHT_SQUARE_BRACKET: 93,
                CHAR_SEMICOLON: 59,
                CHAR_SINGLE_QUOTE: 39,
                CHAR_SPACE: 32,
                CHAR_TAB: 9,
                CHAR_UNDERSCORE: 95,
                CHAR_VERTICAL_LINE: 124,
                CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
                extglobChars (t) {
                    return {
                        "!": {
                            type: "negate",
                            open: "(?:(?!(?:",
                            close: `))${t.STAR})`
                        },
                        "?": {
                            type: "qmark",
                            open: "(?:",
                            close: ")?"
                        },
                        "+": {
                            type: "plus",
                            open: "(?:",
                            close: ")+"
                        },
                        "*": {
                            type: "star",
                            open: "(?:",
                            close: ")*"
                        },
                        "@": {
                            type: "at",
                            open: "(?:",
                            close: ")"
                        }
                    };
                },
                globChars (t) {
                    return t === true ? C : b;
                }
            };
        },
        697: (t, e, u)=>{
            const n = u(154);
            const o = u(96);
            const { MAX_LENGTH: s, POSIX_REGEX_SOURCE: r, REGEX_NON_SPECIAL_CHARS: a, REGEX_SPECIAL_CHARS_BACKREF: i, REPLACEMENTS: c } = n;
            const expandRange = (t, e)=>{
                if (typeof e.expandRange === "function") {
                    return e.expandRange(...t, e);
                }
                t.sort();
                const u = `[${t.join("-")}]`;
                try {
                    new RegExp(u);
                } catch (e) {
                    return t.map((t)=>o.escapeRegex(t)).join("..");
                }
                return u;
            };
            const syntaxError = (t, e)=>`Missing ${t}: "${e}" - use "\\\\${e}" to match literal characters`;
            const parse = (t, e)=>{
                if (typeof t !== "string") {
                    throw new TypeError("Expected a string");
                }
                t = c[t] || t;
                const u = {
                    ...e
                };
                const p = typeof u.maxLength === "number" ? Math.min(s, u.maxLength) : s;
                let l = t.length;
                if (l > p) {
                    throw new SyntaxError(`Input length: ${l}, exceeds maximum allowed length: ${p}`);
                }
                const f = {
                    type: "bos",
                    value: "",
                    output: u.prepend || ""
                };
                const A = [
                    f
                ];
                const _ = u.capture ? "" : "?:";
                const R = n.globChars(u.windows);
                const E = n.extglobChars(R);
                const { DOT_LITERAL: h, PLUS_LITERAL: g, SLASH_LITERAL: b, ONE_CHAR: C, DOTS_SLASH: y, NO_DOT: $, NO_DOT_SLASH: x, NO_DOTS_SLASH: S, QMARK: H, QMARK_NO_DOT: v, STAR: d, START_ANCHOR: L } = R;
                const globstar = (t)=>`(${_}(?:(?!${L}${t.dot ? y : h}).)*?)`;
                const T = u.dot ? "" : $;
                const O = u.dot ? H : v;
                let k = u.bash === true ? globstar(u) : d;
                if (u.capture) {
                    k = `(${k})`;
                }
                if (typeof u.noext === "boolean") {
                    u.noextglob = u.noext;
                }
                const m = {
                    input: t,
                    index: -1,
                    start: 0,
                    dot: u.dot === true,
                    consumed: "",
                    output: "",
                    prefix: "",
                    backtrack: false,
                    negated: false,
                    brackets: 0,
                    braces: 0,
                    parens: 0,
                    quotes: 0,
                    globstar: false,
                    tokens: A
                };
                t = o.removePrefix(t, m);
                l = t.length;
                const w = [];
                const N = [];
                const I = [];
                let B = f;
                let G;
                const eos = ()=>m.index === l - 1;
                const D = m.peek = (e = 1)=>t[m.index + e];
                const M = m.advance = ()=>t[++m.index] || "";
                const remaining = ()=>t.slice(m.index + 1);
                const consume = (t = "", e = 0)=>{
                    m.consumed += t;
                    m.index += e;
                };
                const append = (t)=>{
                    m.output += t.output != null ? t.output : t.value;
                    consume(t.value);
                };
                const negate = ()=>{
                    let t = 1;
                    while(D() === "!" && (D(2) !== "(" || D(3) === "?")){
                        M();
                        m.start++;
                        t++;
                    }
                    if (t % 2 === 0) {
                        return false;
                    }
                    m.negated = true;
                    m.start++;
                    return true;
                };
                const increment = (t)=>{
                    m[t]++;
                    I.push(t);
                };
                const decrement = (t)=>{
                    m[t]--;
                    I.pop();
                };
                const push = (t)=>{
                    if (B.type === "globstar") {
                        const e = m.braces > 0 && (t.type === "comma" || t.type === "brace");
                        const u = t.extglob === true || w.length && (t.type === "pipe" || t.type === "paren");
                        if (t.type !== "slash" && t.type !== "paren" && !e && !u) {
                            m.output = m.output.slice(0, -B.output.length);
                            B.type = "star";
                            B.value = "*";
                            B.output = k;
                            m.output += B.output;
                        }
                    }
                    if (w.length && t.type !== "paren") {
                        w[w.length - 1].inner += t.value;
                    }
                    if (t.value || t.output) append(t);
                    if (B && B.type === "text" && t.type === "text") {
                        B.output = (B.output || B.value) + t.value;
                        B.value += t.value;
                        return;
                    }
                    t.prev = B;
                    A.push(t);
                    B = t;
                };
                const extglobOpen = (t, e)=>{
                    const n = {
                        ...E[e],
                        conditions: 1,
                        inner: ""
                    };
                    n.prev = B;
                    n.parens = m.parens;
                    n.output = m.output;
                    const o = (u.capture ? "(" : "") + n.open;
                    increment("parens");
                    push({
                        type: t,
                        value: e,
                        output: m.output ? "" : C
                    });
                    push({
                        type: "paren",
                        extglob: true,
                        value: M(),
                        output: o
                    });
                    w.push(n);
                };
                const extglobClose = (t)=>{
                    let n = t.close + (u.capture ? ")" : "");
                    let o;
                    if (t.type === "negate") {
                        let s = k;
                        if (t.inner && t.inner.length > 1 && t.inner.includes("/")) {
                            s = globstar(u);
                        }
                        if (s !== k || eos() || /^\)+$/.test(remaining())) {
                            n = t.close = `)$))${s}`;
                        }
                        if (t.inner.includes("*") && (o = remaining()) && /^\.[^\\/.]+$/.test(o)) {
                            const u = parse(o, {
                                ...e,
                                fastpaths: false
                            }).output;
                            n = t.close = `)${u})${s})`;
                        }
                        if (t.prev.type === "bos") {
                            m.negatedExtglob = true;
                        }
                    }
                    push({
                        type: "paren",
                        extglob: true,
                        value: G,
                        output: n
                    });
                    decrement("parens");
                };
                if (u.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(t)) {
                    let n = false;
                    let s = t.replace(i, (t, e, u, o, s, r)=>{
                        if (o === "\\") {
                            n = true;
                            return t;
                        }
                        if (o === "?") {
                            if (e) {
                                return e + o + (s ? H.repeat(s.length) : "");
                            }
                            if (r === 0) {
                                return O + (s ? H.repeat(s.length) : "");
                            }
                            return H.repeat(u.length);
                        }
                        if (o === ".") {
                            return h.repeat(u.length);
                        }
                        if (o === "*") {
                            if (e) {
                                return e + o + (s ? k : "");
                            }
                            return k;
                        }
                        return e ? t : `\\${t}`;
                    });
                    if (n === true) {
                        if (u.unescape === true) {
                            s = s.replace(/\\/g, "");
                        } else {
                            s = s.replace(/\\+/g, (t)=>t.length % 2 === 0 ? "\\\\" : t ? "\\" : "");
                        }
                    }
                    if (s === t && u.contains === true) {
                        m.output = t;
                        return m;
                    }
                    m.output = o.wrapOutput(s, m, e);
                    return m;
                }
                while(!eos()){
                    G = M();
                    if (G === "\0") {
                        continue;
                    }
                    if (G === "\\") {
                        const t = D();
                        if (t === "/" && u.bash !== true) {
                            continue;
                        }
                        if (t === "." || t === ";") {
                            continue;
                        }
                        if (!t) {
                            G += "\\";
                            push({
                                type: "text",
                                value: G
                            });
                            continue;
                        }
                        const e = /^\\+/.exec(remaining());
                        let n = 0;
                        if (e && e[0].length > 2) {
                            n = e[0].length;
                            m.index += n;
                            if (n % 2 !== 0) {
                                G += "\\";
                            }
                        }
                        if (u.unescape === true) {
                            G = M();
                        } else {
                            G += M();
                        }
                        if (m.brackets === 0) {
                            push({
                                type: "text",
                                value: G
                            });
                            continue;
                        }
                    }
                    if (m.brackets > 0 && (G !== "]" || B.value === "[" || B.value === "[^")) {
                        if (u.posix !== false && G === ":") {
                            const t = B.value.slice(1);
                            if (t.includes("[")) {
                                B.posix = true;
                                if (t.includes(":")) {
                                    const t = B.value.lastIndexOf("[");
                                    const e = B.value.slice(0, t);
                                    const u = B.value.slice(t + 2);
                                    const n = r[u];
                                    if (n) {
                                        B.value = e + n;
                                        m.backtrack = true;
                                        M();
                                        if (!f.output && A.indexOf(B) === 1) {
                                            f.output = C;
                                        }
                                        continue;
                                    }
                                }
                            }
                        }
                        if (G === "[" && D() !== ":" || G === "-" && D() === "]") {
                            G = `\\${G}`;
                        }
                        if (G === "]" && (B.value === "[" || B.value === "[^")) {
                            G = `\\${G}`;
                        }
                        if (u.posix === true && G === "!" && B.value === "[") {
                            G = "^";
                        }
                        B.value += G;
                        append({
                            value: G
                        });
                        continue;
                    }
                    if (m.quotes === 1 && G !== '"') {
                        G = o.escapeRegex(G);
                        B.value += G;
                        append({
                            value: G
                        });
                        continue;
                    }
                    if (G === '"') {
                        m.quotes = m.quotes === 1 ? 0 : 1;
                        if (u.keepQuotes === true) {
                            push({
                                type: "text",
                                value: G
                            });
                        }
                        continue;
                    }
                    if (G === "(") {
                        increment("parens");
                        push({
                            type: "paren",
                            value: G
                        });
                        continue;
                    }
                    if (G === ")") {
                        if (m.parens === 0 && u.strictBrackets === true) {
                            throw new SyntaxError(syntaxError("opening", "("));
                        }
                        const t = w[w.length - 1];
                        if (t && m.parens === t.parens + 1) {
                            extglobClose(w.pop());
                            continue;
                        }
                        push({
                            type: "paren",
                            value: G,
                            output: m.parens ? ")" : "\\)"
                        });
                        decrement("parens");
                        continue;
                    }
                    if (G === "[") {
                        if (u.nobracket === true || !remaining().includes("]")) {
                            if (u.nobracket !== true && u.strictBrackets === true) {
                                throw new SyntaxError(syntaxError("closing", "]"));
                            }
                            G = `\\${G}`;
                        } else {
                            increment("brackets");
                        }
                        push({
                            type: "bracket",
                            value: G
                        });
                        continue;
                    }
                    if (G === "]") {
                        if (u.nobracket === true || B && B.type === "bracket" && B.value.length === 1) {
                            push({
                                type: "text",
                                value: G,
                                output: `\\${G}`
                            });
                            continue;
                        }
                        if (m.brackets === 0) {
                            if (u.strictBrackets === true) {
                                throw new SyntaxError(syntaxError("opening", "["));
                            }
                            push({
                                type: "text",
                                value: G,
                                output: `\\${G}`
                            });
                            continue;
                        }
                        decrement("brackets");
                        const t = B.value.slice(1);
                        if (B.posix !== true && t[0] === "^" && !t.includes("/")) {
                            G = `/${G}`;
                        }
                        B.value += G;
                        append({
                            value: G
                        });
                        if (u.literalBrackets === false || o.hasRegexChars(t)) {
                            continue;
                        }
                        const e = o.escapeRegex(B.value);
                        m.output = m.output.slice(0, -B.value.length);
                        if (u.literalBrackets === true) {
                            m.output += e;
                            B.value = e;
                            continue;
                        }
                        B.value = `(${_}${e}|${B.value})`;
                        m.output += B.value;
                        continue;
                    }
                    if (G === "{" && u.nobrace !== true) {
                        increment("braces");
                        const t = {
                            type: "brace",
                            value: G,
                            output: "(",
                            outputIndex: m.output.length,
                            tokensIndex: m.tokens.length
                        };
                        N.push(t);
                        push(t);
                        continue;
                    }
                    if (G === "}") {
                        const t = N[N.length - 1];
                        if (u.nobrace === true || !t) {
                            push({
                                type: "text",
                                value: G,
                                output: G
                            });
                            continue;
                        }
                        let e = ")";
                        if (t.dots === true) {
                            const t = A.slice();
                            const n = [];
                            for(let e = t.length - 1; e >= 0; e--){
                                A.pop();
                                if (t[e].type === "brace") {
                                    break;
                                }
                                if (t[e].type !== "dots") {
                                    n.unshift(t[e].value);
                                }
                            }
                            e = expandRange(n, u);
                            m.backtrack = true;
                        }
                        if (t.comma !== true && t.dots !== true) {
                            const u = m.output.slice(0, t.outputIndex);
                            const n = m.tokens.slice(t.tokensIndex);
                            t.value = t.output = "\\{";
                            G = e = "\\}";
                            m.output = u;
                            for (const t of n){
                                m.output += t.output || t.value;
                            }
                        }
                        push({
                            type: "brace",
                            value: G,
                            output: e
                        });
                        decrement("braces");
                        N.pop();
                        continue;
                    }
                    if (G === "|") {
                        if (w.length > 0) {
                            w[w.length - 1].conditions++;
                        }
                        push({
                            type: "text",
                            value: G
                        });
                        continue;
                    }
                    if (G === ",") {
                        let t = G;
                        const e = N[N.length - 1];
                        if (e && I[I.length - 1] === "braces") {
                            e.comma = true;
                            t = "|";
                        }
                        push({
                            type: "comma",
                            value: G,
                            output: t
                        });
                        continue;
                    }
                    if (G === "/") {
                        if (B.type === "dot" && m.index === m.start + 1) {
                            m.start = m.index + 1;
                            m.consumed = "";
                            m.output = "";
                            A.pop();
                            B = f;
                            continue;
                        }
                        push({
                            type: "slash",
                            value: G,
                            output: b
                        });
                        continue;
                    }
                    if (G === ".") {
                        if (m.braces > 0 && B.type === "dot") {
                            if (B.value === ".") B.output = h;
                            const t = N[N.length - 1];
                            B.type = "dots";
                            B.output += G;
                            B.value += G;
                            t.dots = true;
                            continue;
                        }
                        if (m.braces + m.parens === 0 && B.type !== "bos" && B.type !== "slash") {
                            push({
                                type: "text",
                                value: G,
                                output: h
                            });
                            continue;
                        }
                        push({
                            type: "dot",
                            value: G,
                            output: h
                        });
                        continue;
                    }
                    if (G === "?") {
                        const t = B && B.value === "(";
                        if (!t && u.noextglob !== true && D() === "(" && D(2) !== "?") {
                            extglobOpen("qmark", G);
                            continue;
                        }
                        if (B && B.type === "paren") {
                            const t = D();
                            let e = G;
                            if (B.value === "(" && !/[!=<:]/.test(t) || t === "<" && !/<([!=]|\w+>)/.test(remaining())) {
                                e = `\\${G}`;
                            }
                            push({
                                type: "text",
                                value: G,
                                output: e
                            });
                            continue;
                        }
                        if (u.dot !== true && (B.type === "slash" || B.type === "bos")) {
                            push({
                                type: "qmark",
                                value: G,
                                output: v
                            });
                            continue;
                        }
                        push({
                            type: "qmark",
                            value: G,
                            output: H
                        });
                        continue;
                    }
                    if (G === "!") {
                        if (u.noextglob !== true && D() === "(") {
                            if (D(2) !== "?" || !/[!=<:]/.test(D(3))) {
                                extglobOpen("negate", G);
                                continue;
                            }
                        }
                        if (u.nonegate !== true && m.index === 0) {
                            negate();
                            continue;
                        }
                    }
                    if (G === "+") {
                        if (u.noextglob !== true && D() === "(" && D(2) !== "?") {
                            extglobOpen("plus", G);
                            continue;
                        }
                        if (B && B.value === "(" || u.regex === false) {
                            push({
                                type: "plus",
                                value: G,
                                output: g
                            });
                            continue;
                        }
                        if (B && (B.type === "bracket" || B.type === "paren" || B.type === "brace") || m.parens > 0) {
                            push({
                                type: "plus",
                                value: G
                            });
                            continue;
                        }
                        push({
                            type: "plus",
                            value: g
                        });
                        continue;
                    }
                    if (G === "@") {
                        if (u.noextglob !== true && D() === "(" && D(2) !== "?") {
                            push({
                                type: "at",
                                extglob: true,
                                value: G,
                                output: ""
                            });
                            continue;
                        }
                        push({
                            type: "text",
                            value: G
                        });
                        continue;
                    }
                    if (G !== "*") {
                        if (G === "$" || G === "^") {
                            G = `\\${G}`;
                        }
                        const t = a.exec(remaining());
                        if (t) {
                            G += t[0];
                            m.index += t[0].length;
                        }
                        push({
                            type: "text",
                            value: G
                        });
                        continue;
                    }
                    if (B && (B.type === "globstar" || B.star === true)) {
                        B.type = "star";
                        B.star = true;
                        B.value += G;
                        B.output = k;
                        m.backtrack = true;
                        m.globstar = true;
                        consume(G);
                        continue;
                    }
                    let e = remaining();
                    if (u.noextglob !== true && /^\([^?]/.test(e)) {
                        extglobOpen("star", G);
                        continue;
                    }
                    if (B.type === "star") {
                        if (u.noglobstar === true) {
                            consume(G);
                            continue;
                        }
                        const n = B.prev;
                        const o = n.prev;
                        const s = n.type === "slash" || n.type === "bos";
                        const r = o && (o.type === "star" || o.type === "globstar");
                        if (u.bash === true && (!s || e[0] && e[0] !== "/")) {
                            push({
                                type: "star",
                                value: G,
                                output: ""
                            });
                            continue;
                        }
                        const a = m.braces > 0 && (n.type === "comma" || n.type === "brace");
                        const i = w.length && (n.type === "pipe" || n.type === "paren");
                        if (!s && n.type !== "paren" && !a && !i) {
                            push({
                                type: "star",
                                value: G,
                                output: ""
                            });
                            continue;
                        }
                        while(e.slice(0, 3) === "/**"){
                            const u = t[m.index + 4];
                            if (u && u !== "/") {
                                break;
                            }
                            e = e.slice(3);
                            consume("/**", 3);
                        }
                        if (n.type === "bos" && eos()) {
                            B.type = "globstar";
                            B.value += G;
                            B.output = globstar(u);
                            m.output = B.output;
                            m.globstar = true;
                            consume(G);
                            continue;
                        }
                        if (n.type === "slash" && n.prev.type !== "bos" && !r && eos()) {
                            m.output = m.output.slice(0, -(n.output + B.output).length);
                            n.output = `(?:${n.output}`;
                            B.type = "globstar";
                            B.output = globstar(u) + (u.strictSlashes ? ")" : "|$)");
                            B.value += G;
                            m.globstar = true;
                            m.output += n.output + B.output;
                            consume(G);
                            continue;
                        }
                        if (n.type === "slash" && n.prev.type !== "bos" && e[0] === "/") {
                            const t = e[1] !== void 0 ? "|$" : "";
                            m.output = m.output.slice(0, -(n.output + B.output).length);
                            n.output = `(?:${n.output}`;
                            B.type = "globstar";
                            B.output = `${globstar(u)}${b}|${b}${t})`;
                            B.value += G;
                            m.output += n.output + B.output;
                            m.globstar = true;
                            consume(G + M());
                            push({
                                type: "slash",
                                value: "/",
                                output: ""
                            });
                            continue;
                        }
                        if (n.type === "bos" && e[0] === "/") {
                            B.type = "globstar";
                            B.value += G;
                            B.output = `(?:^|${b}|${globstar(u)}${b})`;
                            m.output = B.output;
                            m.globstar = true;
                            consume(G + M());
                            push({
                                type: "slash",
                                value: "/",
                                output: ""
                            });
                            continue;
                        }
                        m.output = m.output.slice(0, -B.output.length);
                        B.type = "globstar";
                        B.output = globstar(u);
                        B.value += G;
                        m.output += B.output;
                        m.globstar = true;
                        consume(G);
                        continue;
                    }
                    const n = {
                        type: "star",
                        value: G,
                        output: k
                    };
                    if (u.bash === true) {
                        n.output = ".*?";
                        if (B.type === "bos" || B.type === "slash") {
                            n.output = T + n.output;
                        }
                        push(n);
                        continue;
                    }
                    if (B && (B.type === "bracket" || B.type === "paren") && u.regex === true) {
                        n.output = G;
                        push(n);
                        continue;
                    }
                    if (m.index === m.start || B.type === "slash" || B.type === "dot") {
                        if (B.type === "dot") {
                            m.output += x;
                            B.output += x;
                        } else if (u.dot === true) {
                            m.output += S;
                            B.output += S;
                        } else {
                            m.output += T;
                            B.output += T;
                        }
                        if (D() !== "*") {
                            m.output += C;
                            B.output += C;
                        }
                    }
                    push(n);
                }
                while(m.brackets > 0){
                    if (u.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
                    m.output = o.escapeLast(m.output, "[");
                    decrement("brackets");
                }
                while(m.parens > 0){
                    if (u.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
                    m.output = o.escapeLast(m.output, "(");
                    decrement("parens");
                }
                while(m.braces > 0){
                    if (u.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
                    m.output = o.escapeLast(m.output, "{");
                    decrement("braces");
                }
                if (u.strictSlashes !== true && (B.type === "star" || B.type === "bracket")) {
                    push({
                        type: "maybe_slash",
                        value: "",
                        output: `${b}?`
                    });
                }
                if (m.backtrack === true) {
                    m.output = "";
                    for (const t of m.tokens){
                        m.output += t.output != null ? t.output : t.value;
                        if (t.suffix) {
                            m.output += t.suffix;
                        }
                    }
                }
                return m;
            };
            parse.fastpaths = (t, e)=>{
                const u = {
                    ...e
                };
                const r = typeof u.maxLength === "number" ? Math.min(s, u.maxLength) : s;
                const a = t.length;
                if (a > r) {
                    throw new SyntaxError(`Input length: ${a}, exceeds maximum allowed length: ${r}`);
                }
                t = c[t] || t;
                const { DOT_LITERAL: i, SLASH_LITERAL: p, ONE_CHAR: l, DOTS_SLASH: f, NO_DOT: A, NO_DOTS: _, NO_DOTS_SLASH: R, STAR: E, START_ANCHOR: h } = n.globChars(u.windows);
                const g = u.dot ? _ : A;
                const b = u.dot ? R : A;
                const C = u.capture ? "" : "?:";
                const y = {
                    negated: false,
                    prefix: ""
                };
                let $ = u.bash === true ? ".*?" : E;
                if (u.capture) {
                    $ = `(${$})`;
                }
                const globstar = (t)=>{
                    if (t.noglobstar === true) return $;
                    return `(${C}(?:(?!${h}${t.dot ? f : i}).)*?)`;
                };
                const create = (t)=>{
                    switch(t){
                        case "*":
                            return `${g}${l}${$}`;
                        case ".*":
                            return `${i}${l}${$}`;
                        case "*.*":
                            return `${g}${$}${i}${l}${$}`;
                        case "*/*":
                            return `${g}${$}${p}${l}${b}${$}`;
                        case "**":
                            return g + globstar(u);
                        case "**/*":
                            return `(?:${g}${globstar(u)}${p})?${b}${l}${$}`;
                        case "**/*.*":
                            return `(?:${g}${globstar(u)}${p})?${b}${$}${i}${l}${$}`;
                        case "**/.*":
                            return `(?:${g}${globstar(u)}${p})?${i}${l}${$}`;
                        default:
                            {
                                const e = /^(.*?)\.(\w+)$/.exec(t);
                                if (!e) return;
                                const u = create(e[1]);
                                if (!u) return;
                                return u + i + e[2];
                            }
                    }
                };
                const x = o.removePrefix(t, y);
                let S = create(x);
                if (S && u.strictSlashes !== true) {
                    S += `${p}?`;
                }
                return S;
            };
            t.exports = parse;
        },
        510: (t, e, u)=>{
            const n = u(716);
            const o = u(697);
            const s = u(96);
            const r = u(154);
            const isObject = (t)=>t && typeof t === "object" && !Array.isArray(t);
            const picomatch = (t, e, u = false)=>{
                if (Array.isArray(t)) {
                    const n = t.map((t)=>picomatch(t, e, u));
                    const arrayMatcher = (t)=>{
                        for (const e of n){
                            const u = e(t);
                            if (u) return u;
                        }
                        return false;
                    };
                    return arrayMatcher;
                }
                const n = isObject(t) && t.tokens && t.input;
                if (t === "" || typeof t !== "string" && !n) {
                    throw new TypeError("Expected pattern to be a non-empty string");
                }
                const o = e || {};
                const s = o.windows;
                const r = n ? picomatch.compileRe(t, e) : picomatch.makeRe(t, e, false, true);
                const a = r.state;
                delete r.state;
                let isIgnored = ()=>false;
                if (o.ignore) {
                    const t = {
                        ...e,
                        ignore: null,
                        onMatch: null,
                        onResult: null
                    };
                    isIgnored = picomatch(o.ignore, t, u);
                }
                const matcher = (u, n = false)=>{
                    const { isMatch: i, match: c, output: p } = picomatch.test(u, r, e, {
                        glob: t,
                        posix: s
                    });
                    const l = {
                        glob: t,
                        state: a,
                        regex: r,
                        posix: s,
                        input: u,
                        output: p,
                        match: c,
                        isMatch: i
                    };
                    if (typeof o.onResult === "function") {
                        o.onResult(l);
                    }
                    if (i === false) {
                        l.isMatch = false;
                        return n ? l : false;
                    }
                    if (isIgnored(u)) {
                        if (typeof o.onIgnore === "function") {
                            o.onIgnore(l);
                        }
                        l.isMatch = false;
                        return n ? l : false;
                    }
                    if (typeof o.onMatch === "function") {
                        o.onMatch(l);
                    }
                    return n ? l : true;
                };
                if (u) {
                    matcher.state = a;
                }
                return matcher;
            };
            picomatch.test = (t, e, u, { glob: n, posix: o } = {})=>{
                if (typeof t !== "string") {
                    throw new TypeError("Expected input to be a string");
                }
                if (t === "") {
                    return {
                        isMatch: false,
                        output: ""
                    };
                }
                const r = u || {};
                const a = r.format || (o ? s.toPosixSlashes : null);
                let i = t === n;
                let c = i && a ? a(t) : t;
                if (i === false) {
                    c = a ? a(t) : t;
                    i = c === n;
                }
                if (i === false || r.capture === true) {
                    if (r.matchBase === true || r.basename === true) {
                        i = picomatch.matchBase(t, e, u, o);
                    } else {
                        i = e.exec(c);
                    }
                }
                return {
                    isMatch: Boolean(i),
                    match: i,
                    output: c
                };
            };
            picomatch.matchBase = (t, e, u)=>{
                const n = e instanceof RegExp ? e : picomatch.makeRe(e, u);
                return n.test(s.basename(t));
            };
            picomatch.isMatch = (t, e, u)=>picomatch(e, u)(t);
            picomatch.parse = (t, e)=>{
                if (Array.isArray(t)) return t.map((t)=>picomatch.parse(t, e));
                return o(t, {
                    ...e,
                    fastpaths: false
                });
            };
            picomatch.scan = (t, e)=>n(t, e);
            picomatch.compileRe = (t, e, u = false, n = false)=>{
                if (u === true) {
                    return t.output;
                }
                const o = e || {};
                const s = o.contains ? "" : "^";
                const r = o.contains ? "" : "$";
                let a = `${s}(?:${t.output})${r}`;
                if (t && t.negated === true) {
                    a = `^(?!${a}).*$`;
                }
                const i = picomatch.toRegex(a, e);
                if (n === true) {
                    i.state = t;
                }
                return i;
            };
            picomatch.makeRe = (t, e = {}, u = false, n = false)=>{
                if (!t || typeof t !== "string") {
                    throw new TypeError("Expected a non-empty string");
                }
                let s = {
                    negated: false,
                    fastpaths: true
                };
                if (e.fastpaths !== false && (t[0] === "." || t[0] === "*")) {
                    s.output = o.fastpaths(t, e);
                }
                if (!s.output) {
                    s = o(t, e);
                }
                return picomatch.compileRe(s, e, u, n);
            };
            picomatch.toRegex = (t, e)=>{
                try {
                    const u = e || {};
                    return new RegExp(t, u.flags || (u.nocase ? "i" : ""));
                } catch (t) {
                    if (e && e.debug === true) throw t;
                    return /$^/;
                }
            };
            picomatch.constants = r;
            t.exports = picomatch;
        },
        716: (t, e, u)=>{
            const n = u(96);
            const { CHAR_ASTERISK: o, CHAR_AT: s, CHAR_BACKWARD_SLASH: r, CHAR_COMMA: a, CHAR_DOT: i, CHAR_EXCLAMATION_MARK: c, CHAR_FORWARD_SLASH: p, CHAR_LEFT_CURLY_BRACE: l, CHAR_LEFT_PARENTHESES: f, CHAR_LEFT_SQUARE_BRACKET: A, CHAR_PLUS: _, CHAR_QUESTION_MARK: R, CHAR_RIGHT_CURLY_BRACE: E, CHAR_RIGHT_PARENTHESES: h, CHAR_RIGHT_SQUARE_BRACKET: g } = u(154);
            const isPathSeparator = (t)=>t === p || t === r;
            const depth = (t)=>{
                if (t.isPrefix !== true) {
                    t.depth = t.isGlobstar ? Infinity : 1;
                }
            };
            const scan = (t, e)=>{
                const u = e || {};
                const b = t.length - 1;
                const C = u.parts === true || u.scanToEnd === true;
                const y = [];
                const $ = [];
                const x = [];
                let S = t;
                let H = -1;
                let v = 0;
                let d = 0;
                let L = false;
                let T = false;
                let O = false;
                let k = false;
                let m = false;
                let w = false;
                let N = false;
                let I = false;
                let B = false;
                let G = false;
                let D = 0;
                let M;
                let P;
                let K = {
                    value: "",
                    depth: 0,
                    isGlob: false
                };
                const eos = ()=>H >= b;
                const peek = ()=>S.charCodeAt(H + 1);
                const advance = ()=>{
                    M = P;
                    return S.charCodeAt(++H);
                };
                while(H < b){
                    P = advance();
                    let t;
                    if (P === r) {
                        N = K.backslashes = true;
                        P = advance();
                        if (P === l) {
                            w = true;
                        }
                        continue;
                    }
                    if (w === true || P === l) {
                        D++;
                        while(eos() !== true && (P = advance())){
                            if (P === r) {
                                N = K.backslashes = true;
                                advance();
                                continue;
                            }
                            if (P === l) {
                                D++;
                                continue;
                            }
                            if (w !== true && P === i && (P = advance()) === i) {
                                L = K.isBrace = true;
                                O = K.isGlob = true;
                                G = true;
                                if (C === true) {
                                    continue;
                                }
                                break;
                            }
                            if (w !== true && P === a) {
                                L = K.isBrace = true;
                                O = K.isGlob = true;
                                G = true;
                                if (C === true) {
                                    continue;
                                }
                                break;
                            }
                            if (P === E) {
                                D--;
                                if (D === 0) {
                                    w = false;
                                    L = K.isBrace = true;
                                    G = true;
                                    break;
                                }
                            }
                        }
                        if (C === true) {
                            continue;
                        }
                        break;
                    }
                    if (P === p) {
                        y.push(H);
                        $.push(K);
                        K = {
                            value: "",
                            depth: 0,
                            isGlob: false
                        };
                        if (G === true) continue;
                        if (M === i && H === v + 1) {
                            v += 2;
                            continue;
                        }
                        d = H + 1;
                        continue;
                    }
                    if (u.noext !== true) {
                        const t = P === _ || P === s || P === o || P === R || P === c;
                        if (t === true && peek() === f) {
                            O = K.isGlob = true;
                            k = K.isExtglob = true;
                            G = true;
                            if (P === c && H === v) {
                                B = true;
                            }
                            if (C === true) {
                                while(eos() !== true && (P = advance())){
                                    if (P === r) {
                                        N = K.backslashes = true;
                                        P = advance();
                                        continue;
                                    }
                                    if (P === h) {
                                        O = K.isGlob = true;
                                        G = true;
                                        break;
                                    }
                                }
                                continue;
                            }
                            break;
                        }
                    }
                    if (P === o) {
                        if (M === o) m = K.isGlobstar = true;
                        O = K.isGlob = true;
                        G = true;
                        if (C === true) {
                            continue;
                        }
                        break;
                    }
                    if (P === R) {
                        O = K.isGlob = true;
                        G = true;
                        if (C === true) {
                            continue;
                        }
                        break;
                    }
                    if (P === A) {
                        while(eos() !== true && (t = advance())){
                            if (t === r) {
                                N = K.backslashes = true;
                                advance();
                                continue;
                            }
                            if (t === g) {
                                T = K.isBracket = true;
                                O = K.isGlob = true;
                                G = true;
                                break;
                            }
                        }
                        if (C === true) {
                            continue;
                        }
                        break;
                    }
                    if (u.nonegate !== true && P === c && H === v) {
                        I = K.negated = true;
                        v++;
                        continue;
                    }
                    if (u.noparen !== true && P === f) {
                        O = K.isGlob = true;
                        if (C === true) {
                            while(eos() !== true && (P = advance())){
                                if (P === f) {
                                    N = K.backslashes = true;
                                    P = advance();
                                    continue;
                                }
                                if (P === h) {
                                    G = true;
                                    break;
                                }
                            }
                            continue;
                        }
                        break;
                    }
                    if (O === true) {
                        G = true;
                        if (C === true) {
                            continue;
                        }
                        break;
                    }
                }
                if (u.noext === true) {
                    k = false;
                    O = false;
                }
                let U = S;
                let X = "";
                let F = "";
                if (v > 0) {
                    X = S.slice(0, v);
                    S = S.slice(v);
                    d -= v;
                }
                if (U && O === true && d > 0) {
                    U = S.slice(0, d);
                    F = S.slice(d);
                } else if (O === true) {
                    U = "";
                    F = S;
                } else {
                    U = S;
                }
                if (U && U !== "" && U !== "/" && U !== S) {
                    if (isPathSeparator(U.charCodeAt(U.length - 1))) {
                        U = U.slice(0, -1);
                    }
                }
                if (u.unescape === true) {
                    if (F) F = n.removeBackslashes(F);
                    if (U && N === true) {
                        U = n.removeBackslashes(U);
                    }
                }
                const Q = {
                    prefix: X,
                    input: t,
                    start: v,
                    base: U,
                    glob: F,
                    isBrace: L,
                    isBracket: T,
                    isGlob: O,
                    isExtglob: k,
                    isGlobstar: m,
                    negated: I,
                    negatedExtglob: B
                };
                if (u.tokens === true) {
                    Q.maxDepth = 0;
                    if (!isPathSeparator(P)) {
                        $.push(K);
                    }
                    Q.tokens = $;
                }
                if (u.parts === true || u.tokens === true) {
                    let e;
                    for(let n = 0; n < y.length; n++){
                        const o = e ? e + 1 : v;
                        const s = y[n];
                        const r = t.slice(o, s);
                        if (u.tokens) {
                            if (n === 0 && v !== 0) {
                                $[n].isPrefix = true;
                                $[n].value = X;
                            } else {
                                $[n].value = r;
                            }
                            depth($[n]);
                            Q.maxDepth += $[n].depth;
                        }
                        if (n !== 0 || r !== "") {
                            x.push(r);
                        }
                        e = s;
                    }
                    if (e && e + 1 < t.length) {
                        const n = t.slice(e + 1);
                        x.push(n);
                        if (u.tokens) {
                            $[$.length - 1].value = n;
                            depth($[$.length - 1]);
                            Q.maxDepth += $[$.length - 1].depth;
                        }
                    }
                    Q.slashes = y;
                    Q.parts = x;
                }
                return Q;
            };
            t.exports = scan;
        },
        96: (t, e, u)=>{
            const { REGEX_BACKSLASH: n, REGEX_REMOVE_BACKSLASH: o, REGEX_SPECIAL_CHARS: s, REGEX_SPECIAL_CHARS_GLOBAL: r } = u(154);
            e.isObject = (t)=>t !== null && typeof t === "object" && !Array.isArray(t);
            e.hasRegexChars = (t)=>s.test(t);
            e.isRegexChar = (t)=>t.length === 1 && e.hasRegexChars(t);
            e.escapeRegex = (t)=>t.replace(r, "\\$1");
            e.toPosixSlashes = (t)=>t.replace(n, "/");
            e.removeBackslashes = (t)=>t.replace(o, (t)=>t === "\\" ? "" : t);
            e.escapeLast = (t, u, n)=>{
                const o = t.lastIndexOf(u, n);
                if (o === -1) return t;
                if (t[o - 1] === "\\") return e.escapeLast(t, u, o - 1);
                return `${t.slice(0, o)}\\${t.slice(o)}`;
            };
            e.removePrefix = (t, e = {})=>{
                let u = t;
                if (u.startsWith("./")) {
                    u = u.slice(2);
                    e.prefix = "./";
                }
                return u;
            };
            e.wrapOutput = (t, e = {}, u = {})=>{
                const n = u.contains ? "" : "^";
                const o = u.contains ? "" : "$";
                let s = `${n}(?:${t})${o}`;
                if (e.negated === true) {
                    s = `(?:^(?!${s}).*$)`;
                }
                return s;
            };
            e.basename = (t, { windows: e } = {})=>{
                const u = t.split(e ? /[\\/]/ : "/");
                const n = u[u.length - 1];
                if (n === "") {
                    return u[u.length - 2];
                }
                return n;
            };
        }
    };
    var e = {};
    function __nccwpck_require__(u) {
        var n = e[u];
        if (n !== undefined) {
            return n.exports;
        }
        var o = e[u] = {
            exports: {}
        };
        var s = true;
        try {
            t[u](o, o.exports, __nccwpck_require__);
            s = false;
        } finally{
            if (s) delete e[u];
        }
        return o.exports;
    }
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = ("TURBOPACK compile-time value", "/ROOT/eto-docs/node_modules/next/dist/compiled/picomatch") + "/";
    var u = __nccwpck_require__(170);
    module.exports = u;
})();
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/match-local-pattern.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    hasLocalMatch: null,
    matchLocalPattern: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    hasLocalMatch: function() {
        return hasLocalMatch;
    },
    matchLocalPattern: function() {
        return matchLocalPattern;
    }
});
const _picomatch = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/compiled/picomatch/index.js [app-rsc] (ecmascript)");
function matchLocalPattern(pattern, url) {
    if (pattern.search !== undefined) {
        if (pattern.search !== url.search) {
            return false;
        }
    }
    if (!(0, _picomatch.makeRe)(pattern.pathname ?? '**', {
        dot: true
    }).test(url.pathname)) {
        return false;
    }
    return true;
}
function hasLocalMatch(localPatterns, urlPathAndQuery) {
    if (!localPatterns) {
        // if the user didn't define "localPatterns", we allow all local images
        return true;
    }
    const url = new URL(urlPathAndQuery, 'http://n');
    return localPatterns.some((p)=>matchLocalPattern(p, url));
} //# sourceMappingURL=match-local-pattern.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/match-remote-pattern.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    hasRemoteMatch: null,
    matchRemotePattern: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    hasRemoteMatch: function() {
        return hasRemoteMatch;
    },
    matchRemotePattern: function() {
        return matchRemotePattern;
    }
});
const _picomatch = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/compiled/picomatch/index.js [app-rsc] (ecmascript)");
function matchRemotePattern(pattern, url) {
    if (pattern.protocol !== undefined) {
        if (pattern.protocol.replace(/:$/, '') !== url.protocol.replace(/:$/, '')) {
            return false;
        }
    }
    if (pattern.port !== undefined) {
        if (pattern.port !== url.port) {
            return false;
        }
    }
    if (pattern.hostname === undefined) {
        throw Object.defineProperty(new Error(`Pattern should define hostname but found\n${JSON.stringify(pattern)}`), "__NEXT_ERROR_CODE", {
            value: "E410",
            enumerable: false,
            configurable: true
        });
    } else {
        if (!(0, _picomatch.makeRe)(pattern.hostname).test(url.hostname)) {
            return false;
        }
    }
    if (pattern.search !== undefined) {
        if (pattern.search !== url.search) {
            return false;
        }
    }
    // Should be the same as writeImagesManifest()
    if (!(0, _picomatch.makeRe)(pattern.pathname ?? '**', {
        dot: true
    }).test(url.pathname)) {
        return false;
    }
    return true;
}
function hasRemoteMatch(domains, remotePatterns, url) {
    return domains.some((domain)=>url.hostname === domain) || remotePatterns.some((p)=>matchRemotePattern(p, url));
} //# sourceMappingURL=match-remote-pattern.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/image-loader.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _findclosestquality = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/find-closest-quality.js [app-rsc] (ecmascript)");
function defaultLoader({ config, src, width, quality }) {
    if (src.startsWith('/') && src.includes('?') && config.localPatterns?.length === 1 && config.localPatterns[0].pathname === '**' && config.localPatterns[0].search === '') {
        throw Object.defineProperty(new Error(`Image with src "${src}" is using a query string which is not configured in images.localPatterns.` + `\nRead more: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`), "__NEXT_ERROR_CODE", {
            value: "E871",
            enumerable: false,
            configurable: true
        });
    }
    if ("TURBOPACK compile-time truthy", 1) {
        const missingValues = [];
        // these should always be provided but make sure they are
        if (!src) missingValues.push('src');
        if (!width) missingValues.push('width');
        if (missingValues.length > 0) {
            throw Object.defineProperty(new Error(`Next Image Optimization requires ${missingValues.join(', ')} to be provided. Make sure you pass them as props to the \`next/image\` component. Received: ${JSON.stringify({
                src,
                width,
                quality
            })}`), "__NEXT_ERROR_CODE", {
                value: "E188",
                enumerable: false,
                configurable: true
            });
        }
        if (src.startsWith('//')) {
            throw Object.defineProperty(new Error(`Failed to parse src "${src}" on \`next/image\`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)`), "__NEXT_ERROR_CODE", {
                value: "E360",
                enumerable: false,
                configurable: true
            });
        }
        if (src.startsWith('/') && config.localPatterns) {
            if ("TURBOPACK compile-time truthy", 1) {
                // We use dynamic require because this should only error in development
                const { hasLocalMatch } = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/match-local-pattern.js [app-rsc] (ecmascript)");
                if (!hasLocalMatch(config.localPatterns, src)) {
                    throw Object.defineProperty(new Error(`Invalid src prop (${src}) on \`next/image\` does not match \`images.localPatterns\` configured in your \`next.config.js\`\n` + `See more info: https://nextjs.org/docs/messages/next-image-unconfigured-localpatterns`), "__NEXT_ERROR_CODE", {
                        value: "E426",
                        enumerable: false,
                        configurable: true
                    });
                }
            }
        }
        if (!src.startsWith('/') && (config.domains || config.remotePatterns)) {
            let parsedSrc;
            try {
                parsedSrc = new URL(src);
            } catch (err) {
                console.error(err);
                throw Object.defineProperty(new Error(`Failed to parse src "${src}" on \`next/image\`, if using relative image it must start with a leading slash "/" or be an absolute URL (http:// or https://)`), "__NEXT_ERROR_CODE", {
                    value: "E63",
                    enumerable: false,
                    configurable: true
                });
            }
            if ("TURBOPACK compile-time truthy", 1) {
                // We use dynamic require because this should only error in development
                const { hasRemoteMatch } = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/match-remote-pattern.js [app-rsc] (ecmascript)");
                if (!hasRemoteMatch(config.domains, config.remotePatterns, parsedSrc)) {
                    throw Object.defineProperty(new Error(`Invalid src prop (${src}) on \`next/image\`, hostname "${parsedSrc.hostname}" is not configured under images in your \`next.config.js\`\n` + `See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host`), "__NEXT_ERROR_CODE", {
                        value: "E231",
                        enumerable: false,
                        configurable: true
                    });
                }
            }
        }
    }
    const q = (0, _findclosestquality.findClosestQuality)(quality, config);
    return `${config.path}?url=${encodeURIComponent(src)}&w=${width}&q=${q}${src.startsWith('/_next/static/media/') && ("TURBOPACK compile-time value", false) ? "TURBOPACK unreachable" : ''}`;
}
// We use this to determine if the import is the default loader
// or a custom loader defined by the user in next.config.js
defaultLoader.__next_img_default = true;
const _default = defaultLoader; //# sourceMappingURL=image-loader.js.map
}),
"[project]/eto-docs/node_modules/next/dist/shared/lib/image-external.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    default: null,
    getImageProps: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    default: function() {
        return _default;
    },
    getImageProps: function() {
        return getImageProps;
    }
});
const _interop_require_default = __turbopack_context__.r("[project]/eto-docs/node_modules/@swc/helpers/cjs/_interop_require_default.cjs [app-rsc] (ecmascript)");
const _getimgprops = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/get-img-props.js [app-rsc] (ecmascript)");
const _imagecomponent = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/client/image-component.js [app-rsc] (ecmascript)");
const _imageloader = /*#__PURE__*/ _interop_require_default._(__turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/image-loader.js [app-rsc] (ecmascript)"));
function getImageProps(imgProps) {
    const { props } = (0, _getimgprops.getImgProps)(imgProps, {
        defaultLoader: _imageloader.default,
        // This is replaced by webpack define plugin
        imgConf: ("TURBOPACK compile-time value", {
            "deviceSizes": ("TURBOPACK compile-time value", [
                ("TURBOPACK compile-time value", 640),
                ("TURBOPACK compile-time value", 750),
                ("TURBOPACK compile-time value", 828),
                ("TURBOPACK compile-time value", 1080),
                ("TURBOPACK compile-time value", 1200),
                ("TURBOPACK compile-time value", 1920),
                ("TURBOPACK compile-time value", 2048),
                ("TURBOPACK compile-time value", 3840)
            ]),
            "imageSizes": ("TURBOPACK compile-time value", [
                ("TURBOPACK compile-time value", 32),
                ("TURBOPACK compile-time value", 48),
                ("TURBOPACK compile-time value", 64),
                ("TURBOPACK compile-time value", 96),
                ("TURBOPACK compile-time value", 128),
                ("TURBOPACK compile-time value", 256),
                ("TURBOPACK compile-time value", 384)
            ]),
            "qualities": ("TURBOPACK compile-time value", [
                ("TURBOPACK compile-time value", 75)
            ]),
            "path": ("TURBOPACK compile-time value", "/_next/image"),
            "loader": ("TURBOPACK compile-time value", "default"),
            "dangerouslyAllowSVG": ("TURBOPACK compile-time value", false),
            "unoptimized": ("TURBOPACK compile-time value", false),
            "domains": ("TURBOPACK compile-time value", []),
            "remotePatterns": ("TURBOPACK compile-time value", []),
            "localPatterns": ("TURBOPACK compile-time value", [
                ("TURBOPACK compile-time value", {
                    "pathname": ("TURBOPACK compile-time value", "**"),
                    "search": ("TURBOPACK compile-time value", "")
                })
            ])
        })
    });
    // Normally we don't care about undefined props because we pass to JSX,
    // but this exported function could be used by the end user for anything
    // so we delete undefined props to clean it up a little.
    for (const [key, value] of Object.entries(props)){
        if (value === undefined) {
            delete props[key];
        }
    }
    return {
        props
    };
}
const _default = _imagecomponent.Image; //# sourceMappingURL=image-external.js.map
}),
"[project]/eto-docs/node_modules/next/image.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/eto-docs/node_modules/next/dist/shared/lib/image-external.js [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=6a97c_6ef64603._.js.map