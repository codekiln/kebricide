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
    var clips = [];
    var clipCount = track.getcount('arrangement_clips');
    var basePath = track.unquotedpath;
    logger("Checking ".concat(clipCount, " arrangement clips"));
    for (var clipIndex = 0; clipIndex < clipCount; clipIndex++) {
        var clipPath = "".concat(basePath, " arrangement_clips ").concat(clipIndex);
        try {
            var clip = (0, utils_1.createValidatedLiveApi)(clipPath);
            logger("Found clip ".concat(clipIndex, ":"));
            logger("- name: ".concat(clip.get('name')));
            logger("- length: ".concat(clip.get('length')));
            clips.push(clip);
        }
        catch (error) {
            (0, utils_1.warn)("Error accessing clip ".concat(clipIndex, ": ").concat(error.message));
            // Continue to next iteration
        }
    }
    return clips;
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
