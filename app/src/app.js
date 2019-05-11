import { TrackerComponent } from './components/tracker';
import { PlannerComponent } from './components/planner';
import { SettingsService } from './services/settings';
import { ThemesService } from './services/themes';

/* iOS Safari will only react to mouse events on elements that look clickable */
if (/ip([oa]d|hone)/i.test(navigator.userAgent)) {
	document.body.style.cursor = 'pointer';
}

var settings = new SettingsService(),
	themes = new ThemesService(settings),
	tracker = new TrackerComponent(settings),
	planner = new PlannerComponent(tracker);

(function init() {
	for (var argIdx = 0; argIdx < arguments.length; ++argIdx) {
		var argument = arguments[argIdx];
		if (typeof argument.init == 'function') {
			argument.init();
		}
	}
})(tracker, planner, themes, settings);
