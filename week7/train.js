import {createChart, updateChart} from "./scatterplot.js"
const nn = ml5.neuralNetwork({ task: 'regression', debug: true })
let trainData
let testData

//HTML
const result = document.getElementById("result");
const saveBtn = document.getElementById("save");
const predictBtn = document.getElementById("predict");

predictBtn.addEventListener("click", () => predict())
saveBtn.addEventListener("click", () => saveModel())

function loadData() {
    Papa.parse("./data/utrecht-houseprices.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => checkData(results.data)
    })
}loadData()

function checkData(data) {
    data.sort(() => (Math.random() - 0.5))
    trainData = data.slice(0, Math.floor(data.length * 0.8))
    testData = data.slice(Math.floor(data.length * 0.8) + 1)
    console.table(data)

    for (let house of data) {
        nn.addData({ zipcode: house.zipcode, buildyear: house.buildyear, lotArea: house.lotArea }, { retailValue: house.retailValue })
    }

    const chartData = data.map(house => ({
        x: house.zipcode,
        y: house.retailValue,
    }))


    createChart(chartData, "Zipcode", "Retail Value")

    nn.normalizeData()
    nn.train({ epochs: 52 }, () => console.log("Finished training"))
}

async function predict() {
    let zipcodeInput = document.getElementById('zipcode').value;
    let buildYearInput = document.getElementById('buildYear').value;
    let bathroomsInput = document.getElementById('bathrooms').value;

    const results = await nn.predict({ zipcode:parseInt(zipcodeInput), buildYear:parseInt(buildYearInput), bathrooms:parseInt(bathroomsInput) })
    result.innerText = `Predicted value: ${results[0].retailValue} euro`
}

function saveModel() {
    nn.save()
}