'use strict';
(function() {
var undefined,
	isReady = false,
	onReadyQueue = [];

function JSUtil(sel, ctx) {
	return new JSUtilObj(sel, ctx);
}

function JSUtilObj(sel, ctx) {
	this.jsutil = 1;
	this.length = 0;
	this.o = {};

	if (!sel) {
		return this;
	}
	if (typeof sel == 'object') {
		if (sel instanceof JSUtilObj) {
			return sel;
		}
		else if (sel.length > 0) {
			for (var i = 0; i < sel.length; ++i) {
				if (sel[i].nodeType) {
					this[this.length++] = sel[i];
				}
			}
		}
		else if (sel == window || sel.nodeType) {
			this[this.length++] = sel;
		}
		return this;
	}
	ctx || (ctx = document);
	var obj = ctx.querySelectorAll(sel);
	for (var i = 0; i < obj.length; ++i) {
		this[this.length++] = obj[i];
	}
	return this;
}

JSUtil.extend = function(obj, target) {
	if (target === undefined) {
		target = JSUtilObj.prototype;
	}
	for (var name in obj) {
		if (target[name] === undefined) {
			target[name] = obj[name];
		}
	}
};

JSUtilObj.prototype = {
//
// Internal selector function
//
	querySelectorAll: function(sel) {
		var obj = [];
		for (var i = 0; i < this.length; ++i) {
			[].push.apply(obj, this[i].querySelectorAll(sel));
		}
		return obj;
	},

//
// DOM
//
	append: function(arg) {
		for (var i = 0; i < this.length; ++i) {
			if (typeof arg == 'object') {
				if (arg.tagName) {
					this[i].appendChild(i == 0 ? arg : arg.cloneNode(true));
				}
				else if (arg instanceof JSUtilObj) {
					for (var j = 0; j < arg.length; ++j) {
						this[i].appendChild(i == 0 ? arg[j] : arg[j].cloneNode(true));
					}
				}
			}
			else if (typeof arg == 'string') {
				this[i].insertAdjacentHTML('beforeend', arg);
			}
		}
		return this;
	},

	appendTo: function(arg) {
		for (var i = 0; i < this.length; ++i) {
			if (arg.tagName) {
				arg.appendChild(this[i]);
			}
			else if (arg instanceof JSUtilObj) {
				for (var j = 0; j < arg.length; ++j) {
					arg[j].appendChild(j == 0 ? this[i] : this[i].cloneNode(true));
				}
			}
		}
		return this;
	},

	html: function(html) {
		if (html === undefined) {
			return this.length ? this[0].innerHTML : null;
		}
		for (var i = 0; i < this.length; ++i) {
			this[i].innerHTML = html;
		}
		return this;
	},

	prepend: function(arg) {
		for (var i = 0; i < this.length; ++i) {
			if (typeof arg == 'object') {
				if (arg.tagName) {
					this[i].insertBefore(i == 0 ? arg : arg.cloneNode(true), this[i].children[0]);
				}
				else if (arg instanceof JSUtilObj) {
					for (var j = 0; j < arg.length; ++j) {
						this[i].insertBefore(i == 0 ? arg[j] : arg[j].cloneNode(true), this[i].children[0]);
					}
				}
			}
			else if (typeof arg == 'string') {
				this[i].insertAdjacentHTML('afterbegin', arg);
			}
		}
		return this;
	},

	prependTo: function(arg) {
		for (var i = 0; i < this.length; ++i) {
			if (arg.tagName) {
				arg.insertBefore(this[i], arg.children[0]);
			}
			else if (arg instanceof JSUtilObj) {
				for (var j = 0; j < arg.length; ++j) {
					arg[j].insertBefore(j == 0 ? this[i] : this[i].cloneNode(true), arg[j].children[0]);
				}
			}
		}
		return this;
	},

	remove: function() {
		for (var i = 0; i < this.length; ++i) {
			if (this[i].parentNode) {
				this[i].parentNode.removeChild(this[i]);
				delete this[i];
			}
		}
		this.length = 0;
	},

	replaceWith: function(arg) {
		if (typeof arg == 'string') {
			arg = $.createElement(arg);
		}
		for (var i = 0; i < this.length; ++i) {
			if (!this[i].parentNode) {
				continue;
			}
			if (arg.tagName) {
				this[i].parentNode.replaceChild(arg, this[i]);
				arg = $(arg);
			}
			else if (arg instanceof JSUtilObj) {
				for (var j = 0; j < arg.length; ++j) {
					this[i].parentNode.insertBefore(i == 0 ? arg[j] : arg[j].cloneNode(true), this[i]);
				}
				this[i].parentNode.removeChild(this[i]);
			}
		}
		return arg;
	},

//
// Selection
//
	children: function(idx) {
		var arr = [];
		if (this.length) {
			for (var i = 0; i < this.length; ++i) {
				if (idx !== undefined) {
					if (idx < this[i].children.length) {
						arr.push(this[i].children[idx]);
					}
				}
				else {
					[].push.apply(arr, this[i].children);
				}
			}
		}
		return JSUtil(arr);
	},

	get: function(idx) {
		return idx < this.length ? this[idx] : null;
	},

	getObj: function(idx) {
		if (!(idx in this.o)) {
			this.o[idx] = JSUtil(idx < this.length ? this[idx] : null);
		}
		return this.o[idx];
	},

//
// Styling
//
	addClass: function(className) {
		for (var i = 0; i < this.length; ++i) {
			var classStr = this[i].className;
			if ((' '+classStr+' ').indexOf(className) == -1) {
				this[i].className = classStr ? classStr + ' ' + className : className;
			}
		}
		return this;
	},

	removeClass: function(className) {
		for (var i = 0; i < this.length; ++i) {
			var classes = this[i].className.split(' '),
				classIdx = JSUtil.inArray(classes, className);
			while (classIdx != -1) {
				classes = classes.slice(0, classIdx).concat(classes.slice(classIdx + 1));
				classIdx = JSUtil.inArray(classes, className);
			}
			this[i].className = classes.join(' ');
		}
		return this;
	},

	setClass: function(className) {
		for (var i = 0; i < this.length; ++i) {
			this[i].className = className;
		}
		return this;
	},

	toggleClass: function(className) {
		for (var i = 0; i < this.length; ++i) {
			var classes = this[i].className.split(' '),
				classIdx = JSUtil.inArray(classes, className);
			if (classIdx == -1) {
				classes.push(className);
			}
			else {
				classes = classes.slice(0, classIdx).concat(classes.slice(classIdx + 1));
			}
			this[i].className = classes.join(' ');
		}
		return this;
	},

	hasClass: function(className) {
		return this.length && (' '+this[0].className+' ').indexOf(' '+className+' ') != -1;
	},

	css: function(property, value) {
		if (typeof property == 'string') {
			if (value === undefined) {
				return this.length ? this[0].style[property] : null;
			}
			for (var i = 0; i < this.length; ++i) {
				this[i].style[property] = value;
			}
		}
		else if (typeof property == 'object') {
			for (var key in property) {
				for (var i = 0; i < this.length; ++i) {
					this[i].style[key] = property[key];
				}
			}
		}
		return this;
	},

	hide: function() {
		for (var i = 0; i < this.length; ++i) {
			this[i].style.display = 'none';
		}
		return this;
	},

	show: function() {
		for (var i = 0; i < this.length; ++i) {
			this[i].style.display = '';
		}
		return this;
	},

	toggle: function() {
		for (var i = 0; i < this.length; ++i) {
			this[i].style.display = this.isVisible(i) ? 'none' : '';
		}
		return this;
	},

	isVisible: function(idx) {
		if (idx === undefined) {
			idx = 0;
		}
		return this.length > idx && this[idx].style.display != 'none';
	},

//
// Attributes
//
	attr: function(property, value, prefix) {
		if (typeof prefix != 'string') {
			prefix = '';
		}
		if (value === undefined && typeof property == 'string') {
			var targetKey = prefix + property;
			return this.length && this[0].tagName && this[0].hasAttribute(targetKey) ? this[0].getAttribute(targetKey) : null;
		}
		if (typeof property == 'object' && typeof value == 'string') {
			prefix = value;
		}
		for (var i = 0; i < this.length; ++i) {
			if (!this[i].tagName) {
				continue;
			}
			if (typeof property == 'object') {
				for (var key in property) {
					if (!property.hasOwnProperty(key)) {
						continue;
					}
					if (property[key] === null) {
						this[i].removeAttribute(prefix + key);
					}
					else {
						this[i].setAttribute(prefix + key, property[key]);
					}
				}
			}
			else if (value === null) {
				this[i].removeAttribute(prefix + property);
			}
			else if (typeof property == 'string') {
				this[i].setAttribute(prefix + property, value);
			}
		}
		return this;
	},

	data: function(name, value) {
		return this.attr(name, value, 'data-');
	},

	getAttr: function(name, parents) {
		if (!this.length) {
			return null;
		}
		if (!parents) {
			return this[0].hasAttribute(name) ? this[0].getAttribute(name) : null;
		}
		for (var el = this[0]; el.attributes; el = el.parentNode) {
			if (el.hasAttribute(name)) {
				return el.getAttribute(name);
			}
		}
		return null;
	},

	getData: function(name, parents) {
		return this.getAttr('data-'+name, parents);
	},

	val: function(value) {
		if (value === undefined) {
			return this.length ? this[0].value : null;
		}
		for (var i = 0; i < this.length; ++i) {
			this[i].value = value;
		}
		return this;
	},

	disable: function(idx) {
		if (idx !== undefined) {
			if (idx <= this.length) {
				this[idx].disabled = true;
			}
		}
		else {
			for (var i = 0; i < this.length; ++i) {
				this[i].disabled = true;
			}
		}
		return this;
	},

	enable: function(idx) {
		if (idx !== undefined) {
			if (idx <= this.length) {
				this[idx].disabled = false;
			}
		}
		else {
			for (var i = 0; i < this.length; ++i) {
				this[i].disabled = false;
			}
		}
		return this;
	}
};

//
// .text() needs a browser compatibility test
//
if (Object.getOwnPropertyDescriptor
  && (!Object.getOwnPropertyDescriptor(Element.prototype, "textContent")
  || !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get)
) {
	JSUtilObj.prototype.text = function(text) {
		if (text === undefined) {
			return this[0] ? this[0].innerText : null;
		}
		for (var i = 0; i < this.length; ++i) {
			this[i].innerText = text;
		}
		return this;
	};
}
else {
	JSUtilObj.prototype.text = function(text) {
		if (text === undefined) {
			return this[0] ? this[0].textContent : null;
		}
		for (var i = 0; i < this.length; ++i) {
			this[i].textContent = text;
		}
		return this;
	};
}

//
// Events
//
if (!Event.prototype.stopPropagation) {
	Event.prototype.stopPropagation = function() {
		this.cancelBubble = true;
	};
}

if (!Event.prototype.preventDefault) {
	Event.prototype.preventDefault = function() {
		this.returnValue = false;
	};
}

JSUtil.stopPropagation = function(ev) {
	ev.stopPropagation();
};

JSUtil.preventDefault = function(ev) {
	ev.preventDefault();
	return false;
};

function eventTriggers(triggers, elem) {
	if (!elem) {
		return [];
	}
	triggers = triggers.split(' ');
	for (var i = 0; i < triggers.length; ++i) {
		var triggersAlt = triggers[i].split('|');
		for (var j = 0; j < triggersAlt.length; ++j) {
			if (elem['on' + triggersAlt[0]] !== undefined) {
				triggers[i] = triggersAlt[j];
				break;
			}
		}
	}
	return triggers;
}

if (window.addEventListener) {
	JSUtilObj.prototype.on = function(triggers, callback) {
		triggers = eventTriggers(triggers, this[0]);
		for (var i = 0; i < this.length; ++i) {
			for (var j = 0; j < triggers.length; ++j) {
				 this[i].addEventListener(triggers[j], callback);
			}
		}
		return this;
	};

	JSUtilObj.prototype.off = function(triggers, callback) {
		triggers = eventTriggers(triggers, this[0]);
		for (var i = 0; i < this.length; ++i) {
			for (var j = 0; j < triggers.length; ++j) {
				this[i].removeEventListener(triggers[j], callback);
			}
		}
		return this;
	};
}
else {
	var eventHandlers = {},
		elemId = 1,
		handlerId = 1,
		rndKey = 'jsutil' + Math.random(),
		createHandler = function(elem, callback) {
			var fun = function(ev) {
				ev = ev || window.event;
				ev.target = ev.srcElement;
				ev.currentTarget = elem;
				ev.pageX = ev.clientX;
				ev.pageY = ev.clientY;
				callback(ev);
			};
			fun[rndKey] = callback[rndKey];
			return fun;
		};

	JSUtilObj.prototype.on = function(triggers, callback) {
		var self = this;
		if (!callback[rndKey]) {
			callback[rndKey] = handlerId++;
		}
		triggers = eventTriggers(triggers, this[0]);
		for (var i = 0; i < this.length; ++i) {
			var elem = this[i],
				id = elem[rndKey];
			if (!id) {
				id = elemId++;
				Object.defineProperty(elem, rndKey, {value: id});
			}
			var handlers = eventHandlers[id];
			if (!handlers) {
				handlers = eventHandlers[id] = {};
			}
			var handler = createHandler(elem, callback);
			for (var j = 0; j < triggers.length; ++j) {
				var trigger = triggers[j],
					typeHandlers = handlers[trigger] || (handlers[trigger] = []);
				elem.attachEvent('on' + trigger, handler);
				typeHandlers.push(handler);
			}
		}
		return this;
	};

	JSUtilObj.prototype.off = function(triggers, callback) {
		var _handlerId = callback[rndKey];
		if (!_handlerId) {
			return this;
		}
		triggers = eventTriggers(triggers, this[0]);
		for (var i = 0; i < this.length; ++i) {
			var id = this[i][rndKey];
			if (!id || !eventHandlers[id]) {
				continue;
			}
			var handlers = eventHandlers[id];
			for (var j = 0; j < triggers.length; ++j) {
				var trigger = triggers[j],
					typeHandlers = handlers[trigger];
				if (!typeHandlers) {
					continue;
				}
				for (var k = 0; k < typeHandlers.length; ++k) {
					if (typeHandlers[k][rndKey] == _handlerId) {
						this[i].detachEvent('on' + trigger, typeHandlers[k]);
						typeHandlers.splice(k, 1);
						break;
					}
				}
			}
		}
		return this;
	};
}

function setReady() {
	if (document.addEventListener) {
		window.removeEventListener('load', setReady);
		document.removeEventListener('DOMContentLoaded', setReady);
	}
	else {
		window.detachEvent('onload', setReady);
	}
	isReady = true;
	while (onReadyQueue.length) {
		(onReadyQueue.shift())();
	}
}

if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', setReady);
	window.addEventListener('load', setReady);
}
else {
	window.attachEvent('onload', setReady);
}

JSUtil.onReady = function(callback) {
	if (isReady) {
		callback();
	}
	else {
		onReadyQueue.push(callback);
	}
};

//
// Static DOM
//
JSUtil.createElement = function(tag, opts) {
	if (typeof tag != 'string') {
		return JSUtil();
	}
	if (tag[0] == '<' && tag[tag.length - 1] == '>') {
		var ctx = document.createDocumentFragment(),
			wrap = ctx.appendChild(document.createElement('div'));
		wrap.innerHTML = tag;
		var nodes = JSUtil(wrap.childNodes);
		wrap.textContent = ctx.textContent = '';
		return nodes;
	}
	else {
		var element = document.createElement(tag);
		if (typeof opts == 'object') {
			for (var attrName in opts) {
				if (opts.hasOwnProperty(attrName)) {
					element.setAttribute(attrName, opts[attrName].toString());
				}
			}
		}
		return JSUtil(element);
	}
};

//
// Static selection
//
JSUtil.collect = function() {
	var nodes = [];
	for (var i = 0; i < arguments.length; ++i) {
		if (arguments[i].tagName) {
			nodes.push(arguments[i]);
		}
		else if (arguments[i].length) {
			for (var j = 0; j < arguments[i].length; ++j) {
				if (arguments[i][j].tagName) {
					nodes.push(arguments[i][j]);
				}
			}
		}
	}
	return JSUtil(nodes);
};

//
// Numbers
//
var power10Cache = {};
JSUtil.shortenNumber = function(n, maxLength) {
	if (isNaN(n)) {
		return null;
	}
	var negative = n < 0,
		nAbs = Math.abs(n),
		nAbsStr = nAbs.toString();
	if (nAbsStr.length <= maxLength) {
		return n.toString();
	}
	if (nAbsStr.indexOf('.') != -1) {
		if (!(maxLength in power10Cache)) {
			power10Cache[-maxLength] = Math.pow(10, -maxLength);
			power10Cache[maxLength] = Math.pow(10, maxLength);
		}
		if (nAbs <= power10Cache[-maxLength] || nAbs >= power10Cache[maxLength]) {
			maxLength -= 3; // e[+-]X
		}
	}
	else {
		maxLength -= 3; // e[+-]X
	}
	if (nAbs >= 1e10 || nAbs <= 1e-10) {
		--maxLength;
	}
	if (maxLength < 1) {
		return null;
	}
	return n.toPrecision(maxLength);
};

var reHasExp = /[Ee]/;
JSUtil.formatNumber = function(n, precision) {
	if (isNaN(n)) {
		return null;
	}
	var negative = n < 0;
	if (precision !== undefined) {
		n = +(Number(n)).toFixed(precision);
	}
	n = Math.abs(n).toString();
	if (reHasExp.test(n)) {
		ret = n;
	}
	else {
		var length = n.indexOf('.');
		if (length == -1) {
			length = n.length;
		}
		var pos = (length % 3) || 3,
			ret = n.substr(0, pos);
		for (; pos < length - 2; pos += 3) {
			ret += ',' + n.substr(pos, 3);
		}
		if (pos < n.length) {
			ret += n.substr(pos);
		}
	}
	return negative ? '-' + ret : ret;
};

JSUtil.round = function(n, precision) {
	return isNaN(n) ? null : +(Number(n)).toFixed(precision || 0);
};

JSUtil.roundFromZero = function(n) {
	return isNaN(n) ? null : n < 0 ? -Math.ceil(-n) : Math.ceil(n);
};

JSUtil.roundToZero = function(n) {
	return isNaN(n) ? null : n < 0 ? -Math.floor(-n) : Math.floor(n);
};

JSUtil.truncate = JSUtil.roundToZero;

JSUtil.clamp = function(n, min, max) {
	if (isNaN(n) || isNaN(min) || isNaN(max)) {
		return null;
	}
	return n < min ? min : (n > max ? max : n);
};

JSUtil.lerp = function(n, min, max) {
	if (isNaN(n) || isNaN(min) || isNaN(max)) {
		return null;
	}
	n = n < 0 ? 0 : (n > 1 ? 1 : n);
	return min + (max - min) * n;
};

//
// Ajax
//
function ajaxResponseHandler(xhr, opts) {
	var contentType = xhr.getResponseHeader('Content-Type'),
		response;
	if (contentType == 'application/json') {
		response = JSON.parse(xhr.responseText);
	}
	else {
		response = xhr.responseText;
	}
	opts.success(response);
}

JSUtil.ajax = function(url, opts, callback) {
	if (!opts || !opts.method) {
		return;
	}
	callback && (opts.success = callback);
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
			ajaxResponseHandler(this, opts);
		}
	};
	xhr.open(opts.method, url, true);
	xhr.send(opts.data);
};

