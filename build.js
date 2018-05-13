const fs = require('fs'),
	crypto = require('crypto');

process.chdir(__dirname);

let distDir = 'dist';
distDir = distDir.replace(/[\/\\]$/, '') + '/';

function cleanDir(dir, isRoot) {
	let dirContent;
	try {
		dirContent = fs.readdirSync(dir);
	}
	catch (err) {
		if (err.code != 'ENOENT') {
			throw err;
		}
		return false;
	}
	for (const entry of dirContent) {
		const entryPath = dir + entry;
		const stat = fs.statSync(entryPath);
		if (stat.isFile()) {
			fs.unlinkSync(entryPath);
		}
		else {
			cleanDir(entryPath + '/', false);
		}
	}
	if (!isRoot) {
		fs.rmdirSync(dir);
	}
	return isRoot;
}
try {
	if (!cleanDir(distDir, true)) {
		fs.mkdirSync(distDir);
	}
}
catch (err) {
	console.error(err.message);
	process.exit();
}


const jsOut = '!function() {\n'
		+ fs.readFileSync('./lib/jsutil/jsutil.js', 'utf8')
		+ fs.readFileSync('./src/func.js', 'utf8')
		+ '}()',
	jsHash = crypto.createHash('sha1'),
	jsRegex = new RegExp('\\bbundle.js\\b', 'g');
jsHash.update(jsOut, 'utf8');
const jsDest = 'bundle.' + jsHash.digest('hex').slice(0, 10) + '.js';
fs.writeFileSync(distDir + jsDest, jsOut);
console.log(`${jsDest}: ${jsOut.length}`);

const imgdSource = 'img-d.png',
	imgdHash = crypto.createHash('sha1'),
	imgdOut = fs.readFileSync('./img/' + imgdSource),
	imgdRegex = new RegExp('\\b' + imgdSource + '\\b', 'g');
imgdHash.update(imgdOut);
const imgdDest = 'img-d.' + imgdHash.digest('hex').slice(0, 10) + '.png';
fs.writeFileSync(distDir + imgdDest, imgdOut);
console.log(`${imgdDest}: ${imgdOut.length}`);

const imglSource = 'img-l.png',
	imglHash = crypto.createHash('sha1'),
	imglOut = fs.readFileSync('./img/' + imglSource),
	imglRegex = new RegExp('\\b' + imglSource + '\\b', 'g');
imglHash.update(imglOut);
const imglDest = 'img-l.' + imglHash.digest('hex').slice(0, 10) + '.png';
fs.writeFileSync(distDir + imglDest, imglOut);
console.log(`${imglDest}: ${imglOut.length}`);

const cssSource = 'style.css',
	cssHash = crypto.createHash('sha1'),
	cssOut = fs.readFileSync('./src/' + cssSource, 'utf8')
		.replace(imgdRegex, imgdDest)
		.replace(imglRegex, imglDest),
	cssRegex = new RegExp('\\b' + cssSource + '\\b', 'g');
cssHash.update(cssOut);
const cssDest = 'style.' + cssHash.digest('hex').slice(0, 10) + '.css';
fs.writeFileSync(distDir + cssDest, cssOut);
console.log(`${cssDest}: ${cssOut.length}`);

const htmlOut = fs.readFileSync('./src/index.html', 'utf8')
	.replace(jsRegex, jsDest)
	.replace(cssRegex, cssDest)
	.replace(/>\s+</g, '><');
fs.writeFileSync(distDir + 'index.html', htmlOut);
console.log(`index.html: ${htmlOut.length}`);
