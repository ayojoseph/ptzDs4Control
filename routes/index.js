var express = require('express');
const ds = require('dualshock');
const chalk = require('chalk');
var router = express.Router();
const axios = require('axios');
var camera_ip = "192.168.1.243";
var base_url = "http://" + camera_ip + "/cgi-bin";

var ATEM = require("applest-atem");
var atem = new ATEM({
  forceOldStyle: true
});

atem.connect("192.168.1.215");

// //atem functions
atem.on("connect", function() {
  atem.changeProgramInput(5); // ME1(0)
  atem.changePreviewInput(6); // ME1(0)
  atem.autoTransition(); // ME1(0)
  atem.changeProgramInput(3, 1); // ME2(1)
});

var defaults = {
  ip: camera_ip,
  flip: 1,
  mirror: 1,
  invertcontrols: 0,
  infinitypt: 0,
  infinityzoom: 0,
  infinityfocus: 0,
  panspeed: 20,
  zoomspeed: 5,
  tiltspeed: 20,
  focusspeed: 3,
  autopaninterval: 60
};
var config = defaults;
config.ip = camera_ip;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function run_action(action_url) {
  console.log(action_url);
  axios.get(action_url);
}

function change_ip(cam) {
  if (cam == 1) {
    camera_ip = "192.168.1.246";
  } else {
    camera_ip = "192.168.1.243";
  }

  base_url = "http://" + camera_ip + "/cgi-bin";
}

function cam_pantilt(camera, action) {
  switch (action) {
    case "left":
      if (config.invertcontrols == "1") {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&right&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      } else {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&left&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      }
      break;

    case "right":
      if (config.invertcontrols == "1") {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&left&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      } else {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&right&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      }
      break;

    case "up":
      if (config.invertcontrols == "1") {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&down&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      } else {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&up&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      }
      break;

    case "down":
      if (config.invertcontrols == "1") {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&up&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      } else {
        var loc =
            base_url +
            "/ptzctrl.cgi?ptzcmd&down&" +
            config.panspeed +
            "&" +
            config.tiltspeed +
            "";
      }
      break;

    case "home":
      var loc =
          base_url +
          "/ptzctrl.cgi?ptzcmd&home&" +
          config.panspeed +
          "&" +
          config.tiltspeed +
          "";
      break;

    case "stop":
      var loc = base_url + "/ptzctrl.cgi?ptzcmd&ptzstop";
      break;
  }

  run_action(loc);
}

function cam_zoom(camera, action) {
  var loc =
      base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + config.zoomspeed + "";
  run_action(loc);
}

function cam_focus(camera, action) {
  var loc =
      base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + config.focusspeed + "";
  run_action(loc);
}

function cam_preset(camera, positionnum, action) {
  var loc = base_url + "/ptzctrl.cgi?ptzcmd&" + action + "&" + positionnum + "";
  run_action(loc);
}


devices = ds.getDevices("ds4");
// console.log(devices);
begin();

