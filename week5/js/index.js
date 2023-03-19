//initialize variables
let model
let videoWidth, videoHeight
let ctx, canvas
let currentHandPositionNeutral = [];
const log = document.querySelector("#array")
const buttonContaier = document.querySelector("#button-container")
const resultPrediction = document.querySelector("#epic-result")
const VIDEO_WIDTH = 720
const VIDEO_HEIGHT = 405

const k = 3
const machine = new kNear(k)

//add eventlistener to the button container
buttonContaier.addEventListener('click', trainHandler)

//start the application
async function main() {
    model = await handpose.load()
    const video = await setupCamera()
    video.play()
    startLandmarkDetection(video)
}

//set up webcam
async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam not available");
    }

    const video = document.getElementById("video");
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
        },
    });
    video.srcObject = stream;

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

//predict finger positions in video stream
async function startLandmarkDetection(video) {

    videoWidth = video.videoWidth
    videoHeight = video.videoHeight

    canvas = document.getElementById("output")

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx = canvas.getContext("2d")

    video.width = videoWidth
    video.height = videoHeight

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.strokeStyle = "red"
    ctx.fillStyle = "red"

    //flip the video horizontally
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)

    predictLandmarks()
}

//predict finger locations using the handpose model
async function predictLandmarks() {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height)
    const predictions = await model.estimateHands(video)
    if (predictions.length > 0) {
        drawHand(ctx, predictions[0].landmarks, predictions[0].annotations)

        //normalize finger positions
        currentHandPositionNeutral = normalizeFunction(predictions)

        //classify hand gesture using k-nearest neighbors algorithm
        let prediction = machine.classify(currentHandPositionNeutral)



        if (prediction == undefined) {
            //display prediction
            resultPrediction.innerHTML = `Het is een...`
        } else {
            //display prediction
            resultPrediction.innerHTML = `Ik denk dat het een '${prediction}' is.`
        }

    }
    requestAnimationFrame(predictLandmarks)
}


//draw hand and fingers with x,y coordinates (ignores z-coordinate)
function drawHand(ctx, keypoints, annotations) {
    //show all x,y,z points of the hand in the log window
    log.innerText = keypoints.flat();

    for (let i = 0; i < keypoints.length; i++) {
        const y = keypoints[i][0]
        const x = keypoints[i][1]
        drawPoint(ctx, x - 2, y - 2, 3)
    }

    let palmBase = annotations.palmBase[0]
    for (let key in annotations) {
        const finger = annotations[key]
        finger.unshift(palmBase)
        drawPath(ctx, finger, false)
    }
}

//draw a point
function drawPoint(ctx, y, x, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
}

//draw a line
function drawPath(ctx, points, closePath) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (closePath) {
        region.closePath()
    }
    ctx.stroke(region)
}

//start
main()

//Normalize the landmarks in the given object
function normalizeFunction(rawObject) {
    let newObject = []

    //remove z axis
    for (const landmark of rawObject[0].landmarks) {
        newObject.push([landmark[0], landmark[1]])
    }


    //place hand in topleft
    for (let index = 0; index < newObject.length; index++) {
        newObject[index] = [(newObject[index][0] - rawObject[0].boundingBox.topLeft[0]),
            (newObject[index][1] - rawObject[0].boundingBox.topLeft[1])]
    }

    //make sure its the same size
    for (let index = 0; index < newObject.length; index++) {
        newObject[index] = [newObject[index][0] / (rawObject[0].boundingBox.bottomRight[0] - rawObject[0].boundingBox.topLeft[0]), newObject[index][1] / (rawObject[0].boundingBox.bottomRight[1] - rawObject[0].boundingBox.topLeft[1])]
    }

    //tutn multidimentional array to normal array
    let finalObject = []

    for (let index = 0; index < newObject.length; index++) {
        finalObject.push(newObject[index][0])
        finalObject.push(newObject[index][1])
    }

    return finalObject
}

//Handle the training event
function trainHandler(event) {
    if (event.target.nodeName === 'BUTTON' && currentHandPositionNeutral.length === 42) {
        machine.learn(currentHandPositionNeutral, event.target.innerHTML)
    }

}