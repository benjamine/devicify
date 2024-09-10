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

on('click', window, 'button.download', e => {
    e.preventDefault();
    const mockup = e.target.closest('.mockup').querySelector('.mockup-image');
    htmlToImage.toPng(mockup)
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'mockup.png';
            link.href = dataUrl;
            link.click();
        })
        .catch((error) => {
            console.error('oops, something went wrong!', error);
        });
});

function demo() {    
    pond.addFiles(
        ...[1, 2, 3, 4].map(i => `https://benjamine.github.io/devicify/screenshots/sample/sample${i}.jpeg`)
    );
}