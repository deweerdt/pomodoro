var running = false;
var stop = null;

function start(duration) {
  var timer = null;
  var r = Raphael("holder", 600, 600),
  R = 100,
  init = true,
  param = {stroke: "#fff", "stroke-width": 30},
  hash = document.location.hash,
  marksAttr = {fill: hash || "#444", stroke: "none"},
  start_time = new Date,
  sound = false,
  tick = new Audio("sound/tick.wav"),
  ring = new Audio("sound/ring.wav"),
  html = [
    document.getElementById("s"),
    document.getElementById("m"),
  ];


  // Custom Attribute
  r.customAttributes.arc = function (value, total, R) {
    var alpha = 360 / total * value,
    a = (90 - alpha) * Math.PI / 180,
    x = 300 + R * Math.cos(a),
    y = 300 - R * Math.sin(a),
    color = "hsb(".concat(1, ",", value / total, ", .75)"),
    path;
    if (total == value) {
      path = [["M", 300, 300 - R], ["A", R, R, 0, 1, 1, 299.99, 300 - R]];
    } else {
      path = [["M", 300, 300 - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
    }
    return {path: path, stroke: color};
  };

  drawMarks(R, duration * 60);
  var sec = r.path().attr(param).attr({arc: [0, 60, R]});

  function updateGraph(value, total, R, hand) {
    var color = "hsb(".concat(1, ",", value / total, ", .75)");
    if (init) {
      hand.animate({arc: [value, total, R]}, 900, ">");
    } else {
      if (!value || value == total) {
        value = total;
        hand.animate({arc: [value, total, R]}, 750, "bounce", function () {
          hand.attr({arc: [0, total, R]});
        });
      } else {
        hand.animate({arc: [value, total, R]}, 750, "elastic");
      }
    }
  }
  function updateText(value, total, R, id) {
    var color = "hsb(".concat(1, ",", value / total, ", .75)");
    html[id].innerHTML = (value < 10 ? "0" : "") + value;
    html[id].style.color = Raphael.getRGB(color).hex;
  }

  function drawMarks(R, total) {
    var color = "hsb(1, 1, .75)",
    out = r.set(),
    inc = total / 20;
    for (var value = 0; value < total; value+=inc) {
      var alpha = 360 / total * value,
      a = (90 - alpha) * Math.PI / 180,
      x = 300 + R * Math.cos(a),
      y = 300 - R * Math.sin(a);
      out.push(r.circle(x, y, 2).attr(marksAttr));
    }
    return out;
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
      return;
    }

    updateGraph(done.getTime() / 1000, 60 * duration, R, sec, 0);
    updateText(second_counter, 60, R, 0);
    updateText(minute_counter, duration, R, 1);
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
    updateGraph(0, 60 * duration, R, sec, 0);
  };
}

function toggle_activity(button, duration) {
  if (running) {
    var html_s = document.getElementById("s"),
        html_m = document.getElementById("m");
    reset_ui();
    html_s.innerHTML = "00";
    html_m.innerHTML = duration;
    document.title = $('#time').text();
    stop();
    running = false;
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


