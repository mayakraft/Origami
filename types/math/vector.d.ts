export function magnitude(v: number[]): number;
export function magnitude2(v: [number, number] | [number, number, number]): number;
export function magnitude3(v: [number, number, number]): number;
export function magSquared2(v: [number, number] | [number, number, number]): number;
export function magSquared(v: number[]): number;
export function normalize(v: number[]): number[];
export function normalize2(v: [number, number] | [number, number, number]): [number, number];
export function normalize3(v: [number, number, number]): [number, number, number];
export function scale(v: number[], s: number): number[];
export function scale2(v: [number, number] | [number, number, number], s: number): [number, number];
export function scale3(v: [number, number, number], s: number): [number, number, number];
export function scaleNonUniform(v: number[], s: number[]): number[];
export function scaleNonUniform2(v: [number, number] | [number, number, number], s: [number, number] | [number, number, number]): [number, number];
export function scaleNonUniform3(v: [number, number, number], s: [number, number, number]): [number, number, number];
export function add(v: number[], u: number[]): number[];
export function add2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): [number, number];
export function add3(v: [number, number, number], u: [number, number, number]): [number, number, number];
export function subtract(v: number[], u: number[]): number[];
export function subtract2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): [number, number];
export function subtract3(v: [number, number, number], u: [number, number, number]): [number, number, number];
export function dot(v: number[], u: number[]): number;
export function dot2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): number;
export function dot3(v: [number, number, number], u: [number, number, number]): number;
export function midpoint(v: number[], u: number[]): number[];
export function midpoint2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): [number, number];
export function midpoint3(v: [number, number, number], u: [number, number, number]): [number, number, number];
export function average(...args: number[][]): number[];
export function average2(...vectors: [number, number][]): [number, number];
export function average3(...vectors: [number, number, number][]): [number, number, number];
export function lerp(v: number[], u: number[], t?: number): number[];
export function cross2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): number;
export function cross3(v: [number, number, number], u: [number, number, number]): [number, number, number];
export function distance(v: number[], u: number[]): number;
export function distance2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number]): number;
export function distance3(v: [number, number, number], u: [number, number, number]): number;
export function flip(v: number[]): number[];
export function flip2(v: [number, number] | [number, number, number]): [number, number];
export function flip3(v: [number, number, number]): [number, number, number];
export function rotate90(v: [number, number] | [number, number, number]): [number, number];
export function rotate270(v: [number, number] | [number, number, number]): [number, number];
export function degenerate(v: number[], epsilon?: number): boolean;
export function parallelNormalized(v: number[], u: number[], epsilon?: number): boolean;
export function parallel(v: number[], u: number[], epsilon?: number): boolean;
export function parallel2(v: [number, number] | [number, number, number], u: [number, number] | [number, number, number], epsilon?: number): boolean;
export function parallel3(v: [number, number, number], u: [number, number, number], epsilon?: number): boolean;
export function resize(dimension: number, vector: number[]): number[];
export function resize2(vector: number[]): [number, number];
export function resize3(vector: number[]): [number, number, number];
export function resizeUp(a: number[], b: number[]): number[][];
export function basisVectors2(vector?: [number, number] | [number, number, number]): [number, number][];
export function basisVectors3(vector?: [number, number, number]): [number, number, number][];
export function basisVectors(vector: number[]): number[][];