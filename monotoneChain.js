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


// Function to compute the cross product of vectors (p1, p2) and (p1, p3)
function crossProduct(p1, p2, p3) {
    return (p2.y - p1.y) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.y - p1.y);
}

// Function to sort points lexicographically
function sortPoints(points) {
    return points.sort((a, b) => a.x - b.x || a.y - b.y);
}

// Andrew's monotone chain convex hull algorithm
function convexHull(points) {
    // Sort points lexicographically
    points = sortPoints(points);

    // Build upper hull
    const upperHull = [];
    for (let i = 0; i < points.length; i++) {
        while (upperHull.length >= 2 && crossProduct(
            upperHull[upperHull.length - 2],
            upperHull[upperHull.length - 1],
            points[i]) <= 0) {
            eraseLine(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], upperHull.length - 1);
            upperHull.pop();
        }
        upperHull.push(points[i]);
        drawLineWithTimeout(upperHull[upperHull.length - 2], upperHull[upperHull.length - 1], upperHull.length - 1, "purple");
    }

    // Build lower hull
    const lowerHull = [];
    for (let i = points.length - 1; i >= 0; i--) {
        while (lowerHull.length >= 2 && crossProduct(
            lowerHull[lowerHull.length - 2],
            lowerHull[lowerHull.length - 1],
            points[i]) <= 0) {
            eraseLine(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], lowerHull.length - 1);
            lowerHull.pop();
        }
        lowerHull.push(points[i]);
        drawLineWithTimeout(lowerHull[lowerHull.length - 2], lowerHull[lowerHull.length - 1], lowerHull.length - 1, "orange");
    }

    // Remove duplicate points (start and end points of upper and lower hulls)
    eraseLine(lowerHull[lowerHull.length-1], lowerHull[lowerHull.length], lowerHull.length);
    eraseLine(upperHull[upperHull.length-1], upperHull[upperHull.length], upperHull.length);
    lowerHull.pop();
    upperHull.pop();

    // Combine upper and lower hulls to form the convex hull
    return upperHull.concat(lowerHull);
}






        // Event listener for Quick button
        document.getElementById('monotone').addEventListener('click', function() {
            finalHull = convexHull(pointsArray);

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
