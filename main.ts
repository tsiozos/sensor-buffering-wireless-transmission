let MAXDATA = 1200
let sensordata = control.createBuffer(MAXDATA)
// SENSOR DATA - 8 bit per reading
let tstamps = control.createBuffer(MAXDATA * 4)
//  TIMESTAMPS - 32 bit per reading
function getDataAtPos(pos: number) {
    
    return sensordata[pos]
}

function getStampAtPos(pos: number) {
    
    let tpos = 4 * pos
    let tmstmp = tstamps[tpos] + tstamps[tpos + 1] * 256 + tstamps[tpos + 2] * 65536 + tstamps[tpos + 3] * 16777216
    return tmstmp
}

function putDataAtPos(pos: number, tstamp: number, data: number) {
    
    let tpos = 4 * pos
    tstamps[tpos] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 1] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 2] = tstamp % 256
    tstamp = Math.idiv(tstamp, 256)
    // chop last byte
    tstamps[tpos + 3] = tstamp
    sensordata[pos] = data
    let tmstmp = tstamps[tpos] + tstamps[tpos + 1] * 256 + tstamps[tpos + 2] * 65536 + tstamps[tpos + 3] * 16777216
    data = sensordata[pos]
}

basic.pause(1050)
putDataAtPos(0, input.runningTime() / 1000, 66)
let dt = getDataAtPos(0)
let st = getStampAtPos(0)
console.log("Timestamp=" + ("" + st) + " data=" + ("" + dt))
basic.pause(1050)
putDataAtPos(1, input.runningTime() / 1000, 77)
dt = getDataAtPos(1)
st = getStampAtPos(1)
console.log("Timestamp=" + ("" + st) + " data=" + ("" + dt))
