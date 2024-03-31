const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const gm = require('gm')
.subClass({ imageMagick: true });


class FFMPEG {
    /**
    * 
    * @param {Object} option -  Options
    * @param {Function} cb -  callback function gives progress, error , success
    * @Example 
    * ```
    *FFMPEG.CompressVideoByBitrate({
    *inputFile,
    *outputFile,
     compressionOptions : {
         videoBitrate : HelperFfmpeg.bitrate240p,
         audioBitrate : '128k'
     }
     } , (e) => console.log(e))
    ```
    */
    CompressVideoByBitrate(option = {
        inputFile: '',
        outputFile: '',
        compressionOptions: {
            videoBitrate: '500k',
            audioBitrate: '128k',
        }
    }, cb = () => console.log('Nothing Here')) {


        const command = ffmpeg(option.inputFile)
            .videoBitrate(option.compressionOptions.videoBitrate)
            .audioBitrate(option.compressionOptions.audioBitrate)
            .output(option.outputFile)
            .on('progress', (progress) => {
                cb({
                    type: 'progress',
                    progress
                })
                console.log('Processing: ' + progress.percent + '% done');
            });

        command
            .on('end', () => {
                cb({
                    type: 'end'
                })
                console.log('Video compression complete');
            })
            .on('error', (err) => {
                cb({
                    type: 'error',
                    error: err
                })
                console.error('Error compressing video:', err);
            })
            .run();
    }
    CompressVideoByPerc(inputFile, outputFile, compressionPercentage, progressCallback) {
        return new Promise((resolve, reject) => {
            // Get the original video bitrate
            ffmpeg.ffprobe(inputFile, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }

                const originalBitrate = metadata.format.bit_rate;

                // Calculate the desired bitrate based on the compression percentage
                const desiredBitrate = Math.round(originalBitrate * (compressionPercentage / 100));

                // Create the FFmpeg command
                const command = ffmpeg(inputFile)
                    .videoBitrate(desiredBitrate)
                    .output(outputFile)
                    .on('progress', (progress) => {
                        if (progressCallback && typeof progressCallback === 'function') {
                            progressCallback(progress.percent);
                        }
                    });

                // Run the FFmpeg command
                command
                    .on('end', () => {
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    })
                    .run();
            });
        });
    }
    captureScreenshot(inputFile, outfolder, time, filename = 'thumbnail-at-%s-seconds.png', size = '320x240') {
        ffmpeg(inputFile)
            .screenshots({
                size,
                filename,
                timestamps: [time],
                folder: outfolder,
            })
    }
    /**
    * 
    * @param {string} videoPath -  Video file exact path
    * @param {string} outfile -  Output Exact Path
    * @param {number} startTime -  start time in seconds
    * @param {number} durations - Trim duration in number
    * @Example 
    * ```
    *FFMPEG.trimVideo(inputFile , './demo/trimmed.mp4' , 120, 10)
    ```
    */
    trimVideo(videoPath, outfile, startTime, durations, cb) {
        ffmpeg(videoPath)
            .setStartTime(startTime)
            .setDuration(durations)
            .on("start", function (commandLine) {
                console.log("Spawned FFmpeg with command: " + commandLine);
            })
            .on("error", function (err) {
                cb({
                    type: 'error',
                    error: err
                })
                console.log("error: ", +err);
            })
            .on("end", function (err) {
                if (!err) {
                    cb({
                        type: 'end',
                    })
                    console.log("conversion Done");
                }
            })
            .saveToFile(outfile);
    }
    /**
     * 
     * @param {Object} options 
     * @param {function} cb
     * @example
     * ```
     * FFMPEG.video2Gif({
        videoPath : inputFile, 
        outfile : './demo/trimmed.gif' ,
        width : '1280',
        fps :  '24' ,
        startTime : 50,
        duration : 15
        } ,console.log)
     * ``` 
     */
    video2Gif(options = {
        videoPath: '',
        outfile: '',
        width: '320',
        fps: '15',
        startTime: 10,
        duration: 5
    }, cb) {

        ffmpeg(options.videoPath)
            .setStartTime(options.startTime)
            .setDuration(options.duration)
            .outputOption('-vf', `scale=${options.width}:-1:flags=lanczos,fps=${options.fps}`)
            .save(options.outfile)
            .on('end', () => {
                console.log('Converted To Gif');
                cb({
                    type: 'end'
                })
            })
            .on('error', (err) => {
                console.error('Error processing video:', err);
                cb({
                    type: 'error',
                    error: err
                })
            });
    }
    compressImage(inputfile, outfile, cb) {
        ffmpeg(inputfile)
            .outputOptions('-vf', 'scale=800:-1')
            .output(outfile)
            .on('end', () => {
                cb({
                    type: 'end',
                    message : 'Image compression complete'
                })
                console.log('Image compression complete');
            })
            .on('error', (err) => {
                cb({
                    type: 'error',
                    error: err.message
                })
              
            })
            
            .run();
    }
    imageRemoveBg(inputfile, outfile, cb) {
        gm(inputfile)
        .transparent('white')
        .write(outfile, (err) => {
          if (err) {
            console.error('Error removing background:', err);
          } else {
            console.log('Background removed successfully');
          }
        });
    }
}



module.exports = new FFMPEG()
