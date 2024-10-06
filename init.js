
global.save = function() { throw new Error("You don't need to use save() on eucWatch!"); };
global.ew = { "dbg": 0, "log": [], "def": {}, "is": {}, "do": { "reset": {}, "update": {} }, "tid": {}, "temp": {}, "pin": {} };

ew.pin = { BAT: D31, CHRG: D19, BUZZ: D16, BUZ0: 1, BL: D12, i2c: { SCL: D7, SDA: D6 }, touch: { RST: D13, INT: D28 }, disp: { CS: D25, DC: D18, RST: D26, BL: D14 }, acc: { INT: D8 } } ;

E.kickWatchdog();
  KickWd = function() {
    "ram";
    if ((typeof(BTN1) == 'undefined') || (!BTN1.read())) E.kickWatchdog();
  };
var wdint = setInterval(KickWd, process.env.BOARD == "DSD6"?1000:3000);
E.enableWatchdog(process.env.BOARD == "DSD6"?2:30, false);

//devmode
if ((BTN1.read() || require("Storage").read("devmode")) && process.env.BOARD != "BANGLEJS2") {
//if ((BTN1.read() || require("Storage").read("devmode")) && process.env.BOARD != "BANGLEJS2") {
  let mode = (require("Storage").read("devmode"));
  if (mode == "loader") {
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 80);
  }
  else if (mode == "shutdown") {
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 300);
    NRF.sleep();
  }
  else {
    require("Storage").write("devmode", "done");
    NRF.setAdvertising({}, { name: "Espruino-devmode", connectable: true });
    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 100);
    print("Welcome!\n*** DevMode ***\nShort press the side button\nto restart in WorkingMode");
  }

  setWatch(function() {
    "ram";
    require("Storage").erase("devmode");
    require("Storage").erase("devmode.info");
    NRF.setServices({}, { uart: false });
    NRF.setServices({}, { uart: true });
    NRF.disconnect();
    setTimeout(() => {
      reset();
    }, 500);
  }, BTN1, { repeat: false, edge: "rising" });

}
else { //working mode
    

    scr = { "rotate": 0, "mirror": false };
    eval(require('Storage').read('.display'));

    w = require("eucWatch");

    if (require('Storage').read('handler')) eval(require('Storage').read('handler'));
    if (require('Storage').read('clock')) eval(require('Storage').read('clock'));
    if (require('Storage').read('euc')) eval(require('Storage').read('euc'));
  

    digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, [100, 30, 100]);

    /*
    setTimeout(function() {
        //setTimeout(function() { if (global.ew && ew.do) ew.do.update.acc(); }, 1000);
        digitalPulse(ew.pin.BUZZ, ew.pin.BUZ0, 100);
    }, 200);
    */
}