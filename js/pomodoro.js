var Pomodoro = (function () {
	var timers = {
		pomodoro : {
			running : false,
			duration : 25
		},
		short_pause : {
			running : false,
			duration : 5,
		},
		long_pause : {
			running : false,
			duration : 10,
		}
	};
	var settings = {
		tick : {
			value : false,
			id : 'tick',
		},
		ring : {
			value : true,
			id : 'ring',
		},
	};
	var tick = new Audio("sound/tick.wav");
	var ring = new Audio("sound/ring.wav");
	var stop = null;
	function start(period) {
		var start_time = new Date,
		sound = false,
		timer = null;

		function update_bar(value, total) {
			$('#b').width((value * 100 / total) + "%");
		}
		function update_text(value, total, id) {
			$("#"+id).text((value < 10 ? "0" : "") + value);
		}

		period.running = true;

		(function () {
			var d = new Date;
			done = new Date(d - start_time),
			second_counter = 59 - done.getSeconds(),
			minute_counter = period.duration - 1 - done.getMinutes();
			if (minute_counter < 0) {
				if (settings.ring.value === true)
					ring.play();
				stop();
				stop = null;
				return;
			}

			update_bar(done.getTime() / 1000, 60 * period.duration);
			update_text(second_counter, 60, 's');
			update_text(minute_counter, period.duration, 'm');
			document.title = $('#time').text();
			if (settings.tick.value === true) {
				tick.play();
			}
			timer = setTimeout(arguments.callee, 1000);

			init = false;
		})();

		return function () {
			clearTimeout(timer);
			init = true;
			period.running = false;
			update_bar(0, 60 * period.duration);
		};
	}

	function toggle_activity(button, name) {
		var timer = timers[name];
		var was_already_running = timers[name].running === true;
		if (stop !== null) {
			stop();
			reset_ui();
			$("#s").html("--");
			$("#m").html("--");
			document.title = $('#time').text();
			stop = null;
			if (was_already_running)
				return;
		}
		var text = button.html();
		text = text.replace('Start', 'Stop');
		button.removeClass('btn-primary');
		button.addClass('btn-warning');
		button.html(text);
		stop = start(timers[name]);
	}

	function reset_ui() {
		/* Remove all classes */
		var buttons = $('button.link');
		buttons.removeClass();
		buttons.addClass('link');
		buttons.addClass('btn');
		buttons.addClass('btn-large');
		buttons.addClass('btn-primary');
		$('#start_pomodoro').html("Start pomodoro");
		$('#start_short').html("Start short pause");
		$('#start_long').html("Start long pause");
	}

	function refresh_settings() {
		settings.tick.value = $("input#"+settings.tick.id).prop('checked');
		settings.ring.value = $("input#"+settings.ring.id).prop('checked');
	}

	function init_fn () {
		$(document).ready(function () {
			/* Keyboard shortcuts */
			$(document).keydown(function(e) {
				if (e.which == 80) { // 'p'
					$('#start_pomodoro').click();
				} else if (e.which == 83) { // 's'
					$('#start_short').click();
				} else if (e.which == 76) { // 'l'
					$('#start_long').click();
				}
			});
			/* Settings */
			$("input#"+settings.tick.id).prop('checked' , settings.tick.value);
			$("input#"+settings.ring.id).prop('checked' , settings.ring.value);
		});
	}
	return {
		init : init_fn,
		refresh_settings : refresh_settings,
		toggle_activity : toggle_activity
	};
}());
