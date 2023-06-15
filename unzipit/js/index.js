

import("../pkg/index.js").then(module => {


    function init() { 


        const dragDropArea = document.getElementById("drag-drop-area");
        const fileInput = document.createElement('input');
        const fileListArea = document.getElementById("file-list-area");


        function createFileNameLink(data, file_name) {
            let a = document.createElement('a');
            a.classList.add("download-link")
            a.innerText = file_name;

            a.addEventListener('click', async  event => {

                a.classList.add("downloading");
                document.body.classList.add("in-progress");

                // give the UI a chance to update
                await new Promise(resolve => setTimeout(resolve, 0));
                
                let objectUrl = null;
                let tempLink = null;
                
                new Promise((resolve,reject) => {
                    try {
                        // TODO: workerify this by putting unzip_file in a worker, and sending the .buffer property back to the UI (which is an ArrayBuffer, which doesn't copy)
                        // find a way to send the file without copying, either.
                        
                        const f = module.unzip_file(data, file_name);   
                        const file_bytes = f.file_bytes;
                        const blob = new Blob([file_bytes], { type: 'application/octet-stream' });
                        objectUrl = URL.createObjectURL(blob);
                        tempLink = document.createElement('a');
                        tempLink.href = objectUrl;
                        tempLink.download = file_name;
                        document.body.appendChild(tempLink);
                        tempLink.click();        
                        resolve();
                    }
                    catch (reason) {
                        reject(reason)
                    }
                }).finally(() => {
                    
                    a.classList.remove("downloading");
                    document.body.classList.remove("in-progress");
                    a.classList.add("downloaded");
                    
                    if (tempLink) {
                        document.body.removeChild(tempLink);
                    }
                    
                    if (objectUrl) {
                        URL.revokeObjectURL(objectUrl);
                    }
                })


            })
            a.href = "javascript:void(0);";
            const li = document.createElement('li');
            li.appendChild(a);
            return li;
        }
        
        function render_file_names(data, directory) {
            for (const file_name of directory.file_names) {
                console.log(file_name + " - listed");
                const link = createFileNameLink(data, file_name);
                fileListArea.appendChild(link);
            }
        }

        function readZipFile(file) {
    
    
            if (!file) {
                return;
            }
    
            const progressBar = document.getElementById('progressBar');
            
            const zipFileReader = new FileReader();
    
            zipFileReader.onload = function (event) {

                let data = new Uint8Array(event.target.result);

                const directory = module.list_files(data);

                render_file_names(data, directory);
            };
    
            zipFileReader.onloadstart = function () {
                document.body.classList.add("in-progress");
                progressBar.style.display = "";
                progressBar.value = 0;
                fileListArea.innerHTML = "";
            };
    
            zipFileReader.onerror = function () {
                // some kind of error handling
                document.body.classList.remove("in-progress");
                console.error('Error occurred while reading the file');
            };
    
            zipFileReader.onloadend = function () {
                document.body.classList.remove("in-progress");
                progressBar.value = 100;
                progressBar.style.display = "none";
            };
    
            zipFileReader.onprogress = function (event) {
                if (event.lengthComputable) {
                const percentLoaded = (event.loaded / event.total) * 100;
                progressBar.value = percentLoaded;
                }
            };
    
            zipFileReader.readAsArrayBuffer(file);
            
        }
    
        function handleZipFileDrop(event) {
            event.preventDefault();
            event.stopPropagation();
    
            const files = event.dataTransfer.files;
            // Process the files here
            handleZipFiles(files);
        }
    
        function handleZipFileSelect(event) {
            event.preventDefault();
            event.stopPropagation();
    
            const files = event.target.files;
                // Process the files here
            handleZipFiles(files);
        }        
    
        function handleZipFiles(files) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Upload the file or perform other operations
                readZipFile(file);
            }
        }        
    

    
        dragDropArea.addEventListener('dragover', function (event) {
            event.preventDefault();
            event.stopPropagation();
            dragDropArea.classList.add('dragging');
        });
    
        dragDropArea.addEventListener('dragleave', function (event) {
            event.preventDefault();
            event.stopPropagation();
            dragDropArea.classList.remove('dragging');
        });
    

        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('multiple', 'multiple');
        fileInput.style.display = 'none';
    
    
        dragDropArea.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            fileInput.click();
        });
    
        fileInput.addEventListener('change', handleZipFileSelect);        
        dragDropArea.addEventListener('drop', handleZipFileDrop);
    
    
    }
    

    if (document.readyState === "loading") {
        // Loading hasn't finished yet
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    
}).catch(console.error);


