const fs = require('fs'),
	crypto = require('crypto');

let sass;

try {
	sass = require('sass/sass.dart');
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

const imgDarkHash = crypto.createHash('sha1'),
	imgDarkOut = fs.readFileSync('./img/img-dark.png'),
	imgDarkRegex = new RegExp('\\bimg-dark.png\\b', 'g');
imgDarkHash.update(imgDarkOut);
const imgDarkDest = 'img-dark.' + imgDarkHash.digest('hex').slice(0, 10) + '.png';
fs.writeFileSync(distDir + imgDarkDest, imgDarkOut);
console.log(`${imgDarkDest}: ${imgDarkOut.length}`);

const imgBrightHash = crypto.createHash('sha1'),
	imgBrightOut = fs.readFileSync('./img/img-bright.png'),
	imgBrightRegex = new RegExp('\\bimg-bright.png\\b', 'g');
imgBrightHash.update(imgBrightOut);
const imgBrightDest = 'img-bright.' + imgBrightHash.digest('hex').slice(0, 10) + '.png';
fs.writeFileSync(distDir + imgBrightDest, imgBrightOut);
console.log(`${imgBrightDest}: ${imgBrightOut.length}`);

const imgGoldHash = crypto.createHash('sha1'),
	imgGoldOut = fs.readFileSync('./img/img-gold.png'),
	imgGoldRegex = new RegExp('\\bimg-gold.png\\b', 'g');
imgGoldHash.update(imgBrightOut);
const imgGoldDest = 'img-gold.' + imgGoldHash.digest('hex').slice(0, 10) + '.png';
fs.writeFileSync(distDir + imgGoldDest, imgGoldOut);
console.log(`${imgGoldDest}: ${imgGoldOut.length}`);

const cssHash = crypto.createHash('sha1'),
	cssOut = sass.renderSync({file: './src/style.scss', outputStyle: 'compressed'})
		.css
		.toString('utf8')
		.replace(imgDarkRegex, imgDarkDest)
		.replace(imgBrightRegex, imgBrightDest)
		.replace(imgGoldRegex, imgGoldDest),
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
