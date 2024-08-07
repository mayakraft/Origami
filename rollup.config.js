import cleanup from "rollup-plugin-cleanup";
import terser from "@rollup/plugin-terser";

const version = "0.9.4 alpha 2024-04-20";
const input = "src/index.js";
const name = "ear";
const banner = `/* Rabbit Ear ${version} (c) Kraft, GNU GPLv3 License */\n`;

const minifiedUMD = {
	input,
	output: {
		name,
		file: "rabbit-ear.js",
		format: "umd",
		banner,
	},
	plugins: [
		cleanup(),
		terser({
			keep_fnames: true,
			format: {
				comments: "all",
			},
		}),
	],
};

const moduleFolder = {
	input,
	output: {
		name,
		dir: "module/",
		format: "es",
		banner,
		preserveModules: true,
		generatedCode: {
			constBindings: true,
			objectShorthand: true,
		},
		// sourcemap: true,
	},
	plugins: [cleanup()],
};

// const commonJS = {
// 	input,
// 	output: {
// 		name,
// 		file: "rabbit-ear.js",
// 		format: "cjs",
// 		banner,
// 	},
// };

// const umd = {
// 	input,
// 	output: {
// 		name,
// 		file: "rabbit-ear.js",
// 		format: "umd",
// 		banner,
// 		compact: true,
// 		generatedCode: {
// 			constBindings: true,
// 			objectShorthand: true,
// 		},
// 	},
// 	plugins: [
// 		cleanup(),
// 		terser({
// 			keep_fnames: true,
// 			format: {
// 				comments: false,
// 			},
// 		}),
// 	],
// };

// const moduleFile = {
// 	input,
// 	output: {
// 		name,
// 		file: "rabbit-ear.module.js",
// 		format: "es",
// 		banner,
// 		compact: true,
// 		generatedCode: {
// 			constBindings: true,
// 			objectShorthand: true,
// 		},
// 		// sourcemap: true,
// 	},
// 	plugins: [
// 		cleanup(),
// 		terser({ compress: false, format: { comments: false } }),
// 	],
// };

export default [minifiedUMD, moduleFolder];
// export default [minifiedUMD];
