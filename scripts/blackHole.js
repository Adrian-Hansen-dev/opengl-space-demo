'use strict';

/**
 * Shader wird aus externer Datei geladen und compeliert.
 * @param gl
 * @param shader
 * @param name
 * @returns {Promise<void>}
 */
async function setupShader(gl, shader, name) {
    gl.shaderSource(shader, await loadShader("/shader/"+ name + ".glsl"));
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertext Shader: ', gl.getShaderInfoLog(shader));
    }
}

/**
 * Shader Object wird dem Shader-Program zugwiesen und gelinkt.
 * @param gl
 * @param program
 * @param vertexShader
 * @param fragmentShader
 */
function setupProgram(gl, program, vertexShader, fragmentShader) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program))
    }

}

/**
 * normalMatrix berechnen.
 * @param worldMatrix
 * @param viewMatrix
 * @param modelViewMatrix
 * @param normalMatrix
 */
function setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix) {
    mul(modelViewMatrix, worldMatrix, viewMatrix);
    convertTo3x3(normalMatrix, modelViewMatrix);
    invertTranspose(normalMatrix, normalMatrix);

}

async function init() {
    const canvas = document.getElementById('blackHole');
    const gl = canvas.getContext('webgl');


    /*
    SETTING UP SKYBOX
    */
    const skyboxVertexShader = gl.createShader(gl.VERTEX_SHADER);
    const skyboxFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    await setupShader(gl, skyboxVertexShader, "skyboxVertexShader");
    await setupShader(gl, skyboxFragmentShader, "skyboxFragmentShader");

    const skyboxProgram = gl.createProgram();
    setupProgram(gl, skyboxProgram, skyboxVertexShader, skyboxFragmentShader);

    const boxVertices = await loadObj("../obj/cube.obj")
    const skyboxVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBuffer);

    //uniforms
    const skyWorldUniformLocation = gl.getUniformLocation(skyboxProgram, 'mWorld');
    const skyViewUniformLocation = gl.getUniformLocation(skyboxProgram, 'mView');
    const skyProjUniformLocation = gl.getUniformLocation(skyboxProgram, 'mProj');
    const skyboxLocation = gl.getUniformLocation(skyboxProgram, "skybox");

    //create SkyBox Texture
    const skyboxTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: "../texture/starsCubeMapTexture2.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: "../texture/starsCubeMapTexture2.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: "../texture/starsCubeMapTexture2.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: "../texture/starsCubeMapTexture2.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: "../texture/starsCubeMapTexture2.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: "../texture/starsCubeMapTexture2.png",
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const {target, url} = faceInfo;

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512;
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;


        // setup CubeMap Faces
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

        const image = new Image();
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
            gl.texImage2D(target, level, internalFormat, format, type, image);
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        };
        image.src = url;

    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    /*
    SETUP BLACK HOLE
     */
    const blackHoleVertexShader = gl.createShader(gl.VERTEX_SHADER);
    const blackHoleFragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    await setupShader(gl, blackHoleVertexShader, "blackHoleVertexShader");
    await setupShader(gl, blackHoleFragmentShader, "blackHoleFragmentShader");

    const blackHoleProgram = gl.createProgram();
    setupProgram(gl, blackHoleProgram, blackHoleVertexShader, blackHoleFragmentShader);

    const blackHoleVertices = await loadObj("../obj/planet.obj");
    const blackHoleVertexVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, blackHoleVertexVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(blackHoleVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, blackHoleVertexVBO);

    //uniforms
    const positionAttributeLocation = gl.getAttribLocation(blackHoleProgram, 'vertPosition');
    const normalsAttributeLocation = gl.getAttribLocation(blackHoleProgram, 'vertNormal');

    const matWorldUniformLocation = gl.getUniformLocation(blackHoleProgram, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(blackHoleProgram, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(blackHoleProgram, 'mProj');
    const matNormalUniformLocation = gl.getUniformLocation(blackHoleProgram, 'mNormal');
    const matDirCamUniformLocation = gl.getUniformLocation(blackHoleProgram, 'mDirCam');

    const matEvmTextureUniformLocation = gl.getUniformLocation(blackHoleProgram, 'evmTexture');

    const worldMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    const projMatrix = new Float32Array(16);
    const normalMatrix = new Float32Array(9);
    const dirCamMatrix = new Float32Array(9);
    const modelViewMatrix = new Float32Array(16);

    let angle = 0;
    gl.enable(gl.DEPTH_TEST);

    function loop() {

        angle = performance.now() / 2000 / 6 * 2 * Math.PI;

        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        gl.clearColor(6.0/255.0, 4.0/255.0, 8.0/255.0, 1.0);

        /*
        DRAW SKYBOX:
         */
        gl.depthMask(false);
        gl.useProgram(skyboxProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBuffer);

        //bind skybox texture
        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(skyboxLocation, 3)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

        //attributes
        const boxPositionAttributeLocation = gl.getAttribLocation(skyboxProgram, "vPosition");
        gl.vertexAttribPointer(
            boxPositionAttributeLocation, //Attribute Location
            3, //number of elements per attribute
            gl.FLOAT, //Type of Elements
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
            0 //Offset from the beginning of a single vertex to this attribute
        );
        gl.enableVertexAttribArray(boxPositionAttributeLocation);

        identity(worldMatrix);
        lookAt(viewMatrix, [0, 1, 5], [0, 0, 0], [0, 1, 0]);
        //rotation of camera
        rotateY(viewMatrix, viewMatrix, angle/2);
        rotateZ(viewMatrix, viewMatrix, angle/2);
        perspective(projMatrix, toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

        gl.uniformMatrix4fv(skyViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(skyProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(skyWorldUniformLocation, gl.FALSE, worldMatrix);

        /*
          DRAW BLACKHOLE
           */
        gl.depthMask(true);
        gl.useProgram(blackHoleProgram);
        gl.bindBuffer(gl.ARRAY_BUFFER, blackHoleVertexVBO);

        //attributes
        gl.vertexAttribPointer(
            positionAttributeLocation, //Attribute Location
            3, //number of elements per attribute
            gl.FLOAT, //Type of Elements
            gl.FALSE, //specifying whether integer data values should be normalized into a certain range when being cast to a float.
            8 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
            0 //Offset from the beginning of a single vertex to this attribute
        );
        gl.enableVertexAttribArray(positionAttributeLocation);

        gl.vertexAttribPointer(
            normalsAttributeLocation, //Attribute Location
            3, //number of elements per attribute
            gl.FLOAT, //Type of Elements
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual vertex
            5 * Float32Array.BYTES_PER_ELEMENT //Offset from the beginning of a single vertex to this attribute
        );
        gl.enableVertexAttribArray(normalsAttributeLocation);

        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

        //bind blackhole texture
        gl.activeTexture(gl.TEXTURE3);
        gl.uniform1i(matEvmTextureUniformLocation, 3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

        identity(worldMatrix);
        rotateY(worldMatrix, worldMatrix, angle/2);
        rotateX(worldMatrix, worldMatrix, angle/2);

        //Inverse der Viewmatrix für Richtung der Kamera in Weltkoordinaten
        convertTo3x3(dirCamMatrix, viewMatrix);
        invertTranspose(dirCamMatrix, dirCamMatrix);
        gl.uniformMatrix3fv(matDirCamUniformLocation, gl.FALSE, dirCamMatrix);

        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, blackHoleVertices.length / 8);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);


}

window.onload = init;