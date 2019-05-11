var themes = {
		dark: 'Depths of Uranus',
		bright: 'The Second Theme',
		gold: 'Corrupted Purity',
		neon: 'Fortunate Grofit'
	};

export function ThemesService(settings) {
	this.settings = settings;
	this.$menu = null;
	this.activeTheme = settings.getItem('theme') || 'dark';
}

ThemesService.prototype = {
	init: function() {
		$('#theme-icon').on('click', this.showMenu.bind(this));
		$(document).on('click', this.hideMenu.bind(this));
	},

	showMenu: function(ev) {
		var $menu = this.$menu;
		ev.stopPropagation();
		if ($menu && $menu.css('display') !== 'none') {
			this.hideMenu();
			return;
		}
		if (!$menu) {
			$menu = $.createElement('div', {'id': 'theme-menu', 'class': 'shadow'})
				.css({'height': '0', 'opacity': '0'});
			for (var themeId in themes) {
				$.createElement('div', {'class': this.activeTheme === themeId ? 'active' : ''})
					.text(themes[themeId])
					.attr('title', themes[themeId])
					.data('theme-id', themeId)
					.on('click', this.switchTheme.bind(this))
					.appendTo($menu);
			}
			$('#menu').append($menu);
			this.$menu = $menu;
		}
		$menu.show();
		window.setTimeout(function() {
			$menu.css({'height': $menu[0].scrollHeight + 'px', 'opacity': '1'});
		}, 30);
	},

	hideMenu: function() {
		var $menu = this.$menu;
		if ($menu) {
			$menu.css({'height': '0', 'opacity': '0'});
			window.setTimeout(function() {
				$menu.hide();
			}, 200);
		}
	},

	switchTheme: function(ev) {
		ev.stopPropagation();
		var $target = $(ev.target),
			themeId = $target.getData('theme-id');
		if (!(themeId in themes)) {
			return;
		}
		$('.active', this.$menu).removeClass('active');
		this.activeTheme = themeId;
		document.body.className = themeId;
		$target.addClass('active');
		this.settings.setItem('theme', themeId);
	}
};
