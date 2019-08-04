
/**
 * this relates to one vertex in the graph.
 * what are all the ways that a single vertex can fail kawasaki's theorem for
 * flat foldability?
 * 1. not an even number of edges
 * 2. alternating sector angles don't add up to 180 each
 */


const example2 = {
  edges_vector: [[1, 0], [-.707, -.707], [.707, -.707]]
  is_flat: false,
  solutions: [
    
  ]
};

const example = {
  valid: false,
  reason: "odd", // "sectors"
  solutions: [
    [0.707, 0.707],
    undefined,
    [-0.866, 0.5]
  ],
};