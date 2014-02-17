const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],  //jshint ignore:line
      DIRECTIONS_LENGTH = DIRECTIONS.length;
var aliveCells = [],
    rowsTotal,
    columnsTotal,
    computeDelta = function() {
      var newAliveCells = aliveCells.slice(),
          delta = [],
          deadCheckedCache = [],
          getStitchedCord = function(cord, direction) {
            var curColumn = Math.floor(cord / rowsTotal),
                curRow = cord - (rowsTotal * curColumn);
            switch(direction) {
              case 'N':  return (curRow === 0)?(cord + rowsTotal -1):(cord-1);
              case 'S':  return (curRow === rowsTotal)?(cord - rowsTotal + 1):(cord+1);
              case 'E':  return (curColumn === (columnsTotal - 1))?(curRow):(cord + rowsTotal);
              case 'W':  return (curColumn === 0)?(((rowsTotal * columnsTotal) - rowsTotal) + curRow):(cord - rowsTotal);
              case 'NE': return getStitchedCord(getStitchedCord(cord, 'E'), 'N');
              case 'SE': return getStitchedCord(getStitchedCord(cord, 'E'), 'S');
              case 'NW': return getStitchedCord(getStitchedCord(cord, 'W'), 'N');
              case 'SW': return getStitchedCord(getStitchedCord(cord, 'W'), 'S');
            }
          }, hits, stitchedCord, hits2;
      for (var cord in aliveCells) {
        cord = parseInt(cord, 10);
        getStitchedCord(cord, 'N');
        hits = 0;
        for(var j = 0; j < DIRECTIONS_LENGTH; j++) {
          stitchedCord = getStitchedCord(cord, DIRECTIONS[j]);
          if (aliveCells[stitchedCord]) {
            hits++;
          } else if (!deadCheckedCache[stitchedCord]) {
            hits2 = 0;
            for(var k = 0; k < DIRECTIONS_LENGTH; k++) {
              if (stitchedCord === 602) {
              }
              if (aliveCells[getStitchedCord(stitchedCord, DIRECTIONS[k])]){
                hits2++;
              }
            }
            if (hits2 === 3) {
               newAliveCells[stitchedCord] = delta[stitchedCord] = true;
            }
            deadCheckedCache[stitchedCord] = true;
          }
        }
        if (hits === 2 || hits === 3) {
          newAliveCells[cord] = true;
        } else {
          delete newAliveCells[cord];
        }
        if (newAliveCells[cord] !== aliveCells[cord]) {
          delta[cord] = newAliveCells[cord];
        }
      }
      aliveCells = newAliveCells.slice();
      return delta;
    };

self.addEventListener('message', function(e) {
  var payload = [],
      validCell = function(cell) {
        return (cell >= 0 && cell < (rowsTotal * columnsTotal));
      };
  switch(e.data.event) {
  case 'CLICK':
    if (!validCell(e.data.cell)) {
      break;
    }
    if (aliveCells[e.data.cell]) {
      delete aliveCells[e.data.cell];
      payload[e.data.cell] = false;
    } else {
       payload[e.data.cell] = aliveCells[e.data.cell] = true;
    }
    break;
  case 'DRAG':
    if (!validCell(e.data.cell)) {
      break;
    }
    if (!aliveCells[e.data.cell]) {
      payload[e.data.cell] = aliveCells[e.data.cell] = true;
    }
    break;
  case 'TICK':
    payload = computeDelta();
    break;
  case 'INIT':
    rowsTotal = e.data.rowsTotal;
    columnsTotal = e.data.columnsTotal;
    aliveCells = [];
    break;
  default:
    throw 'Bad fall through';
  }
  self.postMessage(payload);
});
