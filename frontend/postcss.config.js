// moved to postcss.config.cjs (CommonJS) due to ESM package type
// This file is intentionally left as a shim in case of stale imports.
module.exports = {
	plugins: {
		tailwindcss: {},
		autoprefixer: {},
	},
};
