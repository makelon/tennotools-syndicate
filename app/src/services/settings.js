export function SettingsService() {}

if (localStorage !== undefined && typeof localStorage.setItem == 'function') {
	SettingsService.prototype = {
		setItem: function(key, value) {
			localStorage.setItem(key, value);
		},

		getItem: function(key) {
			return localStorage.getItem(key);
		},

		hasLocalStorage: function() { return true; }
	};
}
else {
	SettingsService.prototype = {
		setItem: function() {},

		getItem: function() {
			return false
		},

		hasLocalStorage: function() {
			return true;
		}
	};
}
