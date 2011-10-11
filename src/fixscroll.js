/**
 * FixScroll
 *
 * @version      0.2
 * @author       nori (norimania@gmail.com)
 * @copyright    5509 (http://5509.me/)
 * @license      The MIT License
 * @link         https://github.com/5509/fixscroll
 *
 * 2011-10-12 02:01
 */
;(function(window, document, undefined) {

	window.FixScroll = FixScroll;

	var b = document.body,
		dE = document.documentElement,
		ua = (function() {
			var txt = window.navigator.userAgent;
			return {
				msie: txt.indexOf('MSIE') !== -1,
				version: (function() {
					if ( txt.match(/MSIE (\d\.\d)/) ) {
						return RegExp.$1;
					}
				}())
			}
		}());

	function FixScroll(elm, options) {
		var i,
			self = this;

		// higher than IE7
		if ( ua.msie && ua.version < 7 ) return;
		// new is not necessary
		if ( self === window ) {
			return new FixScroll(elm, options);
		}

		// options
		self.opts = {
			parent: 'body',
			top: 0,
			bottom: 0
		};
		self.elm = document.getElementById(elm);
		self.id = elm; // id => id
		self.state = 'unlocked';
		self.callback = {};

		for ( i in options ) {
			self.opts[i] = options[i];
		}

		// init
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

			self.parent = self.opts.parent === 'body'
				? document.body
				: document.getElementById(self.opts.parent);

			self.offsetHeight = self.elm.offsetHeight;
			self.parentHeight = self.parent.offsetHeight;

			if ( window.getComputedStyle ) {
				bodyCss = getComputedStyle(b);
				parentCss = getComputedStyle(self.parent);
			} else {
				bodyCss = b.currentStyle;
				parentCss = self.parent.currentStyle;
			}
			adjustment = (function() {
				var _mt = _parseInt(bodyCss['margin-top']),
					_ml = _parseInt(bodyCss['margin-left']),
					_pt = _parseInt(bodyCss['padding-top']),
					_pl = _parseInt(bodyCss['padding-top']);

				return {
					top: (_mt + _pt) || 0,
					left: (_ml + _pl) || 0
				};
			}());

			self.defaultPos = {
				position: bodyCss.position,
				adjTop: adjustment.top,
				adjLeft: adjustment.left,
				ptPdgTop: _parseInt(parentCss['padding-top']),
				ptPdgBtm: _parseInt(parentCss['padding-bottom']),
				top: adjustment.top + self.elm.offsetTop,
				left: adjustment.left + self.elm.offsetLeft
			};
		},
		_setDefault: function() {
			var self = this;
			_styles(self.elm, {
				position: self.defaultPos.position,
				top: self.defaultPos.top + 'px'
			});
		},
		_setFix: function() {
			var self = this;
			_styles(self.elm, {
				position: 'fixed',
				top: self.opts.top + 'px'
			});
		},
		_bottomFix: function() {
			var self = this;
			_styles(self.elm, {
				position: 'absolute',
				top: self.bottomFix + 'px'
			});
		},
		_bind: function() {
			var self = this;
			_addEvent(self.elm, self.id + '.locked', function() {
				self._setFix();
				if ( self.callback.locked ) {
					self.callback.locked();
				}
			});
			_addEvent(self.elm, self.id + '.unlocked', function() {
				self._setDefault();
				if ( self.callback.unlocked ) {
					self.callback.unlocked();
				}
			});
			_addEvent(self.elm, self.id + '.bottomlocked', function() {
				self._bottomFix();
				if ( self.callback.bottomlocked ) {
					self.callback.bottomlocked();
				}
			});
		},
		_scroll: function() {
			var self = this;
			_addEvent(window, 'scroll', function() {
				var scrollTop = b.scrollTop || dE.scrollTop,
					defPos = self.defaultPos,
					sumTop = defPos.top - self.opts.top,
					borderTop = sumTop < 0 ? 0 : sumTop,
					vScrollTop = scrollTop + self.offsetHeight,
					vBorderTop = self.parentHeight + defPos.adjTop - defPos.ptPdgBtm;

				// triggered
				// locked (fixed
				if ( scrollTop >= borderTop && vScrollTop < vBorderTop ) {
					if ( self.state === 'locked' ) return;
					self.state = 'locked';
					_trigger(self.elm, self.id + '.locked');
				} else
				// bottomlocked (bottomfixed
				if ( vScrollTop >= vBorderTop ) {
					if ( self.state === 'bottomlocked' ) return;
					self.bottomFix = self.parentHeight - self.offsetHeight - defPos.ptPdgBtm;
					self.state = 'bottomlocked';
					_trigger(self.elm, self.id + '.bottomlocked');
				// unlocked (not fixed
				} else {
					if ( self.state === 'unlocked' ) return;
					self.state = 'unlocked';
					_trigger(self.elm, self.id + '.unlocked');
				}
			})
		},
		// triggered callback
		bind: function(lisneter, func) {
			var self = this;
			switch ( lisneter ) {
			case '.locked':
				self.callback.locked = func;
				break;
			case '.bottomlocked':
				self.callback.bottomlocked = func;
				break;
			case '.unlocked':
				self.callback.unlocked = func;
			}
			return self;
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
					evtObj.name = null;
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