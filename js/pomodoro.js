var Pomodoro = (function () {
        var debug = true;
	var timers = {
		pomodoro : {
                        name : 'Pomodoro',
			running : false,
			duration : { m : 25, s : 0 }
		},
		short_pause : {
                        name : 'Short pause',
			running : false,
			duration : { m : 5, s : 0 },
		},
		long_pause : {
                        name : 'Long pause',
			running : false,
			duration : { m : 10, s : 0 },
		}
	};
	var settings = {
		cookie : {
			value : true,
			id : 'cookie',
		},
		tick : {
			value : false,
			id : 'tick',
		},
		ring : {
			value : false,
			id : 'ring',
		},
	};
        var todos = {
          selected : 0,
          list : [ ],
        };
	var tick = new Audio("sound/tick.wav");
	var ring = new Audio("sound/ring.wav");
	var stop = null;
	function start(period) {
		var start_time = new Date,
		end_time = new Date,
		sound = false,
		init = true,
		timer = null;

                end_time.setSeconds(start_time.getSeconds() + period.duration.s);
                end_time.setMinutes(start_time.getMinutes() + period.duration.m);

		function update_bar(value, total) {
			$('#b').width((value * 100 / total) + "%");
		}
		function update_text(value, id) {
			$("#"+id).text((value < 10 ? "0" : "") + value);
		}

		period.running = true;

		(function () {
			var now = new Date;
                        var done = new Date(now - start_time);
                        var counter;
                        if (init) {
                          counter = new Date(end_time - 1 - now);
                        } else {
			  counter = new Date(end_time - now);
                        }
			second_counter = counter.getSeconds(),
			minute_counter = counter.getMinutes();
			if (now > end_time) {
                                var todo_name;
				if (settings.ring.value === true) {
					ring.play();
                                }
                                if (todos.list.length > 0 && period === timers.pomodoro) {
                                  todo_name = todos.list[todos.selected].name;
                                } else {
                                  todo_name  = "";                
                                }
                                period_done(todo_name,
                                            period, start_time, end_time);
				stop();
				stop = null;
				return;
			}

			update_bar((done.getTime() / 1000) + 1, 60 * period.duration.m + period.duration.s);
			update_text(second_counter, 's');
			update_text(minute_counter, 'm');
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
			update_bar(0, 60 * period.duration.m + period.duration.s);
			reset_ui();
			$("#s").html("--");
			$("#m").html("--");
			document.title = $('#time').text();
		};
	}

        function hhmm(d) {
          var h = d.getHours();
          var m = d.getMinutes();
          return  (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
        }
        function period_done(todo_name, period, start, end) {
          tick_todo();
          row = $('<tr/>');
          row.append('<td>'+ period.name + ' ' + todo_name + '</td>');
          row.append('<td>' + hhmm(start) + ' &minus; ' + hhmm(end) + '</td>');
          row.append('<td><i style="text-align:right;" class="icon-remove"></i></td>');
          $('#eventlog tbody:first').append(row);
          if ($('#eventlog tbody:first tr').length > 4) {
            $('#eventlog tbody:first tr:first').remove();
          }
          flash(row);
        }
	function toggle_activity(button, name) {
		var timer = timers[name];
		var was_already_running = timers[name].running === true;
		if (stop !== null) {
			stop();
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
		settings.cookie.value = $("input#"+settings.cookie.id).prop('checked');
	}

        function tick_todo() {
          if (todos.list.length > 0) {
            todos.list[todos.selected].strikes += 1;
            draw_todos();
            var e = $('#todos > tbody:first > tr:eq('+todos.selected+')');
            flash(e);
          }
        }
        function dump_o(o) {
          var acc = []
          $.each(o, function(index, value) {
            acc.push(index + ': ' + value);
          });
          return JSON.stringify(acc);
        }
        function list_classes(e) {
          var ret = "";
          var c = e.attr('class');
          if (c === undefined) {
            return "none";
          }
          var classList =c.split(/\s+/);
          $.each( classList, function(index, item){
            ret += item;
          });
          return ret;
        }

        function flash(e) {
            e.fadeOut(0).fadeIn(800);
        }

        function todos_select(selected) {
          var e = $('#todos > tbody:first > tr:eq('+selected+')');
          if (e === undefined) {
            return;
          }
          $.each(todos.list, function (i, t) {
            e = $('#todos > tbody:first > tr:eq('+i+')');
            if (selected === i) {
              if (!e.hasClass('warning')) {
                e.addClass('warning');
              }
            } else {
              if (e.hasClass('warning')) {
                e.removeClass('warning');
              }
            }
          });
          todos.selected = selected;
        }
        function strickes_to_title(ticks) {
          var total_m = ticks * timers.pomodoro.duration.m;
          var minutes = total_m % 60;
          var hours = Math.floor(total_m / 60);
          return hours + 'h' + (minutes < 10 ? '0' : '') + minutes;
        }
        function sticks(nr) {
          var s = "";
          var strokes = Math.floor(nr / 5);
          var rem = nr % 5;
          for (var i = 0; i < strokes; i++) {
            s += '<s>||||</s>';
            s += ' ';
          }
          for (var i = 0; i < rem; i++) {
            s += '|';
          }
          return s;
        }

        function draw_todos(e) {
          $("#todos tbody:first").empty();
          $.each(todos.list, function (i, t) {
            var html = $('<tr class="todo_item" title="'+t.name + ": you spent " + strickes_to_title(t.strikes)+'m so far"/>');
            html.append('<td>' + t.name + '</td>');
            html.append('<td>' + sticks(t.strikes) + '</td>');
            var times = $('<td><i style="text-align:right;" class="icon-remove"></i></td>').click(function (e) {
              var index = html.index();
              if (index === todos.list.selected) {
                todos.list.selected = 0;
              }
              todos.list.splice(index, 1);
              draw_todos();
            });
            html.append(times);
            html.click(
              function(e) {
                todos_select(i);
              }
            );
            $('#todos tbody:first').append(html);
          });
          todos_select(todos.selected);
          if (settings.cookie.value) {
            $.cookie('todos', JSON.stringify(todos), { expires: 7 });
          }
        }

        function new_todo(n) {
          if (n == "")
            return;
          todos.list.push({ name : n, strikes : 0 });
          draw_todos();
        }

	function init_fn () {
		$(document).ready(function () {
			var alt_is_on = false;
			/* Keyboard shortcuts */
			$(document).keyup(function(e) {
				if (e.which == 18) { // alt
					alt_is_on = false;
				}
			});
			$(document).keydown(function(e) {
				if (e.which == 18) { // alt
                                        $("#new_todo").blur();
					alt_is_on = true;
				}
				if (alt_is_on === true) {
					if (e.which == 80) { // 'p'
						$('#start_pomodoro').click();
					} else if (e.which == 83) { // 's'
						$('#start_short').click();
					} else if (e.which == 76) { // 'l'
						$('#start_long').click();
					} else if (e.which == 78) { // 'n'
						$('#new_todo').focus();
					} else if (e.which >= 49 && e.which <= 57) { // '1' - '9'
						var nr = e.which - 49;
						todos_select(nr);
					}
				}
			});
			/* Settings */
			$("input#"+settings.tick.id).prop('checked' , settings.tick.value);
			$("input#"+settings.ring.id).prop('checked' , settings.ring.value);
			$("input#"+settings.cookie.id).prop('checked' , settings.cookie.value);
                        /* Todos */
                        if ($.cookie("todos")) {
                          todos = $.cookie("todos");
                        } else {
				var todos = {
					selected : 0,
					list : [ ],
				};
			}
                        draw_todos();
                        $('#new_todo_button').click(function () {
                          new_todo($("#new_todo").val());
                          $("#new_todo").val('');
                        });
                        $("#new_todo").keyup(function(event){
                          if(event.keyCode == 13){ // enter
                            $("#new_todo_button").click();
                          }
                        });
		});
	}
	return {
		init : init_fn,
		refresh_settings : refresh_settings,
		toggle_activity : toggle_activity,
		todos_select : todos_select,
	};
}());