function begin() {
  waitForExit();

  //Get list of devices. Accepts optional string to filter by type.
  var list = ds.getDevices();

  console.log(chalk.green("Devices:"),list);
  if(list.length < 1) { console.log(chalk.red("Could not find a controller!")); process.exit(); }

  //Get gamepad's device object:
  var device = list[0];

  //Open device, return gamepad object:
  var gamepad = ds.open(device, {smoothAnalog:10, smoothMotion:15, joyDeadband:4, moveDeadband:4});
  gamepad.rumble(255, 255, 5, 500);
  gamepad.setLed(255, 255, 12);

  //If you want to react to button presses to trigger rumble and led functions, you can do so like this:
  gamepad.ondigital = function(button, value) {
    console.log("BUTTON '"+button+"' = "+value);
    rumbleScript(button, value, 'd', this);
  };
  cam_pantilt(1, "home");

  gamepad.ondigital = function(button, value) {
    //DOWN
    if (button == "down") {
      if (value) {
        cam_pantilt(1, "down");
      } else {
        cam_pantilt(1, "stop");
      }
    }

    //UP
    if (button == "up") {
      if (value) {
        cam_pantilt(1, "up");
      } else {
        cam_pantilt(1, "stop");
      }
    }

    //LEFT
    if (button == "left") {
      if (value) {
        cam_pantilt(1, "left");
      } else {
        cam_pantilt(1, "stop");
      }
    }

    //RIGHT
    if (button == "right") {
      if (value) {
        cam_pantilt(1, "right");
      } else {
        cam_pantilt(1, "stop");
      }
    }

    //ZOOM-IN
    if (button == "y") {
      if (value) {
        cam_zoom(1, "zoomin");
      } else {
        cam_zoom(1, "zoomstop");
      }
    }

    //ZOOM OUT
    if (button == "a") {
      if (value) {
        cam_zoom(1, "zoomout");
      } else {
        cam_zoom(1, "zoomstop");
      }
    }

    //FOCUS-IN
    if (button == "b") {
      if (value) {
        // stop_autopan();
        cam_focus(1, "focusin");
        // clear_active_preset();
      } else {
        cam_focus(1, "focusstop");
      }
    }

    //FOCUS OUT
    if (button == "x") {
      if (value) {
        cam_focus(1, "focusout");
      } else {
        cam_focus(1, "focusstop");
      }
    }

    //SWITCH CAMERA
    if (button == "r1") {
      change_ip(1);
    }

    if (button == "l1") {
      change_ip(0);
    }

    //PRESETS 1 AND 2
    if (button == "r2") {
      cam_preset(1, 1, "poscall");
    }

    if (button == "l2") {
      cam_preset(1, 2, "poscall");
    }

    if (button == "l3" && value) {
      atem.cutTransition();
    }

    if (button == "r3" && value) {
      atem.autoTransition();
    }
  };




  gamepad.onmotion = true;
  gamepad.onstatus = true;

  //DS4 Only: Random LED Stuffs:
  /*setInterval(function() {
      gamepad.setLed(Math.floor(Math.random()*255),Math.floor(Math.random()*255),Math.floor(Math.random()*255));
  }, 100);*/


  function rumbleScript(chg, g) {
    //Rumble On:
    if(chg.l2 || chg.r2) { g.rumbleAdd(g.analog.l2?g.analog.l2:-1, g.analog.r2?255:-1, 254, 254); console.log("rumble set", [g.analog.l2,(g.analog.r2>0)?255:0]); }
    else if(chg.l3 && g.digital.l3) { g.rumbleAdd(94, 0, 255, 0); console.log("rumble slow"); }
    else if(chg.start && g.digital.start) { g.rumbleAdd(0, 255, 0, 5); console.log("rumble tap"); }
    //Rumble Off:
    if((chg.l2 || chg.r2 || chg.l3 || chg.start) && !(g.analog.l2 || g.analog.r2 || g.digital.l3 || g.digital.start)) { g.rumble(0, 0); console.log("rumble off"); }
    //Change LED Pattern:
    if(chg.ps && g.digital.ps) { g.setLed(nLedVal); console.log("led set "+nLedVal); nLedVal++; if(nLedVal > 15) nLedVal = 0; }
  }

  //See how much easier this is with onupdate?
  //Some apps work well with ondigital & onanalog, while others work better using onupdate.
  //While we're at it, we also changed that first rumble to a rumbleAdd. (So it wont cancel any current rumbles already going on)
  //Setting a value to -1 in rumbleAdd overrides to 0 for that value, otherwise setting to 0 would not override any current value.

  //If gamepad is disconnected, exit application:
  gamepad.ondisconnect = function() {
    console.log(chalk.red(this.type.toUpperCase()+" disconnected!"));
    process.exit();
  }

  //If any error happens, log it and exit:
  gamepad.onerror = function(error) {
    console.log(chalk.red(error));
    process.exit();
  }
}

function waitForExit() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function(text) {
    while(text.search('\n') != -1) text = text.substring(0, text.search('\n'));
    while(text.search('\r') != -1) text = text.substring(0, text.search('\r'));
    if(text == "exit" || text == "quit") {
      console.log(chalk.magenta("Exiting..."));
      process.exit();
    }
  });
}



module.exports = router;