JSUtil.get = function(url, callback) {
	var opts = {
		method: 'GET',
		data: null,
		success: callback
	}
	JSUtil.ajax(url, opts);
};

JSUtil.post = function(url, data, callback) {
	if (typeof data == 'function') {
		callback = data;
		data = '';
	}
	else if (typeof data != 'string') {
		var dataArray = [];
		for (var key in data) {
			if (typeof data[key] == 'string') {
				dataArray.push(key + '=' + data[key]);
			}
		}
		data = dataArray.join('&');
	}
	var opts = {
		method: 'POST',
		data: data,
		success: callback
	};
	JSUtil.ajax(url, opts);
};

//
// Compatibility
//
if (Array.prototype.fill) {
	JSUtil.fillArray = function(arr, value) {
		return arr.fill(value);
	};
}
else {
	JSUtil.fillArray = function(arr, value) {
		for (var i = 0; i < arr.length; ++i) {
			arr[i] = value;
		}
		return arr;
	};
}

if (Array.prototype.indexOf) {
	JSUtil.inArray = function(arr, search, from) {
		return arr.indexOf(search, from);
	};
}
else {
	JSUtil.inArray = function(arr, search, fromIdx) {
		fromIdx === undefined && (fromIdx = 0);
		if (fromIdx < 0) {
			fromIdx = Math.max(0, arr.length + fromIdx);
		}
		for (var i = fromIdx; i < arr.length; ++i) {
			if (arr[i] === search) {
				return i;
			}
		}
		return -1;
	};
}

if (Object.prototype.keys) {
	JSUtil.keys = function(obj) {
		return Object.keys(obj);
	};
}
else {
	JSUtil.keys = function(obj) {
		var keys = [];
		for (var x in obj) {
			if (obj.hasOwnProperty(x)) {
				keys.push(x);
			}
		}
		return keys;
	};
}

if (String.prototype.repeat) {
	JSUtil.strRepeat = function(str, count) {
		return str.repeat(count);
	}
}
else {
	JSUtil.strRepeat = function(strIn, count) {
		var strOut = '';
		while (count-- > 0) {
			strOut += strIn;
		}
		return strOut;
	};
}

//
// Register in global scope
//
window.JSUtil = window.$ = JSUtil;
})();
