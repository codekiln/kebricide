"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;
var config = {
    outputLogs: true,
};
var utils_1 = require("./utils");
var logger = (0, utils_1.logFactory)(config);
var INLET_FOO = 0;
var OUTLET_FOO = 0;
setinletassist(INLET_FOO, 'Description of Inlet');
setoutletassist(OUTLET_FOO, 'Description of Outlet');
(0, utils_1.logReload)(logger);
// const state = {
//   trackIds: [] as number[],
// }
function getTracks() {
    var api = new LiveAPI(function () { }, 'live_set');
    var trackCount = api.getcount('tracks');
    //log('TRACK COUNT: ' + trackCount)
    var tracks = [];
    for (var index = 0; index < trackCount; index++) {
        api.path = 'live_set tracks ' + index;
        var trackApi = new LiveAPI(function () { }, api.path);
        tracks.push(trackApi);
    }
    return tracks;
}
function getClips(track) {
    var clipSlots = [];
    var clipSlotCount = track.getcount('clip_slots');
    // if you use track.path instead of track.unquotedpath, you get a path with
    // quotes around it, which won't play well with the path extension below
    var basePath = track.unquotedpath;
    for (var slotIndex = 0; slotIndex < clipSlotCount; slotIndex++) {
        // Build complete path for this iteration
        var clipSlotPath = "".concat(basePath, " clip_slots ").concat(slotIndex);
        var clipSlot = new LiveAPI(function () { }, clipSlotPath);
        // Check if slot has a clip
        if (clipSlot && clipSlot.get('has_clip')) {
            var clipPath = "".concat(clipSlotPath, " clip");
            var clip = new LiveAPI(function () { }, clipPath);
            clipSlots.push(clip);
        }
    }
    return clipSlots;
}
function initialize() {
    logger('initialize');
    var tracks = getTracks();
    tracks.forEach(function (track, index) {
        var name = track.get('name');
        logger("Track ".concat(index, ": ").concat(name));
        var clips = getClips(track);
        logger("Track ".concat(index, " has ").concat(clips.length, " clips"));
    });
}
function compile() {
    logger('COMPILE');
    initialize();
}
function bang() {
    logger('BANG');
    initialize();
}
logger('RELOADED END');
// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
var module = {};
module.exports = {};
