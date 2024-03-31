const sharp = require('sharp')

class CompressImage {
    compress(filePath, outputPath, callback) {

        const extension = filePath.split('.').pop();

        if (extension === 'jpg' || extension === 'jpeg') {
            sharp(filePath)
                .jpeg({  mozjpeg: true, quality : 60 })
                .toFile(outputPath)
                .then(function () {
                    console.log('Image created successfully')
                    callback({ type: 'end' })
                })
                .catch(function (err) {
                    callback({ type: 'error', message: err })
                })
        }
        else if (extension === 'png') {
            sharp(filePath)
                .png({ compressionLevel: 9, quality: 80 })
                .toFile(outputPath)
                .then(function () {
                    console.log('Image created successfully')
                    callback({ type: 'end' })
                })
                .catch(function (err) {
                    console.log(err)
                    callback({ type: 'error', message: err })
                })
        } else if (extension === 'gif') {
            sharp(filePath)
                .gif()
                .toFile(outputPath)
                .then(function () {
                    console.log('Image created successfully')
                    callback({ type: 'end' })
                })
                .catch(function (err) {
                    console.log(err)
                    callback({ type: 'error', message: err })
                })
        }
    }
}


module.exports = new CompressImage();