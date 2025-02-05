"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logReload = exports.warn = exports.logFactory = void 0;
function logFactory(_a) {
    var _b = _a.outputLogs, outputLogs = _b === void 0 ? true : _b;
    function log() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            var s = String(args[i]);
            post(s.indexOf('[object ') >= 0 ? JSON.stringify(args[i]) : s);
        }
        post('\n');
    }
    if (!outputLogs) {
        // No-op if we don't want to output logs
        return function () { };
    }
    return log;
}
exports.logFactory = logFactory;
function warn() {
    for (var i = 0; i < arguments.length; i++) {
        var s = String(arguments[i]);
        error(s.indexOf("[object ") >= 0 ? JSON.stringify(arguments[i]) : s);
    }
    error("\n");
}
exports.warn = warn;
function logReload(logger) {
    var now = new Date();
    var timeString = now.toLocaleTimeString("en-US", { hour: 'numeric', minute: '2-digit', hour12: true });
    logger("------------------------------------------------------------------");
    logger("Reloaded on", timeString); // Example output: "js: Reloaded on  06:13:37"
    logger("------------------------------------------------------------------");
}
exports.logReload = logReload;
