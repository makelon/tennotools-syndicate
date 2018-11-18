const fs = require('fs'),
	crypto = require('crypto');

let sass;

try {
	sassPath = require.resolve('sass/sass.dart');
	sass = require(sassPath);
}
catch (err) {
	console.error('SASS not found');
	process.exit();
}

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

let cssOut = sass.renderSync({file: './src/style.scss', outputStyle: 'compressed'})
	.css
	.toString('utf8');

for (const theme of ['dark', 'bright', 'gold', 'neon']) {
	const imgHash = crypto.createHash('sha1'),
		imgOut = fs.readFileSync(`./img/img-${theme}.png`),
		imgRegex = new RegExp(`\\bimg-${theme}.png\\b`, 'g');
	imgHash.update(imgOut);
	const imgDest = `img-${theme}.${imgHash.digest('hex').slice(0, 10)}.png`;
	fs.writeFileSync(distDir + imgDest, imgOut);
	console.log(`${imgDest}: ${imgOut.length}`);
	cssOut = cssOut.replace(imgRegex, imgDest);
}

const cssHash = crypto.createHash('sha1'),
	cssRegex = new RegExp('\\bstyle.css\\b', 'g');
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
