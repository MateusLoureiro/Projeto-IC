/*
 * Programa feito por Mateus Loureiro, seguindo instruções de Fernando Casto como trabalho da disciplina IF668.
 * "Esqueleto" do programa escrito por Fernando Castor em Novembro de 2017.
 */

"use strict";

exports.solve = function(fileName) {
  let formula = readFormula(fileName)
  let result = doSolve(formula.clauses, formula.variables)
  return result // two fields: isSat and satisfyingAssignment
}

// Receives the current assignment and produces the next one
function nextAssignment(currentAssignment) {
  // implement here the code to produce the next assignment based on currentAssignment. 
  let foundFalse = false

  for (let i = 0; i < currentAssignment.length && !foundFalse; i++){
    if (currentAssignment[i] === false) {
      currentAssignment[i] = true
      foundFalse = true
    } else {
      currentAssignment[i] = false
    }
  }

  return currentAssignment
}

function doSolve(clauses, assignment) {
  let isSat = false
  let max = 0
  if (assignment.length != 0){
    max = Math.pow(2, assignment.length)
  } // To set false to isSat if assignment.length === 0

  let currentTry = 0
  while ((!isSat) && currentTry < max) {
    let assignmentSat = true
    for(let i = 0; i < clauses.length && assignmentSat; i++){
      let isClause = false
      for(let j = 0; j < clauses[i].length && !isClause; j++){
        let teste = Number(clauses[i][j]) 
        let index = Math.abs(teste) - 1
        if ((teste < 0 && assignment[index] === false) || (teste > 0 && assignment[index] === true)) {
          isClause = true
        }
      }
      if (!isClause) {
        assignmentSat = false
      }
    } 
 
    if (assignmentSat){
      isSat = true
    } else if(currentTry < max - 1){
      assignment = nextAssignment(assignment)
    }
    currentTry++
  }
  let result = {'isSat': isSat, satisfyingAssignment: null}
  if (isSat) {
    result.satisfyingAssignment = assignment
  }

  return result
}
  
function readFormula(fileName) {
  // To read the file, it is possible to use the 'fs' module. 
  // Use function readFileSync and not readFile. 
  // First read the lines of text of the file and only afterward use the auxiliary functions.
  let fs = require("fs")
  let input = fs.readFileSync(fileName, "utf-8")
  let text = input.split("\n") //  an array containing lines of text extracted from the file. 
  let clauses = readClauses(text)
  let variables = readVariables(clauses)
  
  // In the following line, text is passed as an argument so that the function
  // is able to extract the problem specification.
  let specOk = checkProblemSpecification(text, clauses, variables)

  let result = { 'clauses': [], 'variables': [] }
  if (specOk) {
    result.clauses = clauses
    result.variables = variables
  }

  return result
}

function readClauses(text) {
  // First check the begginning of each line
  // Then create the array of clauses and return it

  let clauses = []
  let index = 0
  let temp = ""

  for(let i = 0; i < text.length; i++) {
    if (!(text[i] === "") && !(text[i].charAt(0) === 'c') && !(text[i].charAt(0) === 'p')){
      if (text[i].indexOf("0") === -1){
        temp = temp.concat(text[i] + " ")
      } else {
        clauses[index] = temp.concat(text[i]).split(/\s+/) // "/\s+/" to split in multiple whitespaces
        clauses[index].pop()
        temp = ""
        index++
      }
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
  
  for(let i = 0; i < clauses.length; i++){
    for(let j = 0; j < clauses[i].length; j++){
      x = Math.abs(Number(clauses[i][j]))
      if (x > highestNumber){
        highestNumber = x
      }
    }
  }

  for(let i = 0; i < highestNumber; i++){
    variables[i] = false
  }
  // console.log(variables)
  return variables
}

function checkProblemSpecification(text, clauses, variables){
  // First get specification
  // Then compare and return result

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
