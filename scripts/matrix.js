function exampleMatrix3x3(out) {
    out[0] = 2;
    out[1] = 3;
    out[2] = 1;

    out[3] = 0;
    out[4] = 2;
    out[5] = 0;

    out[6] = 1;
    out[7] = -4;
    out[8] = 3;



}

function exampleMatrix4x4(out) {
    out[0] = 3;
    out[1] = 2;
    out[2] = 3;
    out[3] = 4;

    out[4] = 5;
    out[5] = 3;
    out[6] = 3;
    out[7] = 4;

    out[8] = 1;
    out[9] = 2;
    out[10] = 1;
    out[11] = 3;

    out[12] = 2;
    out[13] = 4;
    out[14] = 9;
    out[15] = 1;

}

//other
function toRadian(angle) {
    return angle * Math.PI / 180

}

function det(a11, a21, a12, a22) {
    // a11, a12
    // a21, a22
    return a11 * a22 - a21 * a12;

}

//vec3
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

}

function cross(out, a, b) {
    let
        a1,
        a2,
        a3
    a1 = a[0];
    a2 = a[1];
    a3 = a[2];


    let
        b1,
        b2,
        b3
    b1 = b[0];
    b2 = b[1];
    b3 = b[2];

    out[0] = a2 * b3 - a3 * b2;
    out[1] = a3 * b1 - a1 * b3;
    out[2] = a1 * b2 - a2 * b1;

}

function normalize(v) {
    let abs = 1 / (Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]));
    v[0] = v[0] * abs;
    v[1] = v[1] * abs;
    v[2] = v[2] * abs;
}


//mat3
function invert(out, a) {

    let
        a11, a12, a13,
        a21, a22, a23,
        a31, a32, a33

    a11 = a[0];
    a21 = a[1];
    a31 = a[2];

    a12 = a[3];
    a22 = a[4];
    a32 = a[5];

    a13 = a[6];
    a23 = a[7];
    a33 = a[8];

    let detA = a11 * det(a22, a32, a23, a33) - a21 * det(a12, a32, a13, a33) + a31 * det(a12, a22, a13, a23);

    // check if det is 0
    if (detA !== 0) {
        let
            o11, o12, o13,
            o21, o22, o23,
            o31, o32, o33

        o11 = det(a22, a32, a23, a33) * (1/detA);
        o12 = (-1) * det(a12, a32, a13, a33) * (1/detA);
        o13 = det(a12, a22, a13, a23) * (1/detA);

        o21 = (-1) * det(a21, a31, a23, a33) * (1/detA);
        o22 = det(a11, a31, a13, a33) * (1/detA);
        o23 = (-1) * det(a11, a21, a13, a23) * (1/detA);

        o31 = det(a21, a31, a22, a32) * (1/detA);
        o32 = (-1) * det(a11, a31, a12, a32) * (1/detA);
        o33 = det(a11, a21, a12, a22) * (1/detA);

        out[0]=o11;
        out[1]=o21;
        out[2]=o31;

        out[3]=o12;
        out[4]=o22;
        out[5]=o32;

        out[6]=o13;
        out[7]=o23;
        out[8]=o33;


    }


}

function transpose(out, a){

    let
        a11, a12, a13,
        a21, a22, a23,
        a31, a32, a33

    a11 = a[0];
    a12 = a[1];
    a13 = a[2];

    a21 = a[3];
    a22 = a[4];
    a23 = a[5];

    a31 = a[6];
    a32 = a[7];
    a33 = a[8];

    out[0]= a11;
    out[1]= a21;
    out[2]= a31;

    out[3]= a12;
    out[4]= a22;
    out[5]= a32;

    out[6]= a13;
    out[7]= a23;
    out[8]= a33;

}

function invertTranspose(out, a) {
    invert(out, a);
    transpose(out, a);
}

//mat4
function identity(out) {
    for (let i = 0; i < out.length; i++) {
        if (i % 5 === 0) {
            out[i] = 1;
        } else {
            out[i] = 0
        }
    }
}

function getExampleMatrix(matrix) {
    for (let i = 0; i <= matrix.length; i++) {
        matrix[i] = i;
    }
    return matrix;
}

function scale(out, inMatrix, v) {
    let x = v[0];
    let y = v[1];
    let z = v[2];

    let scaleMatrix =
        [
            x,   0.0, 0.0, 0.0,
            0.0, y,   0.0, 0.0,
            0.0, 0.0, z,   0.0,
            0.0, 0.0, 0.0, 1.0
        ]

    mul(out, scaleMatrix, inMatrix);
}

function translate(out, inMatrix, v) {
    let x = v[0];
    let y = v[1];
    let z = v[2];

    let translateMatrix =
        [
            1.0, 0, 0, 0,
            0, 1.0, 0, 0,
            0, 0, 1.0, 0,
            x, y, z, 1.0
        ]

    mul(out, translateMatrix, inMatrix);
}

function rotateY(out, inMatrix, angle) {

    let cosA = Math.cos(angle);
    let sinA = Math.sin(angle);
    let mSinA = Math.sin(angle) * (-1);

    let rotateYMatrix =
        [
            cosA, 0, mSinA, 0,
            0, 1, 0, 0,
            sinA, 0, cosA, 0,
            0, 0, 0, 1
        ]

    mul(out, rotateYMatrix, inMatrix)
}

function rotateX(out, inMatrix, angle) {

    let cosA = Math.cos(angle);
    let sinA = Math.sin(angle);
    let mSinA = Math.sin(angle) * (-1);

    let rotateXMatrix =
        [
            1, 0, 0, 0,
            0, cosA, sinA, 0,
            0, mSinA, cosA, 0,
            0, 0, 0, 1
        ]

    mul(out, inMatrix, rotateXMatrix)
}

