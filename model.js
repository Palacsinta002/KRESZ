var model = (function() {
	function loadJsonp(url, callbackName) {
		if (document.location.protocol == 'file:') {
			// Create deferred
			var deferred = $.Deferred();

			// Register the callback
			window[callbackName] = function(data) {
				deferred.resolve(data);
			};

			// Set timeout (in case the callback is never called)
			setTimeout(function() {
				if (deferred.state() == 'pending') {
					deferred.reject();
				}
			}, 5000);

			// Include script
			var s = document.createElement('script');
			s.type = 'text/javascript';
			s.src = url;
			s.async = true;
			document.head.appendChild(s);

			// Attach cleanup function to the deferred
			deferred.always(function() {
				delete window[callbackName];
			});

			// Return promise
			return deferred.promise();
		} else {
			return $.ajax({url: url, jsonpCallback: callbackName, dataType: 'jsonp'});
		}
	}

	// Define data structure
	var cachedData = {
		categoryIndex: [],
		categoryObjects: {}
	};

	// 
	// Initialize
	//
	// Load categories
	var categoriesPromise = loadJsonp('data/jsonp/categories.js', 'callbackcategories')
	.done(function(categories) {
		cachedData.categoryIndex = categories; 
	})
	.fail(function() {
		alert('Failed to load test data. Application can\'t start.');
	});

	function Category(data) {
		$.extend(this, data);
		this.exTimeLimit = parseInt(data.exTimeLimit);
	}

	function Question(data, group) {
		this.assets = data.assets;
		this.choices = data.choices;
		this.correct = data.correct;
		this.id = data.id;
		this.question = data.question;
		this.group = group;

		this.selected = null;
		this.elapsedTime = 0;
	}
	Question.prototype.getMissedCount = function() {
		return (this.id in history) ? history[this.id].missed : 0;
	};
	Question.prototype.getCorrectCount = function() {
		return (this.id in history) ? history[this.id].correct : 0;
	};
	Question.prototype.isMarked = function() {
		return (this.id in history) ? history[this.id].marked : false;
	};
	Question.prototype.setMarked = function(value) {
		ensureQuestionInHistory(this);
		history[this.id].marked = value;
		saveHistory();
	};
	Question.prototype.randomizeChoiceOrder = function() {
		var correctAnswer = this.choices[this.correct];
		this.choices = this.choices.slice(0);
		shuffle(this.choices);
		for (var i in this.choices) {
			if (this.choices[i] === correctAnswer) {
				this.correct = i;
				break;
			}
		}
	};
	Question.prototype.selectChoice = function(i) {
		this.selected = i;

		ensureQuestionInHistory(this);
		if (this.selected == this.correct) {
			history[this.id].correct++;
		} else {
			history[this.id].missed++;
		}
		saveHistory();
	};
	Question.prototype.isCorrect = function() {
		return this.selected == this.correct;
	}

	function Test(questions, category) {
		this.questions = questions;
		this.category = category;
	}
	Test.prototype.getTotalScore = function() {
		return this.questions.reduce(function(val, question) {
			return val + (question.isCorrect() ? question.group.score : 0);
		}, 0);
	};
	Test.prototype.getMaxScore = function() {
		return this.questions.reduce(function(val, question) {
			return val + question.group.score;
		}, 0);
	};
	Test.prototype.getCorrectAnswers = function() {
		return this.questions.reduce(function(val, question) {
			return val + (question.isCorrect() ? 1 : 0);
		}, 0);
	};
	Test.prototype.getQuestionCount = function() {
		return this.questions.length;
	};
	Test.prototype.getPercentage = function() {
		return Math.round(this.getTotalScore() / this.getMaxScore() * 100);
	};
	Test.prototype.isPassed = function() {
		return this.getPercentage() >= this.category.masteryPercent;
	};

	var createResolvedPromise = function(data) {
		var promise = $.Deferred();
		promise.resolve(data);
		return promise;
	}

	var history = window.localStorage.getItem('questionHistory');
	history = history ? JSON.parse(history) : {};
	function saveHistory() {
		window.localStorage.setItem('questionHistory', JSON.stringify(history));
	}
	function addQuestionToHistory(question) {
		var entry = {
			id: question.id,
			groupId: question.group.id,
			categoryId: question.group.category.id,
			marked: false,
			correct: 0,
			missed: 0
		};
		
		history[question.id] = entry;
	}
	function ensureQuestionInHistory(question) {
		if (!(question.id in history)) {
			addQuestionToHistory(question);
		}
	}
	// http://bost.ocks.org/mike/shuffle/
	function shuffle(array) {
		var m = array.length, t, i;

		// While there remain elements to shuffle…
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);

			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		return array;
	}
	
	//
	// Public methods
	//
	return {
		loaded: categoriesPromise,
		getCategory: function(categoryId) {
			if (categoryId in cachedData.categoryObjects) {
				return createResolvedPromise(cachedData.categoryObjects[categoryId]);
			} else {
				return loadJsonp('data/jsonp/' + categoryId + '.js', 'callback' + categoryId)
				.then(function(data) {
					var object = new Category(data);
					cachedData.categoryObjects[categoryId] = object;
					return object;
				});
			}
		},
		getCategories: function() {
			// Return list of categories
			return cachedData.categoryIndex;
		},
		generateTest: function(category, settings, groups) {
			var filterFunction = null;
			if (settings.filter == 'new-only') {
				filterFunction = function(q) {
					return q.getMissedCount() == 0 && q.getCorrectCount() == 0;
				};
			} else if (settings.filter == 'missed-only') {
				filterFunction = function(q) {
					return q.getMissedCount() > 0;
				};
			} else if (settings.filter == 'marked-only') {
				filterFunction = function(q) {
					return q.isMarked();
				};
			} else if (settings.filter == 'missed-marked') {
				filterFunction = function(q) {
					return q.getMissedCount() > 0 || q.isMarked();
				};
			} else if (settings.filter == 'missed-marked-new') {
				filterFunction = function(q) {
					return q.getMissedCount() > 0 || q.isMarked() || (q.getMissedCount() == 0 && q.getCorrectCount() == 0);
				};
			}

			// Loop through each category and select questions
			var questions = $.map(category.groups, function(group) {
				if (!groups[group.id]) {
					// User doesn't want to receive questions from this group
					return [];
				}

				group.category = category;

				// Create question objects
				var questions = $.map(group.questions, function(qId) {
					return new Question(category.questions[qId], group);
				});

				// Filter the questions based on the settings criteria
				if (filterFunction !== null) {
					questions = questions.filter(filterFunction);
				}

				if (settings.prioritize) {
					// Sort by priority + random
					var questions = questions
					.map(function(question) {
						var baseWeight = 0;
						if (question.getCorrectCount() == 0) {
							baseWeight = question.getMissedCount() == 0 ? 0.4 : 0.5; // new / never got it right
						} else if (question.getMissedCount() > question.getCorrectCount()) {
							baseWeight = 0.3; // Didn't get right enough times
						} else if (question.isMarked()) {
							baseWeight = 0.2;
						}

						return {question: question, weight: baseWeight + Math.random()};
					})
					.sort(function(a, b) {
						// Sort descending by weight
						return b.weight - a.weight;
					})
					.map(function(o) {
						return o.question;
					});
				} else {
					// Randomize the order of questions (so we don't always select the first ones)
					shuffle(questions);
				}

				// Limit the number of questions
				if (settings.count == 'original') {
					questions = questions.slice(0, group.count);
				} else if (settings.count == 'fixed10') {
					questions = questions.slice(0, 10);
				}

				return questions;
			});

			if (settings.order == 'random') {
				// Randomize the order of questions (now globally, across categories)
				shuffle(questions);
			}

			// Now randomize the order of choices
			$.each(questions, function(i, question) {
				question.randomizeChoiceOrder();
			});

			return new Test(questions, category);
		},
		getStatistics: function() {
			var self = this;
			var aggregate = {};

			$.each(history, function(id, question) {
				if (!(question.categoryId in aggregate)) {
					aggregate[question.categoryId] = {};
				}
				var category = aggregate[question.categoryId];

				if (!(question.groupId in category)) {
					category[question.groupId] = {
						answered: 0, // Total number of answered questions
						right: 0,
						wrong: 0
					};
				}
				var group = category[question.groupId];

				if (question.correct || question.missed) {
					group.answered++;

					if (question.correct) {
						group.right++;
					}
					if (question.missed) {
						group.wrong++;
					}
				}
			});

			// Make sure we have every group in the category
			var result = [];
			var catPromises = $.map(aggregate, function(groups, categoryId) {
				return self.getCategory(categoryId)
				.then(function(category) {
					var entry = {
						category: category,
						groups: []
					};

					$.each(category.groups, function(id, group) {
						var groupResult = aggregate[category.id][group.id];

						entry.groups.push({
							group: group,
							answered: groupResult ? groupResult.answered : 0,
							right: groupResult ? groupResult.right : 0,
							wrong: groupResult ? groupResult.wrong : 0
						})
					});

					result.push(entry);
				});
			});

			return $.when.apply($, catPromises)
			.then(function() {
				return result.sort(function(a, b) {
					return a.category.id - b.category.id;
				});
			});
		}
	};
})();
