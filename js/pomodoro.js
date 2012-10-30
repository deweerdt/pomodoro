var running = false;
var stop = null;

function color_hex(color) {
  var r = Math.round(color[0] * 255),
      g = Math.round(color[1] * 255),
      b = Math.round(color[2] * 255);
  return '#'+r.toString(16)+g.toString(16)+b.toString(16);
}

function hsv_to_rgb(color) {
  var h = color[0],
      s = color[1],
      v = color[2];
  var c = s * v;
  var h1 = Math.floor(h * 6) % 6;
  var x = c * (1 - Math.abs((h1 % 2) - 1));
  var r1, g1, b1;

  switch(h1) {
    case 0:
      r1 = c;
      g1 = x;
      b1 = 0;
      break;
    case 1:
      r1 = x;
      g1 = c;
      b1 = 0;
      break;
    case 2:
      r1 = 0;
      g1 = c;
      b1 = x;
      break;
    case 3:
      r1 = 0;
      g1 = x;
      b1 = c;
      break;
    case 4:
      r1 = x;
      g1 = 0;
      b1 = c;
      break;
    case 5:
      r1 = c;
      g1 = 0;
      b1 = x;
      break;
  }
  var m = v - c;
  return [r1 + m, g1 + m, b1 + m];
}

function start(duration) {

  var start_time = new Date,
      sound = false,
      timer = null,
      tick = new Audio("sound/tick.wav"),
      ring = new Audio("sound/ring.wav"),
      html = {
        's' : document.getElementById("s"),
        'm' : document.getElementById("m"),
        'b' : document.getElementById("b"),
      };

  function update_bar(value, total) {
    $('div#b').width((value * 100 / total) + "%");
  }
  function update_text(value, total, id) {
    var color_hsv = [ 1, value / total, 0.75 ];
    html[id].innerHTML = (value < 10 ? "0" : "") + value;
    html[id].style.color = color_hex(hsv_to_rgb(color_hsv));
  }

  running = true;

  (function () {
    var d = new Date;
    done = new Date(d - start_time),
    second_counter = 59 - done.getSeconds(),
    minute_counter = duration - 1 - done.getMinutes();
    if (minute_counter < 0) {
      ring.play();
      stop();
      stop = null;
      return;
    }

    update_bar(done.getTime() / 1000, 60 * duration);
    update_text(second_counter, 60, 's');
    update_text(minute_counter, duration, 'm');
    document.title = $('#time').text();
    if (sound) {
      tick.play();
    }
    timer = setTimeout(arguments.callee, 1000);

    init = false;
  })();

  return function () {
    clearTimeout(timer);
    init = true;
    update_bar(0, 60 * duration);
  };
}

function toggle_activity(button, duration) {
  if (running) {
    var html_s = document.getElementById("s"),
        html_m = document.getElementById("m");
    running = false;
    reset_ui();
    if (stop !== null)
      stop();
    stop = null;
    html_s.innerHTML = "00";
    html_m.innerHTML = (duration < 10 ? "0" : "") + duration;
    document.title = $('#time').text();
  } else {
    var text = button.html();
    text = text.replace('Start', 'Stop');
    button.removeClass('btn-primary');
    button.addClass('btn-warning');
    button.html(text);
    stop = start(duration);
  }
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

/* Keyboard shortcuts */
$(document).ready(function () {
  $(document).keydown(function(e) {
    if (e.which == 80) { // 'p'
      document.getElementById('start_pomodoro').click();
    } else if (e.which == 83) { // 's'
      document.getElementById('start_short').click();
    } else if (e.which == 76) { // 'l'
      document.getElementById('start_long').click();
    }
  });

});