function rotateZ(out, inMatrix, angle) {

    let cosA = Math.cos(angle);
    let sinA = Math.sin(angle);
    let mSinA = Math.sin(angle) * (-1);

    let rotateZMatrix =
        [
            cosA, sinA, 0, 0,
            mSinA, cosA, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]

    mul(out, inMatrix, rotateZMatrix)
}

function lookAt(out, eye, center, up) {
    let n = [];
    n[0] = eye[0] - center[0];
    n[1] = eye[1] - center[1];
    n[2] = eye[2] - center[2];
    let u = [];
    cross(u, up, n);

    let v = [];
    cross(v, n, u);

    normalize(u);
    normalize(v);
    normalize(n);

    let tx = dot(u, eye) * (-1);
    let ty = dot(v, eye) * (-1);
    let tz = dot(n, eye) * (-1);

    out[0] = u[0];
    out[1] = v[0];
    out[2] = n[0];
    out[3] = 0;

    out[4] = u[1];
    out[5] = v[1];
    out[6] = n[1];
    out[7] = 0;

    out[8] = u[2];
    out[9] = v[2];
    out[10] = n[2];
    out[11] = 0;

    out[12] = tx;
    out[13] = ty;
    out[14] = tz;
    out[15] = 1;


}

function perspective(out, fovy, aspect, near, far) {
    // let pv =
    //     [
    //         1, 0, 0, 0,
    //         0, 1, 0, 0,
    //         0, 0, 1 + far / near, -(1 / near),
    //         0, 0, far, 0
    //     ]

    let top = near * Math.tan(fovy / 2);
    let bottom = -top;
    let right = top * (aspect);
    let left = -right;

    out[0] = 2 / (right - left);
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = 2 / (top - bottom);
    out[6] = 0;
    out[7] = 0;

    out[8] = ((right + left) / (right - left)) / near;
    out[9] = ((top + bottom) / (top - bottom)) / near;
    out[10] = ((far + near) / (far - near)) / (-near);
    out[11] = (-1) / near;

    out[12] = 0;
    out[13] = 0;
    out[14] = (-2 * far) / (far - near);
    out[15] = 0;


}



function convertTo3x3(out, a) {
    let
        a11, a12, a13,
        a21, a22, a23,
        a31, a32, a33

    a11 = a[0];
    a21 = a[1];
    a31 = a[2];

    a12 = a[4];
    a22 = a[5];
    a32 = a[6];

    a13 = a[8];
    a23 = a[9];
    a33 = a[10];


    out[0]=a11;
    out[1]=a21;
    out[2]=a31;

    out[3]=a12;
    out[4]=a22;
    out[5]=a32;

    out[6]=a13;
    out[7]=a23;
    out[8]=a33;

}



function mul(out, a, b) {
    let
        a11, a12, a13, a14,
        a21, a22, a23, a24,
        a31, a32, a33, a34,
        a41, a42, a43, a44

    a11 = a[0];
    a21 = a[1];
    a31 = a[2];
    a41 = a[3];
    a12 = a[4];
    a22 = a[5];
    a32 = a[6];
    a42 = a[7];
    a13 = a[8];
    a23 = a[9];
    a33 = a[10];
    a43 = a[11];
    a14 = a[12];
    a24 = a[13];
    a34 = a[14];
    a44 = a[15];

    let
        b11, b12, b13, b14,
        b21, b22, b23, b24,
        b31, b32, b33, b34,
        b41, b42, b43, b44

    b11 = b[0];
    b21 = b[1];
    b31 = b[2];
    b41 = b[3];
    b12 = b[4];
    b22 = b[5];
    b32 = b[6];
    b42 = b[7];
    b13 = b[8];
    b23 = b[9];
    b33 = b[10];
    b43 = b[11];
    b14 = b[12];
    b24 = b[13];
    b34 = b[14];
    b44 = b[15];

    out[0] = b11 * a11 + b12 * a21 + b13 * a31 + b14 * a41;
    out[1] = b21 * a11 + b22 * a21 + b23 * a31 + b24 * a41;
    out[2] = b31 * a11 + b32 * a21 + b33 * a31 + b34 * a41;
    out[3] = b41 * a11 + b42 * a21 + b43 * a31 + b44 * a41;

    out[4] = b11 * a12 + b12 * a22 + b13 * a32 + b14 * a42;
    out[5] = b21 * a12 + b22 * a22 + b23 * a32 + b24 * a42;
    out[6] = b31 * a12 + b32 * a22 + b33 * a32 + b34 * a42;
    out[7] = b41 * a12 + b42 * a22 + b43 * a32 + b44 * a42;

    out[8] = b11 * a13 + b12 * a23 + b13 * a33 + b14 * a43;
    out[9] = b21 * a13 + b22 * a23 + b23 * a33 + b24 * a43;
    out[10] = b31 * a13 + b32 * a23 + b33 * a33 + b34 * a43;
    out[11] = b41 * a13 + b42 * a23 + b43 * a33 + b44 * a43;

    out[12] = b11 * a14 + b12 * a24 + b13 * a34 + b14 * a44;
    out[13] = b21 * a14 + b22 * a24 + b23 * a34 + b24 * a44;
    out[14] = b31 * a14 + b32 * a24 + b33 * a34 + b34 * a44;
    out[15] = b41 * a14 + b42 * a24 + b43 * a34 + b44 * a44;


}
