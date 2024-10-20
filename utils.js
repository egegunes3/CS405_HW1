function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.17677669, -0.28661165,  0.7391989,   0.3,
        0.30618623,  0.36959946,  0.2803301,  -0.25,
       -0.35355338,  0.17677669,  0.61237246,  0.0,
        0.0,         0.0,         0.0,         1.0
    ]);
    
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */


function getModelViewMatrix() {
    // Step 1: In this part we are creating the identity matrix
    let modelViewMatrix = createIdentityMatrix();

    // Step 2: In this part we are defining the scale matrix
    const scalingMatrix = createScaleMatrix(0.5, 0.5, 1);

    // Step 3: In this part we are defining the rotation matrices with the given angles
    const angleX= 30 * (Math.PI / 180); // Convertion of 30 degrees 
    const angleY = 45 * (Math.PI / 180); // Convertion 45 degrees 
    const angleZ = 60 * (Math.PI / 180); // Convertion 60 degrees

    const rotationMatrixX = createRotationMatrix_X(angleX); // 30 degrees
    const rotationMatrixY = createRotationMatrix_Y(angleY); // 45 degrees
    const rotationMatrixZ = createRotationMatrix_Z(angleZ); // 60 degrees

    // Step 4: In this part we are combining the rotation matrices by multiplication (Z * Y * X)
    const multipliedMatrix = multiplyMatrices(rotationMatrixZ, multiplyMatrices(rotationMatrixY, rotationMatrixX));

    // Step 5: In this part we are applying the scale transformation
    modelViewMatrix = multiplyMatrices(scalingMatrix, modelViewMatrix);
    
    // Step 6: In this part we are applying the rotation transformation
    modelViewMatrix = multiplyMatrices(multipliedMatrix, modelViewMatrix);

    // Step 5: In this part we are applying the scale transformation
    modelViewMatrix = multiplyMatrices(scalingMatrix, modelViewMatrix);
    
    // Step 7: In this part we are defining the translation matrix
    const translationMatrix = createTranslationMatrix(0.3, -0.25, 0);
    
    // Step 8: In this part we are applying the translation transformation
    modelViewMatrix = multiplyMatrices(translationMatrix, modelViewMatrix);

    // Return the modelViewMatrix
    return new Float32Array(modelViewMatrix);
}



/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    // Duration of one full cycle (10 seconds)
    const cycleDuration = 10000;

    // Calculate the elapsed time since the animation started
    const elapsedTime = Date.now() - startTime;

    // Normalize time to a range between 0 and 1 (representing progress in the cycle)
    const t = (elapsedTime % cycleDuration) / cycleDuration;

    // Interpolation factor: Moves from 0 to 1 in the first 5 seconds, and 1 to 0 in the next 5 seconds
    const interpolationFactor = t < 0.5 ? (t * 2) : (2 - t * 2);

    // Initial position [0, 0, 0]
    const initialPosition = [0, 0, 0];

    // Target position [0.3, -0.25, 0]
    const targetPosition = [0.3, -0.25, 0];

    // Interpolated position (linear interpolation between initial and target)
    const interpolatedPosition = [
        initialPosition[0] + interpolationFactor * (targetPosition[0] - initialPosition[0]),
        initialPosition[1] + interpolationFactor * (targetPosition[1] - initialPosition[1]),
        initialPosition[2] + interpolationFactor * (targetPosition[2] - initialPosition[2])
    ];

    // Create translation matrix based on interpolated position
    const translationMatrix = createTranslationMatrix(
        interpolatedPosition[0],
        interpolatedPosition[1],
        interpolatedPosition[2]
    );

    // Apply the translation matrix to the model view matrix from Task 2
    let modelViewMatrix = getModelViewMatrix();
    modelViewMatrix = multiplyMatrices(translationMatrix, modelViewMatrix);

    return new Float32Array(modelViewMatrix);
}










