import * as bases from './OrigamiBases';
// import * as math from '../lib/geometry';
import { Matrix, Vector } from '../lib/geometry';
import * as svg from '../lib/svg';
import * as fold from './Folder';

let math = {
	Matrix,
	Vector
}

export { default as View } from './View';
export { bases };
export { math };
export { svg };
export { fold };
