autowatch = 1
inlets = 1
outlets = 1

const config = {
  outputLogs: true,
}

import { logFactory } from './utils'
const log = logFactory(config)

const INLET_FOO = 0
const OUTLET_FOO = 0

setinletassist(INLET_FOO, 'Description of Inlet')
setoutletassist(OUTLET_FOO, 'Description of Outlet')

log('reloaded')

const state = {
  trackIds: [] as number[],
}

function getTrackIds(parentTrack: LiveAPI) {
  const api = new LiveAPI(() => {}, 'live_set')
  const trackCount = api.getcount('tracks')
  //log('TRACK COUNT: ' + trackCount)
  const childIds: number[] = []

  for (let index = 0; index < trackCount; index++) {
    api.path = 'live_set tracks ' + index

    childIds.push(api.id)
  }

  return childIds
}

function initialize() {
  //log('INITIALIZE')
  const thisDevice = new LiveAPI(() => {}, 'live_set this_device')

  state.trackIds = getTrackIds(thisDevice)
  log('CHILD_IDS: ' + state.trackIds)
}

initialize()

// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
const module = {}
export = {}
