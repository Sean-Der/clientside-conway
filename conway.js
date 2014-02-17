window.onload = function() {
  const PIXELS_PER_CELL = 10; //jshint ignore:line
  var canvas          = document.getElementById("conwayCanvas"),
      canvas_context  = canvas.getContext("2d"),
      worker          = new Worker('./worker.js'),
      getEventCell    = function(e) {
        return ((Math.floor((e.pageX - canvas.offsetLeft) / PIXELS_PER_CELL) * rowsTotal) +
               (Math.floor((e.pageY - canvas.offsetTop) / PIXELS_PER_CELL)));
      },
      canvasX, canvasY, gridInit, rowsTotal, timeoutHandle, dragP;

  canvas.addEventListener('mousedown', function(e) {
    if (gridInit) {
      worker.postMessage({event: 'CLICK', cell: getEventCell(e)});
      dragP = true;
    }
  });
  canvas.addEventListener('mousemove', function(e) {
    if (dragP) {
      worker.postMessage({event: 'DRAG', cell: getEventCell(e)});
    }
  });

  document.addEventListener('mouseup', function(e) {
    dragP = false;
  });

  document.getElementById('init').addEventListener('click', function() {
    canvasX    = parseInt(document.getElementById('X').value, 10);
    canvasY    = parseInt(document.getElementById('Y').value, 10);
    if(isNaN(canvasX) || isNaN(canvasY)) {
      throw 'Invalid input';
    }
    rowsTotal     = canvasY / PIXELS_PER_CELL;
    canvas.width  = canvasX;
    canvas.height = canvasY;
    worker.postMessage({event: 'INIT',
                        rowsTotal: rowsTotal,
                        columnsTotal: (canvasX / PIXELS_PER_CELL)});
    for (var i = 0.5; i < canvasY; i += PIXELS_PER_CELL) {
      canvas_context.moveTo(0, i);
      canvas_context.lineTo(canvasX, i);
    }
    for (i = 0.5; i < canvasX; i += PIXELS_PER_CELL) {
      canvas_context.moveTo(i, 0);
      canvas_context.lineTo(i, canvasY);
    }
    canvas_context.strokeStyle = "#eee";
    canvas_context.stroke();
    gridInit = true;
  });

  document.getElementById('pause').addEventListener('click', function() {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
    timeoutHandle = null;
  });

  document.getElementById('run').addEventListener('click', function() {
    var iterationsEl = document.getElementById('iterations'),
        timeout = parseInt(document.getElementById('timeout').value),
        iterations = 0,
        timeoutLoop = function() {
          iterations =  parseInt(iterationsEl.value);
          if  (iterations && iterations > 0) {
            iterationsEl.value = iterations - 1;
            worker.postMessage({event: 'TICK'});
            timeoutHandle = setTimeout(timeoutLoop, timeout);
          }
        };
    if (gridInit && !timeoutHandle) {
      timeoutLoop();
    }
  });

  worker.addEventListener('message', function(e) {
    var curRow, curColumn;
    for (var i in e.data) {
      curColumn = Math.floor(i / rowsTotal);
      curRow = i - (rowsTotal * curColumn);
      canvas_context.fillStyle = (e.data[i])?"#000":"#FFF";
      canvas_context.fillRect(curColumn * PIXELS_PER_CELL + 1,
                              curRow * PIXELS_PER_CELL + 1,
                              PIXELS_PER_CELL - 2,
                              PIXELS_PER_CELL - 2);
    }
  });
};

