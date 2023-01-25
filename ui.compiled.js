	//
	// Disclaimer: This is my first time using React, I'm using this project to
	// experiment with this framework, so please forgive me for my code.
	// Also, I really should spend time on practicing these questions, rather than
	// writing this mini application. :D But all contribution and feedback is
	// welcome.
	//

	// Source: http://coenraets.org/blog/2014/12/animated-page-transitions-with-react-js/
	var router = (function () {
		"use strict";

		var routes = [];

		function addRoute(route, handler) {
			routes.push({parts: route.split('/'), handler: handler});
		}

		function load(route) {
			window.location.hash = route;
		}

		function start() {
			var path = window.location.hash.substr(1),
				parts = path.split('/'),
				partsLength = parts.length;

			for (var i = 0; i < routes.length; i++) {
				var route = routes[i];
				if (route.parts.length === partsLength) {
					var params = [];
					for (var j = 0; j < partsLength; j++) {
						if (route.parts[j].substr(0, 1) === ':') {
							params.push(parts[j]);
						} else if (route.parts[j] !== parts[j]) {
							break;
						}
					}
					if (j === partsLength) {
						route.handler.apply(undefined, params);
						return;
					}
				}
			}
		}

		window.onhashchange = start;

		return {
			addRoute: addRoute,
			load: load,
			start: start
		};
	}());

	// Source: http://coenraets.org/blog/2014/12/animated-page-transitions-with-react-js/
	var PageSlider = {
		getInitialState: function () {
			return {
				history: [],
				pages: [],
				animating: false
			}
		},
		componentDidUpdate: function() {
			// var skippedCurrentFrame = false,
			// 	pageEl = this.getDOMNode().lastChild,
			// 	pages = this.state.pages,
			// 	l = pages.length,
			// 	transitionEndHandler = function() {
			// 		pageEl.removeEventListener('webkitTransitionEnd', transitionEndHandler);
			// 		pages.shift();
			// 		this.setState({pages: pages});
			// 	}.bind(this),
			// 	animate = function() {
			// 		if (!skippedCurrentFrame) {
			// 			skippedCurrentFrame = true;
			// 			requestAnimationFrame(animate.bind(this));
			// 		} else if (l > 0) {
			// 			// pages[l - 1].props.position = "center transition";
			// 			pages[l - 1].position = "page-center page-transition";
			// 			this.setState({pages: pages, animating: false});
			// 			pageEl.addEventListener('webkitTransitionEnd', transitionEndHandler);
			// 		}
			// 	};

			// if (this.state.animating) {
			// 	requestAnimationFrame(animate.bind(this));
			// }
		},
		slidePage: function (page) {
			// var history = this.state.history,
			// 	pages = this.state.pages,
			// 	l = history.length,
			// 	hash = window.location.hash,
			// 	position = "page-center";

			// if (l === 0) {
			// 	history.push(hash);
			// } else if (hash === history[l - 2]) {
			// 	history.pop();
			// 	position = "page-left";
			// } else {
			// 	history.push(hash);
			// 	position = "page-right";
			// }

			// pages.push({page: page, position: position});

			// this.setState({history: history, pages: pages, animating: position!=="page-center"});
			this.setState({pages: [{page: page, position: ''}]})
		},
		render: function () {
			var content = this.state.pages.map(function(item, i) {
				return (
					React.createElement("div", {className: "page " + item.position, key: i}, 
						React.createElement("div", {className: "container"}, 
							item.page
						)
					)
				);
			});

			return (
				React.createElement("div", {className: "pageslider-container"}, 
					content
				)
			);
		}
	};

	var App = React.createClass({displayName: 'App',
		componentDidMount: function() {
			$(React.findDOMNode(this)).find('.button-collapse').sideNav();
		},
		render: function() {
			return (
				React.createElement("div", null, 
					React.createElement("nav", {className: "teal lighten-1", role: "navigation"}, 
						React.createElement("div", {className: "nav-wrapper container"}, React.createElement("a", {id: "logo-container", href: "#", className: "brand-logo"}, "KRESZ teszt"), 
							React.createElement("ul", {className: "right hide-on-med-and-down"}, 
								React.createElement("li", null, React.createElement("a", {href: "#"}, "Új teszt")), 
								React.createElement("li", null, React.createElement("a", {href: "#info"}, "Infó")), 
								React.createElement("li", null, React.createElement("a", {href: "#statistics"}, "Statisztika"))
							), 
							React.createElement("ul", {id: "nav-mobile", className: "side-nav"}, 
								React.createElement("li", null, React.createElement("a", {href: "#"}, "Új teszt")), 
								React.createElement("li", null, React.createElement("a", {href: "#info"}, "Infó")), 
								React.createElement("li", null, React.createElement("a", {href: "#statistics"}, "Statisztika"))
							), 
							React.createElement("a", {href: "#", 'data-activates': "nav-mobile", className: "button-collapse"}, React.createElement("i", {className: "mdi-navigation-menu"}))
						)
					), 

					React.createElement(Content, null)
				)
			);
		}
	});

	var Content = React.createClass({displayName: 'Content',
		mixins: [PageSlider],
		componentDidMount: function() {
			router.addRoute('', function() {
				this.slidePage(React.createElement(WelcomePage, {key: "home"}));
			}.bind(this));
			router.addRoute('info', function() {
				this.slidePage(React.createElement(InfoPage, {key: "info"}));
			}.bind(this));
			router.addRoute('category/:categoryId', function(categoryId) {
				this.slidePage(React.createElement(Tester, {key: categoryId, categoryId: categoryId}));
			}.bind(this));
			router.addRoute('statistics', function() {
				this.slidePage(React.createElement(Statistics, {key: "stats"}));
			}.bind(this));
			
			router.start();
		}
	});

	var navigate = function(where) {

	}

	var WelcomePage = React.createClass({displayName: 'WelcomePage',
		componentDidMount: function() {
			var self = this;
			// This is a temporary hack
			if (Object.keys(model.getCategories()).length == 0) {
				setTimeout(function() {
					// Force update after 2 seconds, the list of categories is probably loaded by that time
					self.forceUpdate();
				}, 2000);
			}
		},
		render: function () {
			var self = this;

			var categoriesHtml = $.map(model.getCategories(), function (category) {
				return (
					React.createElement("a", {className: "collection-item", href: '#category/' + category.id, key: category.id}, category.title)
				);
			});

			var categoryTestsHtml = $.map(model.getCategories(), function (category) {
				return (
					React.createElement("a", {className: "collection-item", href: 'tests/' + category.id + '.html', key: category.id}, category.title)
				);
			});

			return (
				React.createElement("div", null, 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, React.createElement("h4", null, "KRESZ teszt")), 
							React.createElement("p", null, 
								"Üdv a KRESZ teszt alkalmazásban! Itt felkészülhetsz a KRESZ vizsgádra a megújult 2015-ös vizsga valós kérdéseivel." + ' ' +
								"További információ a tesztről, a kérdésekről és az alkalmazásról az ", React.createElement("a", {href: "#info"}, React.createElement("strong", null, "Infó")), " oldalon.", 
								React.createElement("br", null), React.createElement("br", null), 
								"A kérdésadatbázis a szakoe.hu oldalról származik, annak szerzői jogaival a E-Educatio Információtechnológia Zrt. rendelkezik.", 
								React.createElement("br", null), React.createElement("br", null), 
								"E-mail: ujkreszteszt (a) gmail.com"
							)
						)
					), 

					React.createElement("div", {className: "collection with-header card"}, 
						React.createElement("div", {className: "collection-header"}, React.createElement("strong", null, "Teszt indítása – Válassz kategóriát!")), 
						categoriesHtml
					), 

					React.createElement("div", {className: "collection with-header card"}, 
						React.createElement("div", {className: "collection-header"}, React.createElement("strong", null, "Kérdésbank böngészése"), React.createElement("br", null), "Böngészd az egyes kategóriák teljes kérdésbankját (az összes kérdést)."), 
						categoryTestsHtml
					)
				)
			);
		}
	});

	var InfoPage = React.createClass({displayName: 'InfoPage',
		render: function () {
			return (
				React.createElement("div", null, 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, React.createElement("h4", null, "A KRESZ vizsgáról")), 
							React.createElement("p", null, "A KRESZ vizsga egy feletválasztós teszt, azaz minden kérdésnél több lehetséges megoldás közül kell kiválasztani a helyeset. Egy kérdés megválaszolására 60 másodperc (1 perc) áll rendelkezésre. A teszt kategóriától függően 55 (A - motor, B - személygépkocsi) vagy 25 (\"nagy kategóriák\") kérdésből áll, melyek 1 vagy 3 pontot érnek. A legtöbb kérdés 1 pontot ér, de van 10 ill. 5 db. úgynevezett \"képes kérdés\" - melyek forgalmi helyzetek felismerésére vonatkoznak - amik 3 pontot érnek. Így összesen 75 ill. 35 pont érhető el, melyből legalább 66 ill. 30 pontot kell elérni a sikeres vizsgához.")
						)
					), 

					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, React.createElement("h4", null, "Az alkalmazásról")), 
							React.createElement("p", null, "2015 elején megújult a KRESZ teszt, frissítették a tesztanyagot, kibővült a kérdésbank, és lecserélték a retró képeket napjaink elvárásának megfelelőre. A bevezetés kicsit gyorsra sikerült, ezért nem sikerült a meglévő segédanyagok frissítése. Látva a tanulók és oktatók nehéz helyzetét (nem lehet tudni, hogy pontosan miből kell felkészülni, mert se up to date segédanyagok, se a kérdések nem állnak rendelkezésre) a SZAKOE (Szakoktatók Országos Érdekképviseleti Egyesülete) megegyezett a vizsgakérdések tulajdonosával, hogy tegye elérhetővé a kérdéseket teszt formában. Ez igen hasznosnak bizonyult, azonban a kialakított felületre több negatív visszajelzés érkezett: ismétlődő kérdések, nehézkes használat, nem lehet egy kérdést 60 másodpercnél tovább nézni (gyakorlás céljából sem), nem elérhető mobilról (csak flash-sel rendelkező eszközről), egyes esetekben nem működik stb."), 
							React.createElement("br", null), 
							React.createElement("p", null, "Magam is hasonlókkal szembesültem, ezért a felkészülésemhez elkészítettem ezt a programot, ami a fenti hibákat próbálja orvosolni. Ugyanabból az adatbázisból dolgozik, ezért elvileg az összes KRESZ vizsgán előforduló kérdés megtalálható benne. A felület úgy lett kialakítva, hogy minél jobban segítse a felkészülést a tesztre: a tudás felmérését, a teljes kérdésbank megismerését, a hibás válaszokból való tanulást. Az alkalmazás HTML alapú, így mobilon is jól használható. A program két móddal rendelkezik."), 
							React.createElement("br", null), 
							React.createElement("p", null, "Az első a teljese kérdésbank megtekintése. Erre kattintva az adott kategóriához kapcsolódó összes kérdés megjelenik a helyes válasszal együtt. Így utána lehet nézni egyes témaköröknek, amit ez ember még kevésbé sajátított el."), 
							React.createElement("br", null), 
							React.createElement("p", null, "A másik mód a teszt mód. Ekkor az alkalmazás - különböző beállítások alapján - egy kérdéssort állít össze, amit meg kell válaszolni. Alap beállítás során előtérbe helyeződnek az új kérdések (hogy minél több kérdést megismerjünk) illetve a rontott kérdések (segíti memorizálni a helyes választ). Az egyes kérdések mellett mindig megjelenik egy csillag gomb, amivel a fontosabb/nehezebb kérdéseket meg lehet jelölni. A kérdéssor összeállításánál ezek is prioritást élveznek, és külön is elő lehet hívni őket. Minden kérdés megválaszolására 60 másodperc áll rendelkezésre, azonban a program - ellentétben a vizsgaszoftverrel - ennek lejárta után nem léptet tovább a következő kérdésre. Ez a gyakorlást szolgálja. A válasz megjelölése után rögtön láthatóvá válik a helyes megoldás - így rögtön látható a hibás válasz, és memorizálni lehet a helyeset.")
						)
					), 

					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, React.createElement("h4", null, "Javasolt tanulási módszer")), 
							React.createElement("p", null, "Az alábbiakban a saját KRESZ vizsgámhoz használt módszert írom le, mellyel hibátlan eredményt értem el."), 
							React.createElement("ol", null, 
								React.createElement("li", null, "A sikeres KRESZ vizsga legjobb garanciája a pontos tudás, melyet a legkönnyebben a KRESZ tanfolyamon való odafigyeléssel lehet elsajátítani. Tapasztalatból mondom, hogy érdemes odafigyelni, mert egyrészt így lehet a leggyorsabban elsajátítani a szükséges tudást, másrészt a megszerzett ismeretek egy egész életre jó alapot jelentenek."), 

								React.createElement("li", null, "A KRESZ tanfolyam közben és után érdemes pár (vagy több :) ) KRESZ teszt megoldásával kezdeni. Ha hibásan válaszolsz, semmi gond, próbáld meg megmorizálni a helyes választ, majd amikor a program legközelebb ugyanazt a kérdést dobbja (ezt direkt megteszi), akkor már jól tudsz válaszolni, és így rögzül a helyes megoldás. Ha egy kérdésre jól válaszolsz, de mégis úgy érzed, hogy gyakorolni kéne még, akkor kattints rá mellette a csillagra, így meg tudod jelölni."), 

								React.createElement("li", null, "Ha már sok tesztet megoldottál, látogass el a ", React.createElement("i", null, "Statisztikák"), " fülre. Itt látni fogod, hogy hogyan állsz az egyes témakörökkel, mi az amire érdemes ráfeküdni. Ha egy témakör nem megy, akkor olvass/kérdezz utána, illetve böngészd át a kérdéseit a ", React.createElement("i", null, "Kérdésbank böngészése"), " részen. Teszt formában is gyakorolhatod őket a kérdéssor testreszabásával."), 

								React.createElement("li", null, "Gyakorolj még többet."), 

								React.createElement("li", null, "Győződj meg róla, hogy a \"képes kérdések\" jól mennek. Ezek igazán fontosak, a teszten is 3 pontot érnek. Ha nem mennek, akkor elsősorban ne gyakorlással próbálj javítani, hanem nézz utána, hogy pontosan milyen szabályok érvényesek. Csak pár szabály van, de azokat pontosan kell tudni és alkalmazni. Mivel igen sok ilyen kérdés van, ezért az nem fog menni, hogy bemagolod a helyes válaszokat. Viszont ha azt a pár szabályt magabiztosan elsajátítod, minden kérdést meg fogsz tudni válaszolni."), 

								React.createElement("li", null, "Ha rendelkezel a régi (CD-s) KRESZ programmal, érdemes azt is kipróbálni, mert a vizsgán továbbra is ugyanazt a programot használják, csak új kérdésekkel. Tehát a valós vizsga kinézete/felülete/kezelőszervei megegyeznek az ott találhatóval, így nyugodtabban tudsz vizsgázni, hanem ott látod ezeket először."), 

								React.createElement("li", null, "A KRESZ vizsgád napján, vagy előtte egy nappal érdemes átismételni a nehéz kérdéseket. Ehhez menj az új teszt menüpontra, majd alul állítsd be, hogy 1) csak megjölt/rontott kérdéseket adjon 2) az összes ilyen kérdést adja ki, ne csak témakörönként egyet. Így az összes ilyen kérdést átnézheted, és memorizálhatod a helyes választ."), 

								React.createElement("li", null, "Menj el a KRESZ vizsgádra, jó esetben az összes kérdés ismerős lesz (vagy legalábbis hasonló, mint amiket láttál), és hibátlanul átmész. :)")
							), 
							React.createElement("p", null, "Sok sikert! :)")
						)
					), 

					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, React.createElement("h4", null, "Visszajelzés")), 
							React.createElement("p", null, "Minden visszajelzést szívesen várok a ", React.createElement("strong", null, "ujkreszteszt (a) gmail.com"), " címen. Ha kérdésed, javaslatod vagy ötleted van, esetleg hibát találtál, írj hogy minél jobb lehessen a program. Ha tetszett az alkalmazás, oszd meg másokkal is.")
						)
					)
				)
			);
		}
	});

	var Tester = React.createClass({displayName: 'Tester',
		getInitialState: function() {
			return {
				category: null,
				page: 'loading',
			};
		},
		componentDidMount: function() {
			var self = this;

			model.getCategory(this.props.categoryId)
			.done(function(category) {
				self.setState({
					category: category,
					page: 'generator',
				});
			})
			.fail(function() {
				alert('Failed to load category information!');
			});
		},
		startTest: function(settings, groups) {
			this.setState({page: 'loading'});

			var test = model.generateTest(this.state.category, settings, groups);

			this.setState({
				page: 'test',
				test: test,
				settings: settings,
				groups: groups
			});

			if (ga) { ga('send', 'event', 'test', 'start-test', this.state.category.id + ' '); }
		},
		startNew: function(changeSettings) {
			if (changeSettings) {
				this.setState({page: 'generator'});
			} else {
				this.startTest(this.state.settings, this.state.groups);
			}
		},
		showResult: function() {
			this.setState({
				page: 'result',
			});

			if (ga) { ga('send', 'event', 'test', 'end-test', this.state.category.id); }
		},
		render: function() {
			if (this.state.page == 'loading') {
				return React.createElement(Loading, null);
			} else if (this.state.page == 'generator') {
				return React.createElement(TestGenerator, {category: this.state.category, startTestCallback: this.startTest, settings: this.state.settings, groups: this.state.groups});
			} else if (this.state.page == 'test') {
				return React.createElement(Test, {category: this.state.category, settings: this.state.settings, test: this.state.test, showResultCallback: this.showResult});
			} else if (this.state.page == 'result') {
				return React.createElement(TestResult, {category: this.state.category, settings: this.state.settings, test: this.state.test, startNewCallback: this.startNew});
			}
		}
	});

	var TestGenerator = React.createClass({displayName: 'TestGenerator',
		settings: {
			'filter': {label: 'Kérdések', value: 'all', type: 'radio', options: {
				'all': 'Bármilyen kérdés',
				'new-only': 'Csak új kérdések',
				'missed-only': 'Csak rontott kérdések',
				'marked-only': 'Csak megjelölt kérdések',
				'missed-marked': 'Csak megjelölt/rontott kérdések',
				'missed-marked-new': 'Csak megjelölt/rontott/új kérdések'
			}},
			'order': {label: 'Sorrend', value: 'category', type: 'radio', options: {
				'category': 'Rendezés témakörönként',
				'random': 'Rendezés véletlenszerűen'
			}},
			'count': {label: 'Kérdések száma', value: 'original', type: 'radio', options: {
				'original': 'Teszt szerinti kérdésszám',
				'fixed10': 'Legfeljebb 10 kérdés témakörönként',
				'all': 'Összes kérdés'
			}},
			'prioritize': {label: 'Megjelölt/rontott/új kérdések prioritizálása', value: true, type: 'checkbox'},
			'showTime': {label: 'Idő mérése', value: true, type: 'checkbox'},
			'limitTime': {label: 'Idő letelte után automatikus továbblépés', value: false, type: 'checkbox'},
			'onepage': {label: 'Összes kérdés mutatása egyszerre', value: false, type: 'checkbox'},
			'instantCorrection': {label: 'Helyes válasz azonnali mutatása', value: true, type: 'checkbox'},
			'showHistory': {label: 'Kérdések alatt korábbi helyes válasz statisztika mutatása', value: true, type: 'checkbox'}
		},
		getInitialState: function() {
			return {
				settings: this.props.settings ? this.props.settings : this.getDefaultSettings(),
				groups: this.props.groups ? this.props.groups : this.getUniformGroupSelection(true)
			};
		},
		getUniformGroupSelection: function(value) {
			var groupsSelected = {};
			for (var key in this.props.category.groups) {
				groupsSelected[this.props.category.groups[key].id] = value;
			}
			return groupsSelected;
		},
		getDefaultSettings: function() {
			var settingValues = {};
			for (var key in this.settings) {
				settingValues[key] = this.settings[key].value;
			}
			return settingValues;
		},
		startTest: function() {
			this.props.startTestCallback(this.state.settings, this.state.groups);
		},
		startRealTest: function() {
			this.props.startTestCallback(this.getDefaultSettings(), this.getUniformGroupSelection(true));
		},
		toggleGroup: function(groupId) {
			var groups = this.state.groups;
			groups[groupId] = !groups[groupId];
			this.setState({groups: groups});
		},
		resetGroupSelection: function(value) {
			this.setState({groups: this.getUniformGroupSelection(value)});
		},
		onChangeSetting: function(event) {
			var settings = this.state.settings;
			settings[event.target.name] = event.target.type == 'checkbox' ? event.target.checked : event.target.value;
			this.setState({settings: settings});
		},
		render: function () {
			var self = this;
			var category = this.props.category;

			var groupsHtml = category.groups.map(function(group) {
				return (
					React.createElement("p", {key: group.id}, 
						React.createElement("input", {type: "checkbox", checked: self.state.groups[group.id], id: 'group-cb-' + group.id, onChange: self.toggleGroup.bind(self, group.id)}), 
						React.createElement("label", {htmlFor: 'group-cb-' + group.id}, group.title)
					)
				);
			});

			var settingsHtml = $.map(this.settings, function(setting, key) {
				if (setting.type == 'checkbox') {
					return (
						React.createElement("p", {key: key}, 
							React.createElement("input", {type: "checkbox", checked: self.state.settings[key], id: 'setting-cb-' + key, name: key, className: "filled-in", onChange: self.onChangeSetting}), 
							React.createElement("label", {htmlFor: 'setting-cb-' + key}, setting.label)
						)
					);
				} else if (setting.type == 'radio') {
					var radios = $.map(setting.options, function(option, optionKey) {
						var id = 'setting-radio-' + key + '-' + optionKey;
						return (
							React.createElement("p", {className: "radio-inline", key: optionKey}, 
								React.createElement("input", {type: "radio", checked: optionKey == self.state.settings[key], name: key, value: optionKey, onChange: self.onChangeSetting, id: id}), 
								React.createElement("label", {htmlFor: id}, option)
							)
						);
					});
					return React.createElement("div", {key: key, className: "radio-container"}, React.createElement("strong", {className: "radio-label"}, setting.label), " ", radios);
				}
			});

			return (
				React.createElement("div", null, 
					React.createElement("h3", null, category.title), 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, "Valós teszt"), 
							React.createElement("p", null, "Valós teszt indítása, a vizsgán megszokott számú kérdéssel, pontozással, időlimittel; a kérdések random választásával."), 
							React.createElement("p", null, "Használd ezt, ha nem akarod testreszabni a kérdéssort.")
						), 
						React.createElement("div", {className: "card-action"}, 
							React.createElement("a", {onClick: this.startRealTest}, "Valós teszt indítása")
						)
					), 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, "Témakörök kiválasztása"), 
							groupsHtml
						), 
						React.createElement("div", {className: "card-action"}, 
							React.createElement("a", {onClick: this.resetGroupSelection.bind(this, true)}, React.createElement("i", {className: "material-icons tiny hide"}, "done_all"), " Összes kiválasztása"), 
							React.createElement("a", {onClick: this.resetGroupSelection.bind(this, false)}, React.createElement("i", {className: "material-icons clear hide"}, "done_all"), " Kiválasztás törlése")
						)
					), 
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, "Beállítások"), 
							settingsHtml
						)
					), 	
					React.createElement("a", {className: "waves-effect waves-light btn", onClick: this.startTest}, "Teszt indítása")
				)
			);
		}
	});

	var Test = React.createClass({displayName: 'Test',
		getInitialState: function() {
			return {
				qNum: 0,
				startTime: new Date()
			};
		},
		nextQuestion: function() {
			if (this.state.qNum + 1 >= this.props.test.getQuestionCount()) {
				return this.finishTest();
			}

			this.setState({qNum: this.state.qNum + 1});

			if (ga) { ga('send', 'event', 'test', 'next-question', this.props.category.id); }
		},
		finishTest: function() {
			this.props.showResultCallback();
		},
		render: function() {
			var self = this;
			var question = this.props.test.questions[this.state.qNum];

			var questionHtml = !this.props.settings.onepage ?
				(React.createElement(Question, {question: question, settings: this.props.settings, nextQuestionCallback: this.nextQuestion, type: "test"})) :
				$.map(this.props.test.questions, function(question) {
					return React.createElement(Question, {question: question, settings: self.props.settings, nextQuestionCallback: $.noop, type: "test", key: question.id})
				});

			var buttonsHtml = this.props.settings.onepage ?
				React.createElement("a", {className: "waves-effect waves-light btn", title: "Mutasd az eredményt!", onClick: this.finishTest}, "Teszt befejezése") :
				React.createElement("div", {className: "row"}, 
					React.createElement("div", {className: "col m4 s12"}, React.createElement("a", {className: "waves-effect waves-light btn", onClick: this.nextQuestion}, "Következő kérdés")), 
					React.createElement("div", {className: "test-progress-question-count col m4 s12"}, this.state.qNum + 1, " / ", this.props.test.getQuestionCount()), 
					React.createElement("div", {className: "col m4 s12"}, React.createElement("a", {className: "waves-effect waves-teal btn-flat right", title: "Mutasd az eredményt!", onClick: this.finishTest}, "Teszt befejezése"))
				)
				;

			return (
				React.createElement("div", null, 
					React.createElement("h3", null, this.props.category.title), 
					questionHtml, 
					buttonsHtml
				)
			);
		}
	});

	var TestResult = React.createClass({displayName: 'TestResult',
		startNew: function(changeSettings) {
			this.props.startNewCallback(changeSettings);
		},
		render: function() {
			var self = this;

			// Use custom settings on the result page
			var settings = $.extend({}, self.props.settings);
			settings.showHistory = true;

			var questionsHtml = $.map(this.props.test.questions, function(question) {
				return React.createElement(Question, {question: question, settings: settings, type: "result", key: question.id})
			});

			return (
				React.createElement("div", null, 
					React.createElement("h3", null, this.props.category.title), 
					React.createElement("p", null, React.createElement("strong", null, "Eredmény: ", 
						this.props.test.getTotalScore(), " / ", this.props.test.getMaxScore(), " pont (", this.props.test.getPercentage(), "%)  – ", 
						this.props.test.getCorrectAnswers(), " / ", this.props.test.getQuestionCount(), " kérdés  – ", 
						this.props.test.isPassed() ? React.createElement("span", {className: "green-text text-darken-3"}, "Átment") : React.createElement("span", {className: "red-text text-darken-3"}, "Nem sikerült")
					)), 
					questionsHtml, 
					React.createElement("div", {className: "row"}, 
						React.createElement("div", {className: "col m6 s12 center-align"}, React.createElement("a", {className: "waves-effect waves-light btn", onClick: this.startNew.bind(this, false)}, "Új teszt azonos beállításokkal")), 
						React.createElement("div", {className: "col m6 s12 center-align"}, React.createElement("a", {className: "waves-effect waves-light btn", onClick: this.startNew.bind(this, true)}, "Új teszt más beállításokkal"))
					)
				)
			);
		}
	});

	var Question = React.createClass({displayName: 'Question',
		getInitialState: function () {
			return {
				showAnswers: false,
				startTime: (new Date).getTime(),
				timer: null
			};
		},
		selectChoice: function(event) {
			if (this.props.question.selected === null && this.props.type == 'test') {
				this.props.question.selectChoice(parseInt(event.target.value));

				if (this.props.settings.instantCorrection) {
					this.stopTimeUpdate();
				}

				this.forceUpdate();

				if (ga) { ga('send', 'event', 'test', 'answer-question', this.props.question.group.category.id); }
			}
		},
		toggleMark: function() {
			this.props.question.setMarked(!this.props.question.isMarked());
			this.forceUpdate();
		},
		getElapsedTime: function() {
			return this.props.type == 'test' ? Math.round(((new Date).getTime() - this.state.startTime + this.props.question.elapsedTime) / 1000) : this.props.question.elapsedTime;
		},
		getRemainingTime: function() {
			return this.props.question.group.category.exTimeLimit - this.getElapsedTime();
		},
		getTimeState: function(remainingTime) {
			if (remainingTime > 10) {
				return 'ok';
			} else if (remainingTime >= 0) {
				return 'warn';
			} else {
				return 'expired';
			}
		},
		updateTime: function(remainingTime) {
			var sign = remainingTime >= 0 ? '' : '-';
			calcRemainingTime = Math.abs(remainingTime);
			var seconds = calcRemainingTime % 60;
			var minutes =  (calcRemainingTime - seconds) / 60;
			var html = '<span class="question-time-val question-time-val-' + this.getTimeState(remainingTime) + '">' + sign + minutes + ':' + (seconds < 10 ? '0' : '') + seconds + '</span>';
			$(React.findDOMNode(this.refs.time)).html(html);
		},
		startTimeUpdate: function() {
			var self = this;

			this.setState({
				startTime: (new Date).getTime(),
				timeCallback: setInterval(function() {
					var remainingTime = self.getRemainingTime();
					if (remainingTime < 0 && self.props.settings.limitTime) {
						self.nextQuestion();
					} else {
						self.updateTime(remainingTime);
					}
				}, 1000)
			});
		},
		stopTimeUpdate: function() {
			if (this.state.timeCallback) {
				clearInterval(this.state.timeCallback);
				this.props.question.elapsedTime = this.getElapsedTime();
				this.setState({timeCallback: null});
			}
		},
		componentWillMount: function() {
			if (this.props.settings.showTime && this.props.type == 'test') {
				this.startTimeUpdate();
			}
		},
		componentWillReceiveProps: function(newProps) {
			if (newProps.settings.showTime && this.props.type == 'test') {
				this.startTimeUpdate();
			}
		},
		componentDidMount: function() {
			if (this.props.settings.showTime) {
				this.updateTime(this.getRemainingTime());
			}
		},
		componentWillUnmount: function() {
			this.stopTimeUpdate();
		},
		componentDidUpdate: function() {
			if (this.props.settings.showTime) {
				this.updateTime(this.getRemainingTime())
			}
		},
		nextQuestion: function() {
			this.props.nextQuestionCallback();
		},
		render: function() {
			var self = this;
			var question = this.props.question;

			var selected = question.selected !== null;
			var choicesHtml = $.map(question.choices, function(choice, i) {
				var id = 'question-answer-' + self.props.question.id + '-' + i;
				return (
					React.createElement("p", {key: i, className: question.correct == i ? 'choice-right' : 'choice-wrong'}, 
						React.createElement("input", {type: "radio", checked: question.selected === i, value: i, id: id, readOnly: selected, onChange: self.selectChoice}), 
						React.createElement("label", {htmlFor: id}, choice)
					)
				);
			});

			var imageHtml = $.map(question.assets, function(asset, i) {
				return (
					React.createElement("img", {className: "question-image", src: 'data/asset/' + asset, key: i})
				);
			});

			var questionLinkHtml = (this.props.type == 'result') ?
				React.createElement("a", {target: 'category_' + question.group.category.id, href: 'tests/' + question.group.category.id + '.html#question-' + question.id, className: "teal-text right"}, React.createElement("small", null, "#", question.id)) :
				'';

			var showAnswers = (this.props.type == 'result') || (selected && this.props.settings.instantCorrection) || this.state.showAnswers;
			return (
				React.createElement("div", {className: 'card ' + (showAnswers ? ' show-answers' : '') + (selected ? ' decided' : ' undecided') + (showAnswers && selected ? (this.props.question.isCorrect() ? ' question-right green lighten-5' : ' question-wrong red lighten-5') : '')}, 
					React.createElement("div", {className: "card-content question-content"}, 
						imageHtml, 
						React.createElement("div", {className: "question-main"}, 
							React.createElement("p", {className: "question-text"}, 
								question.question, " ", 
								questionLinkHtml
							), 
							choicesHtml
						)
					), 

					React.createElement("div", {className: "card-action row question-footer"}, 
						React.createElement("div", {className: "col s4"}, 
							React.createElement("strong", null, "Témakör:"), " ", question.group.title
						), 
						React.createElement("div", {className: 'col ' + (this.props.settings.showHistory ? '' : 'hide ') + (this.props.settings.showTime ? 's2' : 's4') + ' question-score'}, 
							React.createElement("span", {className: "green-text text-darken-3", title: "Helyes válaszok száma"}, question.getCorrectCount()), " – ", 
							React.createElement("span", {className: "red-text text-darken-3", title: "Hibás válaszok száma"}, question.getMissedCount())
						), 
						React.createElement("div", {className: 'col question-time ' + (this.props.settings.showTime ? '' : 'hide ') + (this.props.settings.showHistory ? 's2' : 's4'), title: "Hátra lévő idő", ref: "time"}
						), 
						React.createElement("div", {className: 'col ' + (!this.props.settings.showHistory && !this.props.settings.showTime ? 's8' : 's4')}, 
							React.createElement("a", {className: 'question-mark right btn-floating waves-effect waves-light teal ' + (question.isMarked() ? '' : 'lighten-3'), onClick: this.toggleMark, title: "Kérdés megjelölése későbbi előhívhatóság céljából"}, 
								React.createElement("i", {className: "material-icons small"}, "star")
							)
						)
					)
				)
			);
		}
	});

	var Loading = React.createClass({displayName: 'Loading',
		render: function () {
			return (
				React.createElement("div", {className: "progress"}, 
					React.createElement("div", {className: "indeterminate"})
				)
			);
		}
	});

	var Statistics = React.createClass({displayName: 'Statistics',
		getInitialState: function() {
			return {
				data: []
			};
		},
		componentDidMount: function() {
			var self = this;

			model.getStatistics().done(function(data) {
				if (self.isMounted()) {
					self.setState({data: data});
				}
			});
		},
		render: function() {
			var self = this;

			var categoriesHtml = $.map(this.state.data, function(row) {
				var groupsHtml = $.map(row.groups, function(entry) {
					return (
						React.createElement("tr", null, 
							React.createElement("td", {className: "statistics-group-title"}, entry.group.title), 
							React.createElement("td", null, entry.group.count, " kérdés, ", entry.group.score, " pont"), 
							React.createElement("td", null, entry.group.questions.length), 
							React.createElement("td", null, entry.answered), 
							React.createElement("td", null, entry.right), 
							React.createElement("td", null, entry.wrong)
						)
					);
				});

				return (
					React.createElement("div", {className: "card"}, 
						React.createElement("div", {className: "card-content"}, 
							React.createElement("span", {className: "card-title grey-text text-darken-4"}, row.category.title), 
							React.createElement("table", {className: "centered responsive-table"}, 
								React.createElement("thead", null, 
									React.createElement("tr", null, 
										React.createElement("th", null, "Témakör"), 
										React.createElement("th", null), 
										React.createElement("th", null, "Kérdések száma"), 
										React.createElement("th", null, "Megválaszolt kérdések"), 
										React.createElement("th", {title: "Legalább egyszer helyesen megválaszolt kérdések száma"}, "Helyes válaszok"), 
										React.createElement("th", {title: "Legalább egyszer rosszul megválaszolt kérdések száma"}, "Rossz válaszok")
									)
								), 
								React.createElement("tbody", null, 
									groupsHtml
								)
							)
						)
					)
				);
			});

			return (
				React.createElement("div", null, 
					React.createElement("h3", null, "Statisztika"), 
					categoriesHtml
				)
			);
		}
	});

	// http://coenraets.org/blog/2014/12/animated-page-transitions-with-react-js/
