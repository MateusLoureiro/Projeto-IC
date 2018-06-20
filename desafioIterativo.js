
exports.solve = function(fileName) {
  let formula = readFormula(fileName)
  let result = doSolve(formula.clauses, formula.variables, formula.watchList)
  return result
}

function doSolve(clauses, assignment, watchList) {
  var indice = 0
  var jaPassou = false

  while ((assignment[0] !== null || !jaPassou) && indice < assignment.length){
    var insatClause = false

    if (!jaPassou){
      jaPassou = true
    }
    
    if (assignment[indice] === null){
      assignment[indice] = 1
      insatClause = nextWatchList(clauses, assignment, watchList, indice)
      if (insatClause){
        // console.log('ss')
        watchList = previousWatchList(clauses, assignment, watchList, indice)
      } else {
        // console.log('aqui')
        indice++
      }
    } else if (assignment[indice] === 1){
      assignment[indice] = -1
      insatClause = nextWatchList(clauses, assignment, watchList, indice)
      if (insatClause){
        watchList = previousWatchList(clauses, assignment, watchList, indice)
      } else {
        indice++
      }
    } else {
      assignment[indice] = null
      indice--
      watchList = previousWatchList(clauses, assignment, watchList, indice)
    }
  }
  
  let isSat = true
  if (assignment[0] === null || assignment.length === 0){
    isSat = false
  }

  let result = {'isSat': isSat, satisfyingAssignment: null }
  if (isSat){
    result.satisfyingAssignment = assignment
  }

  return result
}

function readFormula(fileName) {
  let fs = require("fs")
  let input = fs.readFileSync(fileName, "utf-8")
  let text = input.split("\n")
  let clauses = readClauses(text)
  let variables = readVariables(clauses)
  let watchList = createWatchList(clauses)

  // In the following line, text is passed as an argument so that the function
  // is able to extract the problem specification.
  let specOk = checkProblemSpecification(text, clauses, variables)

  let result = { 'clauses': [], 'variables': [], 'watchList': [] }
  if (specOk) {
    result.clauses = clauses
    result.variables = variables
    result.watchList = watchList
  }
  // console.log(result)
  return result
}

function readClauses(text) {
  let clauses = []
  let index = 0
  let temp = ""

  // console.log(text)

  for (let i = 0; i < text.length; i++) {
    if (!(text[i] === "") && !(text[i].charAt(0) === 'c') && !(text[i].charAt(0) === 'p')) {
      // console.log(text[i])
      if (text[i].indexOf("0") === -1) {
        temp = temp.concat(text[i] + " ")
      } else {
        clauses[index] = temp.concat(text[i]).split(/\s+/) // "/\s+/" to split in multiple whitespaces
        clauses[index].pop()  
        // console.log(clauses[index])
        temp = ""
        index++
      }
    }
  }

  for (let i = 0; i < clauses.length; i++) {
    for (let j = 0; j < clauses[i].length; j++) {
      if (clauses[i][j] === ""){
        // console.log("aqui")
        clauses[i].shift()
      }
      // console.log(clauses[i][0])
      clauses[i][j] = Number(clauses[i][j])
    }
  }

  return clauses
}

function readVariables(clauses) {
  // First search for the highest number
  // Then create array of booleans of that size and return it

  let highestNumber = 0
  let x = 0
  let variables = []

  for (let i = 0; i < clauses.length; i++) {
    for (let j = 0; j < clauses[i].length; j++) {
      x = Math.abs(clauses[i][j])
      if (x > highestNumber) {
        highestNumber = x
      }
    }
  }

  for (let i = 0; i < highestNumber; i++) {
    variables[i] = null
  }
  // console.log(variables)
  return variables
}

function createWatchList(clauses){
  let watchList = []

  for (let i = 0; i < clauses.length; i++){
    let minValue = Number.MAX_SAFE_INTEGER
    for(let j = 0; j < clauses[i].length; j++){
      if (Math.abs(minValue) > Math.abs(clauses[i][j])){
        minValue = clauses[i][j]
      }
    }
    watchList.push(minValue)
  }

  // console.log(watchList)

  return watchList
}

function checkProblemSpecification(text, clauses, variables){
  let specLine = ""
  let foundSpec = false
  let specs = []

  for (let i = 0; i < text.length && !foundSpec; i++){
    if (text[i].charAt(0) === "p"){
      specLine = text[i]
      foundSpec = true
    }
  }
  specs = specLine.split(" ")
  return (variables.length == specs[2] && clauses.length == specs[3])
}

function nextWatchList(clauses, assignment, watchList, indice) {
  // retorna false se der tudo certo e retorna true se alguma clause der insat e tiver q dar backtrack
  let absLiteral = indice + 1
  // console.log(absLiteral)

  let insatClause = false
  for (let i = 0; i < watchList.length && !insatClause; i++){
    if (Math.abs(watchList[i]) === absLiteral) {
      if (watchList[i] * assignment[indice] < 0) {
        watchList[i] = nextLiteral(clauses[i], watchList[i])
        if (watchList[i] === Number.MAX_SAFE_INTEGER){
          insatClause = true
        }
      }
    }
  }
  return insatClause
}

function previousWatchList(clauses, assignment, watchList, indice) {
  let previousLiteral = (indice + 1) * assignment[indice] * -1
  
  for (let i = 0; i < clauses.length; i++){
    for (let j = 0; j < clauses[i].length; j++){
      if (clauses[i][j] === previousLiteral && Math.abs(watchList[i]) > Math.abs(previousLiteral)){
        // console.log("aqui")
        watchList[i] = previousLiteral
      }
    }
  }
  return watchList
}

function nextLiteral(clause, literal) {
  // retorna Number.MAX_SAFE_INTEGER se não houver mais variáveis para dar watch
  let nextLiteral = Number.MAX_SAFE_INTEGER

  for (let i = 0; i < clause.length; i++){
    if (Math.abs(clause[i]) > Math.abs(literal) &&  Math.abs(clause[i]) < Math.abs(nextLiteral)){
      nextLiteral = clause[i]
    }
  }

  return nextLiteral
}
