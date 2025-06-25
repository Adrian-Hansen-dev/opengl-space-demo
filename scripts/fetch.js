async function loadShader(url) {
    try{
        let response = await fetch(url);
        const shaderText = await response.text()
        console.log(shaderText)
        return shaderText;

    }
    catch(e){
        console.log(e);
    }
}

var copyVideo = false;

function setupVideo(url) {
    const video = document.createElement('video')

    var playing = false;
    var timeupdate = false;

    video.autoplay = true;
    video.muted = true;
    video.loop = true;

    video.addEventListener('playing', function () {
        playing = true;
        checkReady();
    }, true);

    video.addEventListener('timeupdate', function () {
        timeupdate = true;
        checkReady();
    }, true);

    video.src = url;
    video.play();

    function checkReady() {
        if (playing && timeupdate) {
            copyVideo = true
        }

    }

    return video;

}

function loadInitTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;

}

function updateVideoTexture(gl, texture, video) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, video);
}

function loadImageTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue

    //ohne Image
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    //mit Image
    const image = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);


        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        }
    };
    image.src = url;

    return texture;

}

/**
 * WebGL1 has different requirements for power of 2 images
 * vs non power of 2 images so check if the image is a power of 2 in both dimensions.
 * @param value
 * @returns {boolean}
 */
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;

}


async function loadObj(path) {
    const res = await fetch(path)
    const text = await res.text()

    const lines = text.split(/\r*\n/)

    let vertices = []
    let normals = []
    let textures = []

    let vbo = []

    for (const line of lines) {
        let items = line.trim().split(/\s+/)
        const identifier = items.shift()

        if (identifier === 'v') {
            vertices.push(items)
        }

        if (identifier === 'vn') {
            normals.push(items)
        }

        if (identifier === 'vt') {
            textures.push(items)
        }

        if (identifier === 'f') {
            for (const item of items) {
                const [vertexIndex, textureIndex, normalIndex] = item.trim().split('/').map(num => parseInt(num))

                vbo.push(...vertices[vertexIndex - 1])
                vbo.push(...textures[textureIndex - 1])
                vbo.push(...normals[normalIndex - 1])
            }
        }
    }

    return vbo.map(parseFloat)
}