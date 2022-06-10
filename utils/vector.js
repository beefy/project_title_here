const dot_prod = (v1, v2) => v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
const cross_prod = (v1, v2) => (
    {x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x}
);

// https://en.wikipedia.org/wiki/Spherical_coordinate_system
// generate the line element for a displacement from
// (height, lat, long) to (height + dheight, lat + dlat, long + dlong)

// local orthogonal unit vectors in the directions of increasing height, lat, long
// ^height = sin(lat)*cos(long)*^x + sin(lat)*cos(long)*^y + cos(lat)*^z
// ^lat    = cos(lat)*cos(long)*^x + cos(lat)*sin(long)*^y - sin(lat)*^z
// ^long   = -sin(long)*^x + cos(long)*^y
// where ^x, ^y, ^z are the unit vectors in cartesian coordinates

// In our case, height remains constant when moving around the sphere.
// Perhaps when height maps/terrain on the sphere is added this will
// be reconsidered

// However! We don't want to use ^x, ^y, ^z because then we will
// have to store both cartesian and polar coordinates. Instead we want
// everything in polar coordinates. So instead of using the *line element*
// we want to use the *surface element* spanning from lat to lat + dlat and
// long to long + dlong on a spherical surface at constant radius height
// https://wikimedia.org/api/rest_v1/media/math/render/svg/80362b061d72199228f100923ad7957e340bcef4
// with height = 1
// = |cross(^lat, sin(lat*^long))|

// However! If we want to use terrain then height does not remain constant
// so we want to find the *volume element* spanning from height to height + dheight,
// lat to lat + dlet, and long to long + dlong which is the determinant of the
// Jacobian matrix of partial derivatives:
// https://wikimedia.org/api/rest_v1/media/math/render/svg/5b5b793dc864c0016f83bd137ebb9a4720d80d94
// https://wikimedia.org/api/rest_v1/media/math/render/svg/858b36ce1577f1133ecd96c49b15b7a22fd44c29

var lat = Math.PI;
var long = Math.PI;
var height = 1;
const jacobian_matrix = (lat, long, height) => {return [
    [Math.sin(lat)*Math.cos(long), height*Math.cos(lat)*Math.cos(long), -1*height*Math.sin(lat)*Math.sin(long)],
    [Math.sin(lat)*Math.sin(long), height*Math.cos(lat)*Math.sin(long), height*Math.sin(lat)*Math.cos(long)],
    [Math.cos(lat), -1*height*Math.sin(lat), 0]
]};
