(function(window, document, undefined) {

	window.FixScroll = FixScroll;

	var b = document.body,
		dE = document.documentElement;

	function FixScroll(elm, options) {
		var i,
			self = this;

//		if ( self === window ) {
//			return new FixScroll(elm, options);
//		}

		self.opts = {
			from: 'current',
			to: 'parent',
			top: 0,
			bottom: 0
		};
		self.elm = document.getElementById(elm);
		self.id = elm; // id => id
		self.state = 'unlocked';

		for ( i in options ) {
			self.opts[i] = options[i];
		}

		self._init();
	}

	FixScroll.prototype = {
		_init: function() {
			var self = this;
			self._getDefault();
			self._scroll();
			self._bind();
		},
		_getDefault: function() {
			var self = this,
				bodyCss,
				adjustment = null;

			// IE見検証
			if ( window.getComputedStyle ) {
				bodyCss = getComputedStyle(b);
			} else {
				bodyCss = b.currentStyle;
			}
			adjustment = (function() {
				var _mt = _parseInt(bodyCss['margin-top']),
					_ml = _parseInt(bodyCss['margin-left']),
					_pt = _parseInt(bodyCss['padding-top']),
					_pl = _parseInt(bodyCss['padding-top']);

				return {
					top: _mt + _pt,
					left: _ml + _pl
				};
			}());

			self.defaultPos = {
				adjTop: adjustment.top,
				adjLeft: adjustment.left,
				top: adjustment.top + self.elm.offsetTop,
				left: adjustment.left + self.elm.offsetLeft
			};
		},
		_setDefault: function() {
			var self = this;
			_styles(self.elm, {
				position: 'static',
				top: self.defaultPos.top + 'px'//,
				//left: self.defaultPos.left + 'px'
			});
		},
		_setFix: function() {
			var self = this;
			// とりあえずfixed
			_styles(self.elm, {
				position: 'fixed',
				top: self.opts.top + 'px'
			});
		},
		_bind: function() {
			var self = this;
			_addEvent(self.elm, self.id + '.locked', function() {
				console.log('locked');
				self._setFix();
			});
			_addEvent(self.elm, self.id + '.unlocked', function() {
				console.log('unlocked');
				self._setDefault();
			});
		},
		_scroll: function() {
			var self = this;
//			_addEvent(window, self.id + '.hogehoge', function() {
//				console.log('scrolling');
//			});
			_addEvent(window, 'scroll', function(e) {
				var scrollTop = b.scrollTop || dE.scrollTop,
					sumTop = self.defaultPos.top - self.opts.top,
					borderTop = sumTop < 0 ? 0 : sumTop;

//				_trigger(window, self.id + 'hogehoge');

				// triggered
				if ( scrollTop >= borderTop ) {
					if ( self.state === 'locked' ) return;
					self.state = 'locked';
					_trigger(self.elm, self.id + '.locked')
				} else {
					if ( self.state === 'unlocked' ) return;
					self.state = 'unlocked';
					_trigger(self.elm, self.id + '.unlocked');
				}
			})
		}
	};

	function _parseInt(strings) {
		return parseInt(strings, 10);
	}

	function _trigger(elm, listener) {
		var evtObj = undefined;
		if ( 'createEvent' in document ) {
			evtObj = document.createEvent('UIEvents');
			evtObj.initEvent(listener, false, true);
			elm.dispatchEvent(evtObj);
		} else
		if ( 'createEventObject' in document ) {
			evtObj = document.createEventObject();
			evtObj.name = listener;
			elm.fireEvent('ondataavailable', evtObj);
		}
	}

	function _addEvent(elm, listener, func) {
		if ( window.addEventListener ) {
			elm.addEventListener(listener, func, false);
		} else {
			if ( !elm[listener] ) {
				elm.attachEvent('ondataavailable', function(evtObj) {
					evtObj.func = evtObj.func || {};
					evtObj.func[listener] = func;

					if ( !evtObj.func[evtObj.name] ) return;
					evtObj.func[evtObj.name]();
				});
			} else {
				elm.attachEvent('on' + listener, func);
			}
		}
	}

	function _styles(elm, css) {
		var i;
		for ( i in css ) {
			elm.style[i] = css[i];
		}
	}

}(this, this.document));