let { app, BrowserWindow, ipcMain , Notification } = require("electron")
const downloadFolder = require('downloads-folder');
const fs = require('fs');
const path = require('path')
const ffmpeg = require('fluent-ffmpeg');
const CompressImage = require('./ffmpeg/SharpImageCompression')
const FFMPEG = require('./ffmpeg/FFMPEG')
const HelperFfmpeg = require('./ffmpeg/HelperFFMPEG')

console.log(process.resourcesPath)
console.log(process.resourceUsage)

const ffmpegPath = path.resolve(path.join(getBinariesPath(), './ffmpeg'));
//Get the paths to the packaged versions of the binaries we want to use
// const ffmpegPath = require('ffmpeg-static').replace(
//   'app.asar',
//   'app.asar.unpacked'
// );
// const ffprobePath = require('ffprobe-static').path.replace(
//   'app.asar',
//   'app.asar.unpacked'
// );

console.log(ffmpegPath)

ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath);



const directoryPath = path.join(downloadFolder(), 'compressx');

if (fs.existsSync(directoryPath)) {
  console.log('Directory already exists.');
} else {
  fs.mkdirSync(directoryPath);
  console.log('Directory created.');
}


if (require('electron-squirrel-startup')) {
  app.quit();
}


function createWindow() {
  let win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  })
  win.loadFile(__dirname + "/src/index.html")

  // win.webContents.openDevTools();
  

  
  ipcMain.on("toMain", async (event, args) => {
    const message = JSON.parse(args)

    const { selectedFiles , videoOptions } = message;

  
   

    if (selectedFiles) {
      console.log(selectedFiles)
      const files = selectedFiles;
      files.forEach((file, index) => {
        const filename = file.split('\\').pop()
        if (ValidImage(file)) {
          const outPath = HelperFfmpeg.getSavePath(message , file , `compressed_${filename}`);

          CompressImage.compress(file, outPath, (e) => {
            if (e.type === 'end') {
              showNotification('Image Compression Completed', `Your image  ${filename} has been compressed successfully`)
              win.webContents.send("fromMain", JSON.stringify({
                type: 'compressing',
                status: {
                  type: 'end',
                  index
                }
              }))
            }
          })
        } else if (ValidVideo(file)) {
 
          const outPath = HelperFfmpeg.getSavePath(message , file , `compressed_${videoOptions.videoBitrate}_${filename}`);
          FFMPEG.CompressVideoByBitrate({
            inputFile: file,
            outputFile: outPath,
            compressionOptions: {
              videoBitrate: videoOptions.videoBitrate,
              audioBitrate: '128k'
            }
          }, (e) => {
            if (e.type === 'end') {
              showNotification('Video Compression Completed', `Your video  ${filename} has been compressed successfully`)
              win.webContents.send("fromMain", JSON.stringify({
                type: 'compressing',
                status: {
                  type: 'end',
                  index
                }
              }))
            } else if (e.type === 'progress') {
              win.webContents.send("fromMain", JSON.stringify({
                type: 'compressing',
                status: {
                  type: 'progress',
                  index,
                  percentage: e.progress.percent
                }
              }))
            }
          });
        }
      })
    }
  })

}



app.on("ready", createWindow)

app.on("window-all-closed", () => {
  app.quit()
})


function ValidImage(file) {
  const filename = file;
  const ext = filename.split('.').pop()
  const images = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG','gif']

  if (images.includes(ext)) {
    return true
  }
  return false
}
function ValidVideo(file) {
  const filename = file;
  const ext = filename.split('.').pop()
  const videos = ['mp4', 'mov', 'avi', 'MP4', 'MOV', 'AVI']

  if (videos.includes(ext)) {
    return true
  }
  return false
}
function showNotification (NOTIFICATION_TITLE , NOTIFICATION_BODY) {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

 function getBinariesPath() {
  const IS_PROD = process.env.NODE_ENV === 'production';
  const { isPackaged } = app;

  const binariesPath =
    IS_PROD && isPackaged
      ? path.join(process.resourcesPath, './bin')
      : path.join(app.getAppPath(), 'resources','win');

  return binariesPath;
}
