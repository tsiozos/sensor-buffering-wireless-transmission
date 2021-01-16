MAXDATA = 1200
globalIDX = 0
radio.set_transmit_power(7)
radio.set_group(88)
input.temperature() #prepare sensor

sensordata = bytearray(MAXDATA)  #SENSOR DATA - 8 bit per reading
for i in range(sensordata.length):
    sensordata[i]=0
tstamps = bytearray(MAXDATA*4)   # TIMESTAMPS - 32 bit per reading
for i in range(tstamps.length):
    tstamps[i]=0

def getDataAtPos(pos):
    global sensordata
    return sensordata[pos]

def getStampAtPos(pos):
    global tstamps
    tpos = 4*pos
    tmstmp = tstamps[tpos]+\
                tstamps[tpos+1]*256+\
                tstamps[tpos+2]*65536+\
                tstamps[tpos+3]*16777216
    return tmstmp

def strrepl(s,old,new):
    ss = str(s)
    so = str(old)
    sn = str(new)
    snew = ""
    for i in range(len(ss)):
        if ss.char_at(i)==so:
            snew=snew+sn
        else:
            snew=snew+ss.char_at(i)
    return snew    

def putDataAtPos(pos, tstamp, data):
    global sensordata, tstamps
    tpos = 4*pos
    tstamps[tpos]=tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+1]= tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+2]= tstamp % 256
    tstamp = tstamp // 256      #chop last byte
    tstamps[tpos+3]= tstamp
    sensordata[pos]=data

    tmstmp = tstamps[tpos]+\
                tstamps[tpos+1]*256+\
                tstamps[tpos+2]*65536+\
                tstamps[tpos+3]*16777216
    data = sensordata[pos]

# basic.pause(1050)
# putDataAtPos(0, input.running_time()/1000,66)
# dt = getDataAtPos(0)
# st = getStampAtPos(0)

#print("Timestamp="+str(st)+" data="+str(dt))
# basic.pause(1050)
# putDataAtPos(1, input.running_time()/1000,77)
# dt = getDataAtPos(1)
# st = getStampAtPos(1)
# print("Timestamp="+str(st)+" data="+str(dt))


def on_button_pressed_a():
    global sensordata, tstamps, globalIDX
    print("-------------------")
    stmp = getStampAtPos(0)
    buff = bytearray(5)
    for i in range(globalIDX):
        buff[0]=sensordata[i]
        buff[1]=tstamps[4*i]
        buff[2]=tstamps[4*i+1]
        buff[3]=tstamps[4*i+2]
        buff[4]=tstamps[4*i+3]
        radio.send_buffer(buff)
        print(str(stmp)+", "+str(buff[0]))
        stmp = getStampAtPos(i)
        basic.pause(50)
input.on_button_pressed(Button.A, on_button_pressed_a)

def on_button_pressed_b():
    basic.show_number(input.temperature())

input.on_button_pressed(Button.B, on_button_pressed_b)



def on_received_buffer(rBuffer):
    dat = Math.map(rBuffer[0],0,255,-100,500)/10
    tmstmp = rBuffer[1]+\
                rBuffer[2]*256+\
                rBuffer[3]*65536+\
                rBuffer[4]*16777216
    sdat = strrepl(dat,".",",")
    print(str(RadioPacketProperty.SERIAL_NUMBER)+':'+str(tmstmp)+"; "+sdat)

radio.on_received_buffer(on_received_buffer)

def getNewData():
    global globalIDX
    dat = input.temperature()
    dat = Math.floor(Math.map(dat*10, -100,500,0,255))  #convert to byte from -10.0 to 50.0 C
    tst = input.running_time()/1000
    olddat = getDataAtPos(globalIDX)
    if olddat != dat:   # write new data only if they change
        globalIDX += 1  #next empty position
        putDataAtPos(globalIDX,tst,dat) #write data

def onSet_interval_interval():
    global globalIDX
    led.plot(2, 2)
    #print(str(globalIDX))
    getNewData()
    basic.pause(100)
    led.unplot(2, 2)    #flash a led

control.set_interval(onSet_interval_interval, 60000, control.IntervalMode.INTERVAL)


def onSet_interval_interval2():     #every 15 minutes send the data
    on_button_pressed_a()

control.set_interval(onSet_interval_interval2, 60000*15, control.IntervalMode.INTERVAL) #every 15 minutes