// https://www.npmjs.com/package/damerau-levenshtein/
import dl from "damerau-levenshtein";

// https://www.npmjs.com/package/clj-fuzzy
import fuzzy from "clj-fuzzy";

Meteor.methods({
	'dedupe': function(arr, fields, threshold, missingValue) {
		arr = (arr instanceof Array && arr.length && arr) || [];
		fields = (fields instanceof Array && fields.length && fields) || [];

		// Limits range of considered duplicate pairs
		threshold = (typeof threshold == 'number' ? threshold : 0.75);
		// Allows missing fields to contribute, balance
		missingValue = (typeof missingValue == 'number' ? missingValue : 0.5);

		
		// const checkFields = fields.reduce((o, x) => ((o[x] = true) && o), {});
		// console.log(fields, checkFields);

		if(arr.length) {
			// let columns = {};

			const objects = arr.map(function(curr, pos) {
				const keys = ((fields.length && fields) || Object.keys(curr));
				return keys.reduce(function(o, key) {
					// let val = undefined;
					if(key in curr) {
						o[key] = (curr[key] instanceof Array ? curr[key].join(' ') : curr[key]);
						// val = o[key];
					}

					// if(!columns[key]) {
					// 	columns[key] = [];
					// }
					// columns[key][pos] = val;

					return o;
				}, {});
			});

			let ratings = [];

			for(let i = 0; i < objects.length - 1; i++) {
				for(let j = (i + 1); j < objects.length; j++) {
					if(i != j && !(ratings[j] && ratings[j][i])) {

						const a = objects[i];
						const b = objects[j];

						for(const key in a) {
							if(!ratings) {
								ratings = [];
							}
							if(!ratings[i]) {
								ratings[i] = [];
							}
							
							// console.log(key, i, j, a[key], b[key]);
							const sims = ((a[key] && b[key] && dl(a[key], b[key])) || false);
							ratings[i][j] = ratings[i][j] || [];
							if(sims) {
								ratings[i][j].push((sims.similarity === 0 ? 0 : (Math.round(sims.similarity*100) / 100)) || 0);
							} else {
								ratings[i][j].push(missingValue);
							}
							//console.log(ratings[key][i][j]);
						}
					}
				}
			}

			//Have an array of 'cleaned' objects
			//console.log(objects);
			//console.log(ratings);

			const sum = function(pre, curr) {
				return pre += curr;
			};
			const average = function(x) {
				return (x && (x.reduce(sum, 0) / x.length)) || 0;
			};

			const averages = ratings.map(function(rating) {
				return rating.map(average);
			});
			//console.log(averages);

			const pairs = averages.reduce(function(pre, avgs, oPos) {
				avgs.filter(function(avg, iPos) {
					if(avg >= threshold) {
						pre.push({
							x: oPos,
							y: iPos,
							similarity: avg,
							//a: arr[iPos],
							//b: arr[oPos]
						});
					}
				});
				return pre;
			}, []);

			console.log(pairs);
			return pairs;
		}
	}
});

//Meteor.call('dedupe', [{a: "hello", b: "hello world"}, {a: "hello", b: "byebye"}, {a: "what?",b: "omg"}], ['a', 'b'], function(err, res){ console.log(err, res); })