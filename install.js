const { DownloaderHelper } = require('node-downloader-helper');
const cliProgress = require('cli-progress');
const Seven = require('node-7z');
const path = require('path');
const sevenBin = require('7zip-bin');
const fs = require('fs');
const tmp = require('tmp');
const os = require('os');

if (os.platform() !== 'win32') {
  console.error('Can only install on Windows');
  process.exit();
}

const tempPath = tmp.dirSync().name;
const tarGzName = 'meteor.tar.gz';
const tarName = 'meteor.tar';
const localAppData = process.env.LOCALAPPDATA;
const meteorLocalFolder = '.meteor-z'
const meteorPath = path.resolve(localAppData, meteorLocalFolder);

if (fs.existsSync(meteorPath)) {
  console.log('Meteor is already installed at', meteorPath);
  console.log('If you want to reinstall, delete that folder and run this command again');
  process.exit();
}

download();

function download() {
  const start = Date.now();
  const downloadProgress = new cliProgress.SingleBar({
    format: 'Downloading |{bar}| {percentage}%',
    clearOnComplete: true,
  }, cliProgress.Presets.shades_classic);
  downloadProgress.start(100, 0);
  
  const url = `https://packages.meteor.com/bootstrap-link?arch=os.windows.x86_64`
  const dl = new DownloaderHelper(url, tempPath, {
    retry: { maxRetries: 5, delay: 5000 },
    override: true,
    fileName: tarGzName
  });

  dl.on('progress', ({ progress }) => {
    downloadProgress.update(progress)
  });
  dl.on('end', () => {
    downloadProgress.update(100);
    downloadProgress.stop();
    const end = Date.now();
    console.log(`=> Meteor Downloaded in ${(end - start) / 1000}s`);

    const exists = fs.existsSync(path.resolve(tempPath, tarGzName))
    if (!exists) {
      throw new Error('meteor.tar.gz does not exist');
    }

    decompress();
  });

  dl.start();
}

function decompress() {
  const start = Date.now();
  const decompressProgress = new cliProgress.SingleBar({
    format: 'Decompressing |{bar}| {percentage}%',
    clearOnComplete: true,
  }, cliProgress.Presets.shades_classic);
  decompressProgress.start(100, 0);

  const myStream = Seven.extract(path.resolve(tempPath, tarGzName), tempPath, {
    $progress: true,
    $bin: sevenBin.path7za,
  });
  myStream.on('progress', function (progress) {
    decompressProgress.update(progress.percent)
  });

  myStream.on('end', function () {
    decompressProgress.update(100);
    decompressProgress.stop();
    const end = Date.now();
    console.log(`=> Meteor Decompressed in ${(end - start) / 1000}s`);

    extract();
  });
}

function extract() {
  const start = Date.now();
  const decompressProgress = new cliProgress.SingleBar({
    format: 'Extracting |{bar}| {percentage}% - {fileCount} files completed',
    clearOnComplete: true,
  }, cliProgress.Presets.shades_classic);
  decompressProgress.start(100, 0, {
    fileCount: 0
  });

  const myStream = Seven.extractFull(path.resolve(tempPath, tarName), meteorPath, {
    $progress: true,
    $bin: sevenBin.path7za,
  });
  myStream.on('progress', function (progress) {
    decompressProgress.update(progress.percent, { fileCount: progress.fileCount});
  });

  myStream.on('end', function () {
    decompressProgress.stop();
    const end = Date.now();
    console.log(`=> Meteor Extracted ${(end - start) / 1000}s`);

    showGettingStarted();
  });
}

function showGettingStarted() {
  const message = `
***************************************

Meteor has been installed!

To get started fast:

  $ meteor create ~/my_cool_app
  $ cd ~/my_cool_app
  $ meteor

Or see the docs at:

  https://docs.meteor.com

***************************************
  `;

  console.log(message);
}
