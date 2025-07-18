'use strict';

/**
 * Erstellt einen Planeten auf Grundlage de Übergebenen Parameter.
 * @param worldMatrix
 * @param size
 * @param distance
 * @param rotationSun
 * @param rotationPlanet
 */
function createPlanet(worldMatrix, size, distance, rotationSun, rotationPlanet){
    rotateY(worldMatrix, worldMatrix, rotationSun); //rotation um Sonne
    translate(worldMatrix, worldMatrix, distance) //verschieben
    rotateY(worldMatrix, worldMatrix, rotationPlanet); //rotation um sich selbst
    scale(worldMatrix, worldMatrix, size); //scale
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

/**
 * Shader wird aus externer Datei geladen und compeliert.
 * @param gl
 * @param shader
 * @param name
 * @returns {Promise<void>}
 */
async function setupShader(gl, shader, name) {
    gl.shaderSource(shader, await loadShader("./shader/"+ name + ".glsl"));
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
async function init() {
    document.getElementById("loader-canvas").style.display = "flex";

    const canvas = document.getElementById('solarsystem');
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

    const boxVertices = await loadObj("./obj/cube.obj")
    const skyboxVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyboxVertexBuffer);

    //uniforms
    const skyWorldUniformLocation = gl.getUniformLocation(skyboxProgram, 'mWorld');
    const skyViewUniformLocation = gl.getUniformLocation(skyboxProgram, 'mView');
    const skyProjUniformLocation = gl.getUniformLocation(skyboxProgram, 'mProj');
    const skyboxLocation = gl.getUniformLocation(skyboxProgram, "skybox");

    //create skyBox texture
    const skyboxTexture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: "./texture/starsCubeMapTexture.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: "./texture/starsCubeMapTexture.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: "./texture/starsCubeMapTexture.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: "./texture/starsCubeMapTexture.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: "./texture/starsCubeMapTexture.png",
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: "./texture/starsCubeMapTexture.png",
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

        //setup faces
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
    SETTING UP PLANETS
    */

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    await setupShader(gl, vertexShader, "vertexshader");
    await setupShader(gl, fragmentShader, "fragmentshader");

    const program = gl.createProgram();
    setupProgram(gl, program, vertexShader, fragmentShader);

    //saturn ring vertices
    const ringVertices = await loadObj("./obj/ring.obj");
    const ringVertexVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexVBO);

    const planetVertices = await loadObj("./obj/planet.obj");
    const planetVertexVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexVBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planetVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexVBO);

    //uniforms
    const positionAttributeLocation = gl.getAttribLocation(program, 'vertPosition');
    const normalsAttributeLocation = gl.getAttribLocation(program, 'vertNormal');
    const textureAttributeLocation = gl.getAttribLocation(program, 'aTextureCoord');

    const matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
    const matViewUniformLocation = gl.getUniformLocation(program, 'mView');
    const matProjUniformLocation = gl.getUniformLocation(program, 'mProj');
    const matNormalUniformLocation = gl.getUniformLocation(program, 'mNormal');
    const matLightWorldPositionUniformLocation = gl.getUniformLocation(program, 'lightWorldPosition');

    const matEmissionUniformLocation = gl.getUniformLocation(program, 'matEmission');
    const matAmbientUniformLocation = gl.getUniformLocation(program, 'matAmbient');
    const matDiffuseUniformLocation = gl.getUniformLocation(program, 'matDiffuse');
    const matSpecularUniformLocation = gl.getUniformLocation(program, 'matSpecular');
    const matShininessUniformLocation = gl.getUniformLocation(program, 'matShininess');

    const lightAmbientUniformLocation = gl.getUniformLocation(program, 'lightAmbient');
    const lightDiffuseUniformLocation = gl.getUniformLocation(program, 'lightDiffuse');
    const lightSpecularUniformLocation = gl.getUniformLocation(program, 'lightSpecular');

    const isEarthUniformLocation = gl.getUniformLocation(program, 'isEarth');
    const shiftUniformLocation = gl.getUniformLocation(program, 'shift');
    const alphaUniformLocation = gl.getUniformLocation(program, 'alpha');

    const textureUniformLocation = gl.getUniformLocation(program, 'planetTexture');
    const textureEarthNightUniformLocation = gl.getUniformLocation(program, 'textureEarthNight');
    const textureEarthCloudsUniformLocation = gl.getUniformLocation(program, 'textureEarthClouds');

    //create Planet Texture
    gl.activeTexture(gl.TEXTURE0);

    const texturePromises = [
        loadImageTexture(gl, "./texture/mercury.jpeg"),
        loadImageTexture(gl, "./texture/venus_atmosphere.jpeg"),
        loadImageTexture(gl, "./texture/earth_day.png"),
        loadImageTexture(gl, "./texture/earth_clouds.png"),
        loadImageTexture(gl, "./texture/earth_night.png"),
        loadImageTexture(gl, "./texture/moon.jpeg"),
        loadImageTexture(gl, "./texture/mars.jpeg"),
        loadImageTexture(gl, "./texture/jupiter.jpeg"),
        loadImageTexture(gl, "./texture/saturn.jpeg"),
        loadImageTexture(gl, "./texture/saturnRing.jpeg"),
        loadImageTexture(gl, "./texture/uranus.jpeg"),
        loadImageTexture(gl, "./texture/neptune.jpeg"),
        loadImageTexture(gl, "./texture/sun.png")

    ];

    const [
        tMecury, tVenus, tEarthDay, tEarthClouds, tEarthNight,
        tMoon, tMars, tJupiter, tSaturn, tRing, tUranus, tNeptune, tSun
    ] = await Promise.all(texturePromises);

    //load video
    const textureInit = loadInitTexture(gl);
    const video = setupVideo("./texture/sun.mp4");


    const worldMatrix = new Float32Array(16);
    const viewMatrix = new Float32Array(16);
    const projMatrix = new Float32Array(16);
    const modelViewMatrix = new Float32Array(16);
    const normalMatrix = new Float32Array(9);

    let angle = 0;
    let zoomValue=0;
    let zoom = 30;

    gl.enable(gl.DEPTH_TEST);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
    gl.enable(gl.BLEND);

    //get mouse scroll value
    window.addEventListener("wheel", event => {
        zoomValue = event.deltaY;
        if(zoomValue>0){
            zoom++;
        }
        if(zoomValue<0){
            zoom--;
        }
        zoom = Math.max(Math.min(zoom, 60), 5);
    });

    function loop() {
        angle = performance.now() / 2000 / 6 * 2 * Math.PI;

        gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        /*
        DRAW SKYBOX:
         */

        //nicht transparent
        gl.uniform1f(alphaUniformLocation, 1.0);

        //nichts in den z-Buffer schreiben
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
        lookAt(viewMatrix, [0, zoom, zoom], [0, 0, 0], [0, 1, 0]);
        perspective(projMatrix, toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

        gl.uniformMatrix4fv(skyViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(skyProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(skyWorldUniformLocation, gl.FALSE, worldMatrix);

        gl.drawArrays(gl.TRIANGLES, 0, boxVertices.length/8);


        /*
          DRAW PLANETS:
           */

        //z-werte in den z-Buffer schreiben
        gl.depthMask(true);

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, planetVertexVBO);

        //setup planet textures
        gl.activeTexture(gl.TEXTURE1);
        gl.uniform1i(textureEarthNightUniformLocation, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.uniform1i(textureEarthCloudsUniformLocation, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(textureUniformLocation, 0);

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

        gl.vertexAttribPointer(
            textureAttributeLocation,
            2,
            gl.FLOAT,
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(textureAttributeLocation);

        //uniforms
        gl.uniform3f(matEmissionUniformLocation, 0.0, 0.0, 0.0);
        gl.uniform3f(matAmbientUniformLocation, 1.0, 1.0, 1.0);
        gl.uniform3f(matDiffuseUniformLocation, 1.0, 1.0, 1.0);
        gl.uniform3f(matSpecularUniformLocation, 1.0, 1.0, 1.0);
        gl.uniform1f(matShininessUniformLocation, 10.0);
        gl.uniform3f(lightAmbientUniformLocation, 0.1, 0.1, 0.1);
        gl.uniform3f(lightDiffuseUniformLocation, 1.0, 1.0, 1.0);
        gl.uniform3f(lightSpecularUniformLocation, 0.7, 0.7, 0.7);
        gl.uniform3f(matLightWorldPositionUniformLocation, 0.0, 0.0, 0.0);

        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);


        //SUN:
        if (copyVideo) {
            updateVideoTexture(gl, textureInit, video);
        }
        else{
            gl.bindTexture(gl.TEXTURE_2D, tSun);
        }


        gl.uniform3f(lightAmbientUniformLocation, 1.0, 1.0, 1.0);
        gl.uniform3f(matEmissionUniformLocation, 1.0, 1.0, 1.0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix)
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);

        gl.uniform3f(lightAmbientUniformLocation, 0.1, 0.1, 0.1);


        //MERCURY:
        gl.bindTexture(gl.TEXTURE_2D, tMecury);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.2,0.2,0.2], [0,0,2], angle*2, angle*2);
        gl.uniform3f(matEmissionUniformLocation, 0.0, 0.0, 0.0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //VENUS:
        gl.bindTexture(gl.TEXTURE_2D, tVenus);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.5, 0.5, 0.5], [0,0,3], angle, angle);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //EARTH:

        //enable earth texturing
        gl.uniform1f(isEarthUniformLocation, 1.0);

        gl.uniform1f(shiftUniformLocation, -angle/4);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, tEarthDay);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tEarthNight);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, tEarthClouds);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.5,0.5,0.5], [0,0,6], -angle*0.4, -angle*3);
        rotateX(worldMatrix, worldMatrix, Math.PI);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);

        gl.activeTexture(gl.TEXTURE0);

        //disable earth texturing
        gl.uniform1f(isEarthUniformLocation, 0.0);


        //MOON:
        gl.bindTexture(gl.TEXTURE_2D, tMoon);

        createPlanet(worldMatrix, [0.3,0.3,0.3], [0, 0, 2], angle*5, 0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //MARS:
        gl.bindTexture(gl.TEXTURE_2D, tMars);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.3,0.3,0.3], [0,0,8], angle*0.4, 2*angle);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //JUPITER:
        gl.bindTexture(gl.TEXTURE_2D, tJupiter);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.8,0.8,0.8], [0,0,9.5], angle*0.3, 1.5*angle);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //SATURN:
        gl.bindTexture(gl.TEXTURE_2D, tSaturn);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.7,0.7,0.7], [0,0,12], angle*0.25, 0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //URANUS:
        gl.bindTexture(gl.TEXTURE_2D, tUranus);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.6,0.6,0.6], [0,0,14], angle*0.15, 0.9*angle);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //NEPTUNE:
        gl.bindTexture(gl.TEXTURE_2D, tNeptune);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.55,0.55,0.55], [0,0,16], angle*0.1, 0.5*angle);

        //Planet reflektiert mehr als andere
        gl.uniform1f(matShininessUniformLocation, 100.0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, planetVertices.length / 8);


        //SATURN RING:

        //transparent
        gl.uniform1f(alphaUniformLocation, 0.2);
        gl.bindBuffer(gl.ARRAY_BUFFER, ringVertexVBO);

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

        gl.vertexAttribPointer(
            textureAttributeLocation,
            2,
            gl.FLOAT,
            gl.FALSE,
            8 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(textureAttributeLocation);

        gl.bindTexture(gl.TEXTURE_2D, tRing);

        identity(worldMatrix);
        createPlanet(worldMatrix, [0.08,0.08,0.08], [0,0,12], angle*0.25, 0);
        setLighting(worldMatrix, viewMatrix, modelViewMatrix, normalMatrix);
        gl.uniformMatrix3fv(matNormalUniformLocation, gl.FALSE, normalMatrix);
        gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, ringVertices.length / 8);

        requestAnimationFrame(loop);
    }
    document.getElementById("loader-canvas").style.display = "none";
    document.getElementById("solarsystem").style.display = "block";

    requestAnimationFrame(loop);
}

window.onload = init;