/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";

/**
 * @description perform a cube root but preserve the sign of the input
 * @param {number} n
 * @returns {number}
 */
const cubeRootSigned = (n) => (n < 0 ? -((-n) ** (1 / 3)) : n ** (1 / 3));

/**
 * @description This polynomial solver will solve anything polynomial up
 * to a degree 3 (cubic, via Cardano's formula). Polynomial is inputted via an
 * array of its coefficients, which includes the constant, in order from
 * lowest to highest. Index 0 is the constant, index 1 is for x, index 2 is
 * for x^2, index 3 is for x^3. As many items as exists in the polynomial.
 * To solve a quadratic: supply [c, b, a], where a is the x^2 coeff.
 * To solve a cubic: supply [d, c, b, a], where a is the x^3 coeff.
 * @param {number[]} coefficients a list of coefficients to the polynomial
 * @returns {[]|[number]|[number,number]|[number,number,number]}
 * a solution array with either zero, one, two, or three numbers.
 */
export const polynomialSolver = (coefficients) => {
	const [a, b, c, d] = coefficients;

	// the degree of the polynomial is the length of the array - 1,
	// because the constant is included as the last element.
	switch (coefficients.length) {
		case 2:
			return [-a / b];
		case 3: {
			// quadratic
			const discriminant = b ** 2 - 4 * a * c;

			// no solution
			if (discriminant < -EPSILON) {
				return [];
			}

			// one solution
			const q1 = -b / (2 * c);
			if (discriminant < EPSILON) {
				return [q1];
			}

			// two solutions
			const q2 = Math.sqrt(discriminant) / (2 * c);
			return [q1 + q2, q1 - q2];
		}
		case 4: {
			// cubic: Cardano's formula
			const a2 = c / d;
			const a1 = b / d;
			const a0 = a / d;
			const q = (3 * a1 - a2 ** 2) / 9;
			const r = (9 * a2 * a1 - 27 * a0 - 2 * a2 ** 3) / 54;
			const d0 = q ** 3 + r ** 2;
			const u = -a2 / 3;

			// one solution
			if (d0 > 0) {
				const sqrt_d0 = Math.sqrt(d0);
				const s = cubeRootSigned(r + sqrt_d0);
				const t = cubeRootSigned(r - sqrt_d0);
				return [u + s + t];
			}

			// two solutions
			if (Math.abs(d0) < EPSILON) {
				// if r is negative, s will be NaN
				if (r < 0) {
					return [];
				}
				const s = r ** (1 / 3);
				return [u + 2 * s, u - s];
			}

			// three solutions
			const sqrt_d0 = Math.sqrt(-d0);
			const phi = Math.atan2(sqrt_d0, r) / 3;
			const r_s = (r ** 2 - d0) ** (1 / 6);
			const s_r = r_s * Math.cos(phi);
			const s_i = r_s * Math.sin(phi);
			return [u + 2 * s_r, u - s_r - Math.sqrt(3) * s_i, u - s_r + Math.sqrt(3) * s_i];
		}
		default:
			return [];
	}
};
