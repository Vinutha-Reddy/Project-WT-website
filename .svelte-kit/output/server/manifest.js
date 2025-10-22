export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.C4XnSCHr.js",app:"_app/immutable/entry/app.ZlzK4isr.js",imports:["_app/immutable/entry/start.C4XnSCHr.js","_app/immutable/chunks/CDlpKSKl.js","_app/immutable/chunks/gWJGF_Na.js","_app/immutable/chunks/C7PAPsRm.js","_app/immutable/entry/app.ZlzK4isr.js","_app/immutable/chunks/gWJGF_Na.js","_app/immutable/chunks/IHki7fMi.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/responses",
				pattern: /^\/api\/responses\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/responses/_server.js'))
			},
			{
				id: "/api/summary",
				pattern: /^\/api\/summary\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/summary/_server.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
