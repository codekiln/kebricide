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
function getTrackIds(parentTrack) {
    var api = new LiveAPI(function () { }, 'live_set');
    var trackCount = api.getcount('tracks');
    //log('TRACK COUNT: ' + trackCount)
    var childIds = [];
    for (var index = 0; index < trackCount; index++) {
        api.path = 'live_set tracks ' + index;
        childIds.push(api.id);
    }
    return childIds;
}
function initialize() {
    //log('INITIALIZE')
    var thisDevice = new LiveAPI(function () { }, 'live_set this_device');
    state.trackIds = getTrackIds(thisDevice);
    log('CHILD_IDS: ' + state.trackIds);
}
initialize();
// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
var module = {};
module.exports = {};
