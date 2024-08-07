import fs from "fs";

const repoName = "Origami";

const regex = /\*(\s*)\@linkcode.*/g;

const processFile = (path) => {
	// console.log("checking file", path);
	const contents = fs.readFileSync(path, "utf8");
	const matches = contents.match(regex);
	if (!matches) {
		return;
	}
	const lineNumbers = contents
		.split(/\r?\n/)
		.map((line, i) => (line.match(regex) !== null ? i : undefined))
		.filter((a) => a !== undefined)
		.map((num) => num + 1); // line numbers start with 1
	if (matches.length !== lineNumbers.length) {
		console.log("unexpected error! the lengths of matches don't equal");
		return;
	}
	const values = lineNumbers.map((num) => `${repoName} ${path} ${num}`);
	const lines = values.map((value) => `* @linkcode ${value}`);

	let count = 0;
	const fn = () => lines[count++];
	const modified = contents.replace(regex, fn);
	fs.writeFileSync(path, modified);

	// console.log(`modified ${path} with ${matches.length} line number entries`);
};

const searchDir = (path) => {
	const contents = fs.readdirSync(path, { withFileTypes: true });
	const files = contents.filter((el) => el.isFile());
	const directories = contents.filter((el) => el.isDirectory());
	// console.log("checking dir", path);
	// console.log("files", files);
	// console.log("directories", directories);
	files.forEach((el) => processFile(`${path}/${el.name}`));
	directories.forEach((el) => searchDir(`${path}/${el.name}`));
};

searchDir("./src");
