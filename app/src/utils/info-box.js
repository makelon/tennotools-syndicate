export function toggle(boxId) {
	var $box = $(boxId),
		boxTimer = $box.data('timer'),
		isHidden = !$box[0].style.maxHeight || $box[0].style.maxHeight[0] == '0';
	if (boxTimer) {
		clearTimeout(Number(boxTimer));
	}
	if (!isHidden) {
		$box.css('maxHeight', $box[0].scrollHeight + 'px'); // Reset fixed height
		setTimeout(function() {
			$box.css('maxHeight', 0);
		}, 20); // Delay for at least one frame to trigger css transition in all browsers
	}
	else {
		$box.show().css('maxHeight', (40 + $box[0].scrollHeight) + 'px'); // Extra space needed if scrollbars appear
		boxTimer = setTimeout(function() {
			$box.css('maxHeight', 'none').data('timer', ''); // Set dynamic height in case window is resized
		}, 500);
		$box.data('timer', boxTimer);
	}
}
