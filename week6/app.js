import {DecisionTree} from "./libraries/decisiontree.js"
import {VegaTree} from "./libraries/vegatree.js"

//
// DATA
//
const csvFile = "./data/mushroom.csv"
const trainingLabel = "class"
const ignored = ["class", "population", "habitat", "gill-color"]

//
// laad csv data als json
//
function loadData() {
    Papa.parse(csvFile, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: results => trainModel(results.data)   // gebruik deze data om te trainen
    })
}

//
// MACHINE LEARNING - Decision Tree
//
function trainModel(data) {
    // todo : splits data in traindata en testdata
    let trainData = data.slice(0, Math.floor(data.length * 0.8))
    let testData = data.slice(Math.floor(data.length * 0.8) + 1)

    // maak het algoritme aan
    let decisionTree = new DecisionTree({
        ignoredAttributes: ignored,
        trainingSet: data,
        categoryAttr: trainingLabel
    })

    // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
    let visual = new VegaTree('#view', 800, 400, decisionTree.toJSON())


    // todo : maak een prediction met een sample uit de testdata
    let poisonous = testData[15]
    let poisonousPrediction = decisionTree.predict(poisonous)
    if (poisonousPrediction === "p") {
        console.log(`Veilig om te eten`)
    } else {
        console.log('Giftig')
    }


    // todo : bereken de accuracy met behulp van alle test data

}

loadData()