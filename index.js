// Register the plugin
FilePond.registerPlugin(FilePondPluginImagePreview);
FilePond.registerPlugin(FilePondPluginImageExifOrientation);
FilePond.registerPlugin(FilePondPluginImageValidateSize);
FilePond.registerPlugin(FilePondPluginFileValidateSize);
FilePond.registerPlugin(FilePondPluginImageEdit);

// We want to preview images, so we register
// the Image Preview plugin, We also register 
// exif orientation (to correct mobile image
// orientation) and size validation, to prevent
// large files from being added
FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageExifOrientation,
    FilePondPluginFileValidateSize,
    FilePondPluginImageEdit
);

// Select the file input and use 
// create() to turn it into a pond
const pond = FilePond.create(
    document.querySelector('input')
);

pond.labelIdle = `Drag & Drop 📱 screenshots<br />
     or <span class="filepond--label-action">Browse</span><br />
     <span class="show-demo">or <a onclick="event.preventDefault(); demo()">Show a demo</a><span>`;

document.addEventListener('FilePond:updatefiles', () => {
    generate();
});

document.addEventListener('FilePond:reorderfiles', () => {
    generate();
});

function generate() {
    if (!FileReader) {
        alert('FileReader is not supported by your browser');
        return;
    }

    const files = pond.getFiles();

    const images = document.querySelectorAll('.mockups img.placeholder');
    images.forEach((img, index) => {
        const file = files[index % files.length];
        if (!file) {
            img.src = 'data:,';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            img.src = reader.result;
        }
        reader.readAsDataURL(file.file);
    });

    document.body.classList.toggle('generated', files.length > 0);
}

function on(event, elem, selector, handler) {
    elem.addEventListener(event, (...args) => {
        const e = args[0]
        const target = e.target.closest(selector);
        if (target) {
            handler.apply(target, args);
        }
    })
}

on('click', window, 'button.download', async (e) => {
    e.preventDefault();
    const mockup = e.target.closest('.mockup');
    const element = mockup.querySelector('.mockup-image');
    const options = {
        /*
        width: 400,
        height: 300,
        canvasWidth: 400,
        canvasHeight: 300,
        */
        cacheBust: true,
    };

    mockup.classList.add("loading");
    try {

        let dataUrl = await htmlToImage.toPng(element, options);
        for (let i = 0; i < 30; i++) {
            // on iOS, we might need some retries to get a good image
            if (i > 2 && dataUrl.length > 400 * 1024) {
                break;
            } else {
                await new Promise(resolve => setTimeout(resolve, 50));
                dataUrl = await htmlToImage.toPng(element, options)
            }
        }
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'mockup.png';
        link.click();
    } catch (error) {
        pageLog( `error generating image: ${error.message}`, 'red');
    } finally {
        mockup.classList.remove("loading");
    }
});

function demo() {    
    pond.addFiles(
        ...[1, 2, 3, 4].map(i => `https://benjamine.github.io/devicify/screenshots/sample/sample${i}.jpeg`)
    );
}

function pageLog(message, color) {
    const elem = document.body.appendChild(document.createElement("div"));
    elem.innerText = message;
    if (color) {
        elem.style.color = color;
    }
}