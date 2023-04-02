const nn = ml5.neuralNetwork({ task: 'regression', debug: true })
nn.load('./model/model.json', modelLoaded)

const result = document.getElementById("result");
const predictBtn = document.getElementById("predict");
result.innerText = `...`

predictBtn.addEventListener("click", () => predict())

function modelLoaded() {
    result.innerText = `Ready to predict`
}

async function predict() {
    let zipcodeInput = document.getElementById('zipcode').value;
    let buildYearInput = document.getElementById('buildYear').value;
    let bathroomsInput = document.getElementById('bathrooms').value;

    const results = await nn.predict({ zipcode:parseInt(zipcodeInput), buildYear:parseInt(buildYearInput), bathrooms:parseInt(bathroomsInput) })
    result.innerText = `Predicted value: ${results[0].retailValue} euro`
}