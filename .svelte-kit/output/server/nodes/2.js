

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/2.qxeTnI5i.js","_app/immutable/chunks/gWJGF_Na.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/C7PAPsRm.js"];
export const stylesheets = [];
export const fonts = [];
