const fileContainer = document.getElementById('fileContainer')
let filePlaceholder = document.getElementById('file-select')
const DropdownOutFolder = document.getElementById('OutFolder')
const DropdownVideoBitrate = document.getElementById('VideoBitrate')
const filelist = document.getElementById('filelist')
const tempfilePlaceholder = filePlaceholder.cloneNode(true)
const compressBtn = document.getElementById('compress')
const clearBtn = document.getElementById('clear')
const convertercontainer = document.getElementById('converter-container')
const progressList = document.getElementById('progress-list')
const selectFile = document.getElementById('selectFile')

let selectedFiles = []


const videoOptions = {
    videoBitrate: "700k",
    outFolder: 'downloads'
}

compressBtn.disabled = true

window.api.receive('fromMain', (message) => {
    const m = JSON.parse(message);

    console.log(m)

    if (m.type === 'compressing') {
        if (m.status.type === 'end') {
            document.getElementById(`pbar_${m.status.index}`).style.width = '100%'
            document.getElementById(`pbar_${m.status.index}`).innerText = '100%'
            console.log('compressing end')
            compressBtn.disabled = false
        }
        if (m.status.type === 'progress') {
            document.getElementById(`pbar_${m.status.index}`).innerText = `${m.status.percentage.toFixed(2)}%`
            document.getElementById(`pbar_${m.status.index}`).style.width = `${m.status.percentage.toFixed(2)}%`
            console.log(`compressing progress :  ${m.status.percentage.toFixed(2)}%`)
        }
    }
})


DropdownOutFolder.addEventListener('change', (e) => {
    videoOptions.outFolder = e.target.value
})
DropdownVideoBitrate.addEventListener('change', (e) => {
    videoOptions.videoBitrate = e.target.value
})
compressBtn.addEventListener('click', () => {
    compress()
    compressBtn.disabled = true
})
clearBtn.addEventListener('click', function () {
    selectedFiles = []
    filelist.innerHTML = ''
    filePlaceholder = tempfilePlaceholder;
    filePlaceholder.style.display = 'flex'
    compressBtn.disabled = true
})

selectFile.addEventListener('click', function () {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true;
    input.click()

    input.onchange = () => {
        for (const f of input.files) {
            if (valideFile(f)) {
                console.log('File Path of dragged files: ', f.path)
                selectedFiles.push(f.path)
            }
        }
        compressBtn.disabled = false
        showFiles()
    }
})

document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log(event.dataTransfer.files)

    for (const f of event.dataTransfer.files) {
        if (valideFile(f)) {
            console.log('File Path of dragged files: ', f.path)
            selectedFiles.push(f.path)
        }
    }
    console.log(selectedFiles)
    compressBtn.disabled = false
    showFiles()
});

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
    console.log('File is in the Drop Space');
    fileContainer.style.border = '3px dashed #000'
});

document.addEventListener('dragleave', (event) => {
    console.log('File has left the Drop Space');
    fileContainer.style.border = 'none'
});



function showFiles() {
    if (selectedFiles.length > 0) {
        filePlaceholder.remove()
        filelist.innerHTML = ''
        selectedFiles.forEach((file, index) => {

          const  card = `
                <div class="card bg-dark text-white">
                ${ValidImage(file) ?
                    
                    ` <img src="${file}" class="card-img" alt="Stony Beach"/>` :
                    `<video src="${file}" auto loop class="card-img opacity-75" alt="..." controls></video>`
                }
                   
                    <div class="card-img-overlay">
                        <p class="card-text">${file.split('\\').pop()}</p>
                    </div>
                    </div>
                
                `

            filelist.innerHTML += (card)
        })
    }
}

function compress() {
    window.api.send('toMain', { selectedFiles, videoOptions })
    convertercontainer.style.visibility = 'visible'
    progressList.innerHTML = ``
    selectedFiles.map((file, index) => {
        const filename = file.split('\\').pop()
        progressList.innerHTML += `
         <li class="list-group-item">
            <div class="row">
               <div class="col-3">File : </div>
               <div class="col-9">${filename}</div>
            </div>
            </li>
         <div class="progress my-2" role="progressbar" aria-label="Example with label" aria-valuenow="0"
             aria-valuemin="0" aria-valuemax="100">
           <div class="progress-bar" id="pbar_${index}" style="width: 0%">0%</div>
           </div>  
        `
    })
}

function valideFile(file) {
    const filename = file.path;
    const ext = filename.split('.').pop()
    const images = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG', 'gif']
    const videos = ['mp4', 'mov', 'avi', 'MP4', 'MOV', 'AVI']

    if (images.includes(ext)) {
        return true
    }

    if (videos.includes(ext)) {
        return true
    }
    return false
}
function ValidImage(file) {
    const filename = file;
    const ext = filename.split('.').pop()
    const images = ['png', 'jpg', 'jpeg', 'PNG', 'JPG', 'JPEG', 'gif']

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

