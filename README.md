# Dedupe-js

API for fuzzy deduplication of JSON arrays of objects.

Returns array of indexes of pairs, with similarity rating for each pair.

Uses [damerau-levenshtein](https://www.npmjs.com/package/damerau-levenshtein/)

### Usage

POST json to `/dedupe/` any array of javascript objects.

* documents: [{ array: 'of', objects: 'of', strings: ['or', 'arrays'] }, { ... }]
* fields: ['array', 'of', 'key', 'names']
* threshold: 0 (match everything that exists) to 1 (match nothing)
* missingValue: 0 (non-matching keys are ignored) to 1 (non-matching keys count as duplicate)

### Example

```javascript
Meteor.call('dedupe', [
		{a: "hello", b: "hello world"}, // 0
		{a: "hello", b: "byebye"}, // 1
		{a: "what?", b: "omg"}, // 2
		{a: "what?", c: "oMg"}, // 3
		{a: "hello", b: "hello world"}, // 4 
		{a: "hello", b: "byebyes"}, // 5
		{a: "hello", b: "byebyesi"}, // 6
		{a: "hello" } // 7
	], 
	['a', 'b'], //if falsey, uses all keys
	0.75, //default
	0.5, //default
	function(err, res){ console.log(err, res); });
```

Returns array of matching pairs:

```javascript
[
	{ x: 0, y: 4, similarity: 1 }, // 0 and 4 exact match
	{ x: 0, y: 7, similarity: 0.75 }, // 0 matches 7 on 1 key and 0.5 for missing gives (1.5 / 2) = 0.75
	{ x: 1, y: 5, similarity: 0.9299999999999999 }, // 1 and 5, close match
	{ x: 1, y: 6, similarity: 0.875 }, // 1 and 6, not as close
	{ x: 1, y: 7, similarity: 0.75 }, // etc
	{ x: 2, y: 3, similarity: 0.75 },
	{ x: 4, y: 7, similarity: 0.75 },
	{ x: 5, y: 6, similarity: 0.94 }, // 5 and 6, quite close too
	{ x: 5, y: 7, similarity: 0.75 },
	{ x: 6, y: 7, similarity: 0.75 }
]
```

Comparison is one-dimensional so `{ x: 0, y: 4 }` is the same pair as `{ x: 4, y: 0 }`. Only one item for each pair is provided.

### Notes

* Built as meteor project for convenience only, basic node javascript is core of the code, see `/server/dedupe.js` for logic.

### TODO

* Dam-lev is fairly simple, quite limited... Importing [clj-fuzzy](https://www.npmjs.com/package/clj-fuzzy) for alternative match algorithms, but needs integrating.
* Test for performance and upper bounds for record sizes and counts.
* Add test suite