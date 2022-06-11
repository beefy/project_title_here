const fs = require('fs');
const { createCanvas } = require('canvas');
var perlin = require('perlin-noise');

var width = 625;
var height = 325;
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');
var rivers;

module.exports = {
  generate_terrain,
  write_to_image
}

function greyHex(value) {
  // bitwise OR. Gives value in the range 0-255
  // which is then converted to base 16 (hex).
  var v = (value*(256)|0).toString(16);
  return "#" + v + v + v;
}

function colorHex(value, x, y) {

  if(rivers[x][y] === 1) {
    return "#6663FF" // river
  }

  if(value < 0.3) {
    return "#03007B"; // deep water
  } else if(value < 0.55) {
    return "#6663FF"; // shallow water
  } else if(value < 0.6) {
    return "#BFBA07"  // beach
  } else if(value < 0.8) {
    return "#07A804" // field
  } else if(value < 0.9) {
    return "#0B5B02" // forest
  } else if(value < 0.95) {
    return "#787A6B"; // stone
  } else {
    return "#F8F8F8"; // snowwy mountain top
  }
}

function midpoint(point1, point2) {
    return [Math.floor((point1[0]+point2[0])/2), Math.floor((point1[1]+point2[1])/2)];
}

function create_ridge(points, iter, values) {
    if(iter <= 0) return;
    var cur_midpoint = midpoint(points[0], points[1]);
    var h = (values[points[0][0]][points[0][1]] + values[points[1][0]][points[1][1]])/2;
    var new_h = h + Math.random()-0.5;
    values[cur_midpoint[0]][cur_midpoint[1]] = new_h
    // iterate with new midpoints recursively
    var new_points = [
        midpoint(points[0], cur_midpoint),
        midpoint(points[1], cur_midpoint)
    ]
    create_ridge(new_points, iter-1, values);
}

// apply gaussian blur
function blur(size, values) {
  var new_values = values;
  var border = Math.floor(size/2);
  for(var lat = border; lat < width-border; lat++) {
      for(var long = border; long < height-border; long++) {
          // create filter of size <size>
          var filter = new Array();
          for(var x = -1*border; x < border+1; x++) {
            for(var y = -1*border; y < border+1; y++) {
              filter.push(values[lat+x][long+y]);
            }
          }
          // assign cell the average size of neighbors
          new_val = filter.reduce((a, b) => a + b, 0)/filter.length;
          if(new_val > 1) new_val = 0.999;
          if(new_val < 0) new_val = 0.001;
          new_values[lat][long] = new_val;
      }
  }

  return new_values;
}

function generate_terrain() {
  var noise = perlin.generatePerlinNoise(width, height);

  // create 2d array for the heightmap
  var values = new Array();
  var counter = 0;
  for(var lat = 0; lat < width; lat++) {
    values.push(new Array(height));
    for(var long = 0; long < height; long++) {
      if(Math.random > 0.99) {
          values[lat][long] = noise[counter]
      } else {
          values[lat][long] = 0
      }
      counter += 1;
    }
  }

  for(var x = 0; x < width; x++) {
      for(var y = 0; y < height; y++) {
          if(Math.random() > 0.5) create_ridge([[x, y], [0, 0]], 30, values)
          if(Math.random() > 0.5) create_ridge([[x, y], [width-1, height-1]], 30, values)
          if(Math.random() > 0.5) create_ridge([[x, y], [width-1, 0]], 30, values)
          if(Math.random() > 0.5) create_ridge([[x, y], [0, height-1]], 30, values)
          if(Math.random() > 0.5) create_ridge([[x, y], [
              Math.floor(Math.random()*(width-1)), 
              Math.floor(Math.random()*(height-1))
          ]], 30, values)
      }
  }

  values = blur(15, values);
  values = blur(3, values);
  values = blur(15, values);
  values = blur(15, values);

  // adjust values and strip border
  var border = Math.floor(50/2);
  var output = new Array();
  for(var lat = border; lat < width; lat++) {
    output.push(new Array())
    for(var long = border; long < height; long++) {
      var new_val = ((values[lat][long]*10)*-1)+1
      if(new_val > 1) new_val = 1;
      if(new_val < 0) new_val = 0;
      output[lat-border].push(new_val);
    }
  }

  width -= border*2;
  height -= border*2;

  // add river starting points
  rivers = new Array();
  var river_points = new Array();
  for(var x = 0; x < output.length; x++) {
    rivers.push(new Array());
    for(var y = 0; y < output[x].length; y++) {
      if(output[x][y] > 0.6 && Math.random() < 0.001) {
        rivers[x].push(1);
        river_points.push([x, y])
      } else {
        rivers[x].push(0);
      }
    }
  }

  // populate the rest of the rivers
  function make_river(point, iters) {
    var lowest_x;
    var lowest_y;
    var lowest_value = -1;
    var x = point[0];
    var y = point[1];

    if(iters > 30) return;

    // ignore borders
    if(x-1 < 0 || y-1 < 0 || x+1 > output.length || y+1 > output[0].length) return;

    // iterate neighbors and do gradient descent recursively
    neighbors = [
      [x-1, y-1], [x-1, y], [x-1, y+1],
      [x, y-1], [x, y], [x, y+1],
      [x+1, y-1], [x+1, y], [x+1, y+1],
    ]
    neighbors.forEach( (neighbor) => {
      if(output[neighbor[0]][neighbor[1]] < lowest_value) {
        lowest_value = output[neighbor[0]][neighbor[1]];
        lowest_x = neighbor[0];
        lowest_y = neighbor[1]
      }
    })

    // if(lowest_value > 0.6) return;

    rivers[lowest_x][lowest_y] = 1;
    make_river([lowest_x, lowest_y], iters+1);
  }

  river_points.forEach( (point) => {
    make_river(point, 0);
  });

  return output;
}

function write_to_image(values) {

  const canvas2 = createCanvas(width, height);
  const context2 = canvas2.getContext('2d');

  // write output to canvas
  for(var lat = 0; lat < width; lat++) {
    for(var long = 0; long < height; long++) {
        context2.fillStyle = colorHex(values[lat][long], lat, long);
        context2.fillRect(lat, long, 1, 1);
    }
  }

  const buffer2 = canvas2.toBuffer('image/png')
  fs.writeFileSync('./terrain.png', buffer2)
}
