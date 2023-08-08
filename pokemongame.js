const sample = 100;

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getComponents(line) {
  const voltorbs = line[1];
  const totalScore = line[0];
  const openSlots = 5 - voltorbs;
  const surplusNumbers = totalScore - openSlots;
  const initialState = surplusNumbers % 2 === 0
    ? [surplusNumbers / 2, 0] : [Math.floor(surplusNumbers / 2), 1];
  const twosandones = [initialState];
  while (
    twosandones[twosandones.length - 1][0] > 0
    && (twosandones[twosandones.length - 1][0] + twosandones[twosandones.length - 1][1]) < 4) {
    twosandones.push(
      [twosandones[twosandones.length - 1][0] - 1, twosandones[twosandones.length - 1][1] + 2],
    );
  }
  return twosandones.map((twoandone) => [...twoandone, openSlots - twoandone[0] - twoandone[1], voltorbs]);
}

function getCommonComponents(rowp,colp){
  if(!rowp || !colp || rowp.length === 0 || colp.length == 0){
    return [false, false, false, false]
  }
  const rowtf = rowp.map(row => row.map(val => val > 0));
  const coltf = colp.map(col => col.map(val => val > 0));
  const rowpGTZero = rowtf.length > 1
   ? rowtf.reduce((a,b) => a.map((_,index) => a[index] || b[index]))
   : rowtf[0];
  const colpGTZero = coltf.length > 1
   ? coltf.reduce((a,b) => a.map((_,index) => a[index] || b[index] ))
   : coltf[0];
  commonGTZero = rowpGTZero.map((_,index) => rowpGTZero[index] && colpGTZero[index])
  return commonGTZero;
  /*
  const common = row.map((type, index) => Math.min(type, colp[index]));
  const possibleRows = rowp.filter(row => row.every((type) => type >= 0));
  const possiblecols = rowp.filter(row => row.every((type) => type >= 0));
  */
}

function getNextIndex(index){
  const newTotal = index.col * 5 + index.row + 1;
  return {row: newTotal%5, col: Math.floor(newTotal/5)}
}

function getNextChoice(choices,lastChoice){
  sliceIndex = lastChoice + 1;
  next = choices.slice(sliceIndex).findIndex(val => val);
  return next == -1 ? next : next + sliceIndex;
}

function getNewBoardState(choice,newIndex,boardState){
  const newboardState = boardState.map(row => row.map(col => col));
  newboardState[newIndex.col][4 - newIndex.row] = 3 - choice;
  return newboardState;
}

function getNewRowsOrCols(choice, index, rowscols){
  return rowscols.map((rowcol,i) => i === index ? 
    rowcol.map(rowcolpos => rowcolpos.map((type,j) => j === choice ? 
      type - 1 
      : type)).filter(rowcolpos => rowcolpos.every(type => type > -1))
    : rowcol);  
}

function generateNewNode(node,finalBoards){
  node.lastChoice = getNextChoice(node.choices, node.lastChoice);
  if (node.lastChoice == -1){
    if (node.index.row === 4 && node.index.col === 4){
      finalBoards.push(node.boardState);
    }
    return node.parent ? generateNewNode(node.parent,finalBoards) : null; //flesh this out more
  } else {
    const currIndex = getNextIndex(node.index);
    const newBoardState = getNewBoardState(node.lastChoice, currIndex, node.boardState)
    const nextIndex = getNextIndex(currIndex);
    const newRows = getNewRowsOrCols(node.lastChoice, currIndex.col, node.rows);
    const newCols = getNewRowsOrCols(node.lastChoice, currIndex.row, node.cols);
    const newChoices = getCommonComponents(newRows[nextIndex.col], newCols[nextIndex.row]);
    return ({
      lastChoice: -1,
      choices: newChoices,
      parent: node,
      boardState: newBoardState,
      rows: newRows,
      cols: newCols,
      index: currIndex
    })
  }
}

function getBestMove(finalBoards, moves){
  //Add sampling top set of moves
  const aggregate = Array(5).fill(0).map(e => Array(5).fill(0).map(e => [0,0,0,0]));
  finalBoards.forEach(board => {
    board.forEach((row,i) => row.forEach((col,j) => {
      aggregate[i][j][3 - col] += 1
    }))
  })
  
  const normalizedAggregate = aggregate.map(row => row.map(col => col.map(type => type/finalBoards.length)));
  const probabilityOfTwoOrThree = normalizedAggregate.map(row => row.map(col => col[3] === 0 ? Infinity * (col[0] + col[1]) : (col[0] + col[1]) / (col[3])));
  let maxProbabilityIndex = [0,0]
  let maxProbability = -1;
  probabilityOfTwoOrThree.forEach((row, i) => row.forEach((col, j) => {
    const rowIndex = i;
    const colIndex = j;
    if(moves.findIndex(move => move[0] === rowIndex && move[1] === colIndex) === -1 && probabilityOfTwoOrThree[i][j] > maxProbability){
      maxProbability = probabilityOfTwoOrThree[i][j];
      maxProbabilityIndex = [i,j];
    }
  }));
  return {
    index: maxProbabilityIndex,
    probability: maxProbability
  }
}

function getMove() {
  return new Promise((resolve) => {
    readline.question('Result: ', (result) => {
      resolve(result);
    });
  });
}

function printBestMove(bestMove){
  console.log("Where to move:");
  const empty = Array(5).fill(0).map(e => Array(5).fill(null));
  const moveArray = empty.map((r,i) => r.map((c,j) => bestMove.index[0] === i && bestMove.index[1] === j ? 'X' : '_'))
  console.log(moveArray);
  console.log('Probability: ', bestMove.probability);
}


async function main() {
  const args = process.argv.slice(2);

  argNums = args.map(str => Number(str));
  rowNums = argNums.slice(0,10)
  colNums = argNums.slice(10)
  rows = [];
  cols = [];
  for(let i = 0; i < 10; i+=2){
    rows.push([rowNums[i],rowNums[[i + 1]]]);
    cols.push([colNums[i],colNums[[i + 1]]]);
  }

  rowComponents = rows.map((row) => getComponents(row));
  colComponents = cols.map((col) => getComponents(col));

  let finalBoards = []

  let node = {
    lastChoice: -1,
    choices: getCommonComponents(rowComponents[0], colComponents[0]),
    parent: null,
    boardState: Array(5).fill(0).map(e => Array(5).fill(null)),
    rows: rowComponents,
    cols: colComponents,
    index: {col: 0, row: -1}
  } 

  while((node = generateNewNode(node,finalBoards)));

  let moves = [];
  let bestMove = getBestMove(finalBoards, moves);
  printBestMove(bestMove);
  while(bestMove.probability > 0) {
    let move = await getMove();
    const val = Number(move);
    finalBoards = finalBoards.filter(board => board[bestMove.index[0]][bestMove.index[1]] === val);
    moves.push([bestMove.index[0], bestMove.index[1]]);
    bestMove = getBestMove(finalBoards, moves);
    printBestMove(bestMove);
  }
  console.log("Winner!")
  readline.close();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});