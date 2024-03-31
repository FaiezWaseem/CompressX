const downloadFolder = require('downloads-folder');
const path = require('path')
const directoryPath = path.join(downloadFolder(), 'compressx');

class HelperFfmpeg {
    static bitrate240p = "350k";
    static bitrate360p = "700k";
    static bitrate480p = "1200k";
    static bitrate720p = "2500k";
    static bitrate1080p = "5000k";

    static getSavePath(options, file , filename) {
        const type = options.videoOptions.outFolder;
        if (type === 'downloads') {
            return path.join(directoryPath, filename)
        } else {
            return path.join(path.dirname(file), filename);
        }
    }
}


module.exports = HelperFfmpeg;