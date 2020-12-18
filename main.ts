let i: number;
let MAXDATA = 1200
radio.setTransmitPower(7)
radio.setGroup(88)
let sensordata = control.createBuffer(MAXDATA)
// SENSOR DATA - 8 bit per reading
for (i = 0; i < sensordata.length; i++) {
    sensordata[i] = 0
}
let tstamps = control.createBuffer(MAXDATA * 4)
//  TIMESTAMPS - 32 bit per reading
for (i = 0; i < tstamps.length; i++) {
    tstamps[i] = 0
}
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
input.onButtonPressed(Button.A, function on_button_pressed_a() {
    let dat: any;
    
    let idx = 0
    let stmp = getStampAtPos(idx)
    let buff = control.createBuffer(5)
    while (stmp != 0) {
        dat = getDataAtPos(idx)
        buff[0] = sensordata[idx]
        buff[1] = tstamps[4 * idx]
        buff[2] = tstamps[4 * idx + 1]
        buff[3] = tstamps[4 * idx + 2]
        buff[4] = tstamps[4 * idx + 3]
        radio.sendBuffer(buff)
        console.log("" + stmp + ", " + ("" + dat))
        stmp = getStampAtPos(idx)
    }
})
radio.onReceivedBuffer(function on_received_buffer(rBuffer: Buffer) {
    let dat = rBuffer[0]
    let tmstmp = rBuffer[1] + rBuffer[2] * 256 + rBuffer[3] * 65536 + rBuffer[4] * 16777216
    console.log("" + tmstmp + ", " + ("" + dat))
})
