"use strict";
autowatch = 1;
inlets = 1;
outlets = 1;
var config = {
    outputLogs: true,
};
var utils_1 = require("./utils");
var log = (0, utils_1.logFactory)(config);
var INLET_FOO = 0;
var OUTLET_FOO = 0;
setinletassist(INLET_FOO, 'Description of Inlet');
setoutletassist(OUTLET_FOO, 'Description of Outlet');
log('reloaded');
var state = {
    trackIds: [],
};
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
    for (var slotIndex = 0; slotIndex < clipSlotCount; slotIndex++) {
        track.path = "".concat(track.path, " clip_slots ").concat(slotIndex);
        var clipSlot = new LiveAPI(function () { }, track.path);
        // Check if slot has a clip
        if (clipSlot.get('has_clip')) {
            track.path = "".concat(track.path, " clip");
            var clip = new LiveAPI(function () { }, track.path);
            clipSlots.push(clip);
        }
    }
    return clipSlots;
}
function initialize() {
    var tracks = getTracks();
    tracks.forEach(function (track, index) {
        var name = track.get('name');
        log("Track ".concat(index, ": ").concat(name));
        var clips = getClips(track);
        log("Track ".concat(index, " has ").concat(clips.length, " clips"));
    });
}
initialize();
// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
var module = {};
module.exports = {};
