autowatch = 1
inlets = 1
outlets = 1

const config = {
  outputLogs: true,
}

import { logFactory, logReload } from './utils'
const logger = logFactory(config)

const INLET_FOO = 0
const OUTLET_FOO = 0

setinletassist(INLET_FOO, 'Description of Inlet')
setoutletassist(OUTLET_FOO, 'Description of Outlet')

logReload(logger)

// const state = {
//   trackIds: [] as number[],
// }

function getTracks() {
  const api = new LiveAPI(() => {}, 'live_set')
  const trackCount = api.getcount('tracks')
  //log('TRACK COUNT: ' + trackCount)
  const tracks: LiveAPI[] = []

  for (let index = 0; index < trackCount; index++) {
    api.path = 'live_set tracks ' + index
    const trackApi = new LiveAPI(() => {}, api.path)
    tracks.push(trackApi)
  }

  return tracks 
}

function getClips(track: LiveAPI): LiveAPI[] {
  const clipSlots: LiveAPI[] = []
  const clipSlotCount = track.getcount('clip_slots')
  const basePath = track.unquotedpath
  
  for (let slotIndex = 0; slotIndex < clipSlotCount; slotIndex++) {
    const clipSlotPath = `${basePath} clip_slots ${slotIndex}`
    const clipSlot = new LiveAPI(() => {}, clipSlotPath)
    
    // Check if we got a valid object (id !== 0) before trying to use it
    // see also https://docs.cycling74.com/legacy/max8/refpages/live.object#Messages
    if (clipSlot && clipSlot.id !== 0 && clipSlot.get('has_clip')) {
      const clipPath = `${clipSlotPath} clip`
      const clip = new LiveAPI(() => {}, clipPath)
      // Also check if the clip object is valid
      if (clip && clip.id !== 0) {
        clipSlots.push(clip)
      }
    }
  }

  return clipSlots
}

function initialize() {
  logger('initialize')
  const tracks = getTracks()
  
  tracks.forEach((track, index) => {
    const name = track.get('name')
    logger(`Track ${index}: ${name}`)
    
    const clips = getClips(track)
    logger(`Track ${index} has ${clips.length} clips`)
  })
}

function compile() {
  logger('COMPILE')
  initialize()
}

function bang() {
  logger('BANG')
  initialize()
}
logger('RELOADED END')

// NOTE: This section must appear in any .ts file that is directuly used by a
// [js] or [jsui] object so that tsc generates valid JS for Max.
const module = {}
export = {}
