document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('myCanvas');
  const canvasPadding = 20;
let timeoutCounter = 0;
let finalHull = [];
let monotoneClicked = false;

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

// Function to find the orientation of three points (p, q, r)
// Returns:
// 0 - Collinear points
// 1 - Clockwise points
// 2 - Counterclockwise points
function orientation(p, q, r) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (val === 0) return 0; // Collinear
  return val > 0 ? 1 : 2; // Clockwise or Counterclockwise
}

// Function to find the point with the lowest y-coordinate
function findLowestYPoint(points) {
  let lowest = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].y < lowest.y || (points[i].y === lowest.y && points[i].x < lowest.x)) {
      lowest = points[i];
    }
  }
  return lowest;
}

// Function to sort points based on polar angle from the lowest y-coordinate point
function sortByPolarAngle(points, lowest) {
  return points.sort((a, b) => {
    const angleA = Math.atan2(a.y - lowest.y, a.x - lowest.x);
    const angleB = Math.atan2(b.y - lowest.y, b.x - lowest.x);
    return angleA - angleB;
  });
}

// Function to compute the convex hull using Graham's Scan algorithm
 function grahamScan(points) {
    if (points.length < 3) return points; // Convex hull is not possible with less than 3 points

  // Find the point with the lowest y-coordinate (and leftmost if ties)
  const lowest = findLowestYPoint(points);

  // Sort the points based on polar angle from the lowest point
  const sortedPoints = sortByPolarAngle(points, lowest);

  // Initialize the convex hull with the lowest and first two sorted points
  const hull = [lowest, sortedPoints[0], sortedPoints[1]];
  drawLineWithTimeout( sortedPoints[0], sortedPoints[1], 1)
    // Iterate through the sorted points to build the convex hull
    for (let i = 2; i < sortedPoints.length; i++) {
      while (
        hull.length > 1 &&
        orientation(hull[hull.length - 2], hull[hull.length - 1], sortedPoints[i]) !== 2
      ) {
        // Remove the last point from the hull if not counterclockwise
        eraseLine(hull[hull.length - 1], hull[hull.length - 2], i);
        hull.pop();
      }
      hull.push(sortedPoints[i]);
      drawLineWithTimeout(hull[hull.length -1], hull[hull.length -2], i);
    }

    drawLineWithTimeout( hull[hull.length -1], sortedPoints[0], pointsArray.length)
    return hull;
  }


        // Event listener for Graham button
        document.getElementById('graham').addEventListener('click', function() {
            finalHull = grahamScan(pointsArray);
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
