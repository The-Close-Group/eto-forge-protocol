module.exports = [
"[externals]/fs/promises [external] (fs/promises, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[externals]_fs_promises_0bfe4114._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/fs/promises [external] (fs/promises, cjs)");
    });
});
}),
"[project]/eto-docs/node_modules/next/dist/compiled/react-dom/server.edge.js [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/6a97c_next_dist_compiled_30174131._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/eto-docs/node_modules/next/dist/compiled/react-dom/server.edge.js [app-rsc] (ecmascript)");
    });
});
}),
];