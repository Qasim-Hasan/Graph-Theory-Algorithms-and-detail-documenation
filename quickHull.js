document.addEventListener('DOMContentLoaded', function () {
const canvas = document.getElementById('myCanvas');
const canvasPadding = 20;
let timeoutCounter = 0;
let finalHull = [];
let monotoneClicked = false;
let timeBomb = 0;

function createHollowCircle(pointArray) {
  // Iterate through the array of points
  for (let i = 0; i < pointArray.length; i++) {
    // Extract x and y coordinates from the point object
    const x = pointArray[i].x;
    const y = pointArray[i].y;

    // Create a new Path.Circle with a radius of 5 pixels
    const circle = new paper.Path.Circle(new paper.Point(x, y), 15);

    circle.strokeColor = 'red';

    // Make the circle hollow by setting the fill color to transparent
    circle.fillColor = null;
  }
}

  let time = 1;
  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  canvas.style.width = '80vw';
  canvas.style.height = '80vh';
  canvas.style.paddingTop = '20px';
  canvas.style.paddingBottom = '20px';
  canvas.style.paddingLeft = '20px';
  canvas.style.paddingRight = '20px';

  canvas.willReadFrequently = true;

  let pointsArray = [];

  paper.setup(canvas);

  // Function to generate random points
  function generateRandom(count) {
    var points = [];
    for (var i = 0; i < count; i++) {
      var x = Math.random() * (paper.view.size.width - 2 * canvasPadding) + canvasPadding;
    var y = Math.random() * (paper.view.size.height - 2 * canvasPadding) + canvasPadding;
      points.push({ x: x, y: y });
    }
    return points;
  }

function drawLineWithTimeout(startPoint, endPoint, i, color) {
  timeoutCounter++; // Increment the counter when a timeout is set
  setTimeout(function () {
    var line = new paper.Path.Line(startPoint, endPoint);
    line.strokeColor = color || 'purple';
    line.strokeWidth = 2;

    // Store line details in an object
    var lineObject = {
      path: line,
      startPoint: startPoint,
      endPoint: endPoint
    };

    paper.view.draw(); // Draw the scene after adding the line

    timeoutCounter--; // Decrement the counter when the timeout is executed

    if (timeoutCounter === 0) {
      // All timeouts have been executed, perform any actions you need here
        createHollowCircle(finalHull);
    }
  }, 250 * i);
}

function eraseLine(startPoint, endPoint, i) {
  timeoutCounter++; // Increment the counter when a timeout is set
  setTimeout(function () {
    var line = new paper.Path.Line(startPoint, endPoint);
    line.strokeColor = 'white';
    line.strokeWidth = 4;

    // Make the line dotted
    line.dashArray = [12, 4]; // [dash length, gap length]

    paper.view.draw(); // Draw the scene after adding the line

    timeoutCounter--; // Decrement the counter when the timeout is executed

    if (timeoutCounter === 0) {
      // All timeouts have been executed, perform any actions you need here
            createHollowCircle(finalHull);
    }
  }, 250 * i);
}


function drawLines(points) {
    for (var i = 0; i < points.length - 1; i++) {
        var startPoint = new paper.Point(points[i].x, points[i].y);
        var endPoint = new paper.Point(points[i + 1].x, points[i + 1].y);
        drawLineWithTimeout(startPoint, endPoint, i);
    }
}

// Event listener for canvas click
canvas.addEventListener('click', function (event) {
  // Get the click coordinates relative to the canvas
  const clickX = event.clientX - canvas.getBoundingClientRect().left;
  const clickY = event.clientY - canvas.getBoundingClientRect().top;

  // Create a new point object
  const newPoint = { x: clickX, y: clickY };

  // Push the new point to the pointsArray
  pointsArray.push(newPoint);

  // Draw the new point on the canvas
  const point = new paper.Path.Circle(new paper.Point(newPoint.x, newPoint.y), 3);
  point.fillColor = 'blue';

  // Redraw the scene
  paper.view.draw();
});


function getOrientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
}

function distance(p, q, r) {
    const num = Math.abs((q.y - p.y) * r.x - (q.x - p.x) * r.y + q.x * p.y - q.y * p.x);
    const den = Math.sqrt(Math.pow(q.y - p.y, 2) + Math.pow(q.x - p.x, 2));
    return num / den;
}

function findHull(points, p, q, hull) {
    const n = points.length;
    if (n === 0) return;

    let idx = -1;
    let maxDist = 0;

    for (let i = 0; i < n; i++) {
        const d = distance(p, q, points[i]);
        if (d > maxDist) {
            maxDist = d;
            idx = i;
        }
    }

    if (idx === -1) return;

    const A = points[idx];
    hull.push(A);

    const s1 = [];
    const s2 = [];

    for (let i = 0; i < n; i++) {
        if (getOrientation(p, A, points[i]) === 1) {
            s1.push(points[i]);
        } else if (getOrientation(A, q, points[i]) === 1) {
            s2.push(points[i]);
        }
    }

    drawLineWithTimeout(A, q, time);
    drawLineWithTimeout(p, A, time);

    findHull(s1, p, A, hull);
    findHull(s2, A, q, hull);
}

function quickHull(points) {
    const n = points.length;
    if (n < 3) return points; // Convex hull is not possible with less than 3 points

    // Find the leftmost and rightmost points
    let leftmost = points[0];
    let rightmost = points[0];

    for (let i = 1; i < n; i++) {
        if (points[i].x < leftmost.x) {
            leftmost = points[i];
        }
        if (points[i].x > rightmost.x) {
            rightmost = points[i];
        }
    }

    const hull = [leftmost, rightmost];
    drawLineWithTimeout(leftmost, rightmost, time++);

    const s1 = [];
    const s2 = [];

    for (let i = 0; i < n; i++) {
        if (getOrientation(leftmost, rightmost, points[i]) === 1) {
            s1.push(points[i]);
        } else if (getOrientation(rightmost, leftmost, points[i]) === 1) {
            s2.push(points[i]);
        }
    }

    findHull(s1, leftmost, rightmost, hull);
    findHull(s2, rightmost, leftmost, hull);
    return hull;
}





        // Event listener for Quick button
        document.getElementById('quick').addEventListener('click', function() {
            finalHull = quickHull(pointsArray);

        });

        document.getElementById('random').addEventListener('click', function () {
        // Clear the canvas
        paper.project.clear();

        // Generate new random points
        pointsArray = generateRandom(50);

        for (var i = 0; i < pointsArray.length; i++) {
        var point = new paper.Path.Circle(new paper.Point(pointsArray[i].x, pointsArray[i].y), 3);
        point.fillColor = 'blue';
        }

        // Reset the finalHull array
        finalHull = [];
      });


        document.getElementById('clear').addEventListener('click', function () {
        // Clear the canvas
        paper.project.clear();

        // Generate new random points
        pointsArray = [];

        // Reset the finalHull array
        finalHull = [];
      });

  // Draw the scene
  paper.view.draw();
});
