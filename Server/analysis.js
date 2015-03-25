exports.process = function (data) {
    var meanAcselV = 0;
    var sensorAboveAverage = [];
    for (var i = 0; i < data.length; i++) {
        var signal = data[i];
        signal.acsel3Square = signal.accelerometer.x * signal.accelerometer.x +
                               signal.accelerometer.y * signal.accelerometer.y +
                               signal.accelerometer.z * signal.accelerometer.z;
        meanAcselV += (signal.acsel3Square) / data.length;
    }
    for (var i = 0; i < data.length; i++) {
        var signal = data[i];
        if (signal.acsel3Square > meanAcselV) {
            var stepHit = { timeMs: signal.timestamp, acsel3Square: signal.acsel3Square }
            sensorAboveAverage.push(stepHit);
        }
        else {
            var stepHit = { timeMs: signal.timestamp, acsel3Square: 0 }
            sensorAboveAverage.push(stepHit);
        }
    }
    var waitCount = 0, walkCount = 0, waitStartTime = sensorAboveAverage[0].timeMs, waitEndTime = sensorAboveAverage[0].timeMs;
    var lastWaitTime = -1;
    var waitStartTimeIndex = -1;
    var stepTimeList = [];
    for (var i = 0; i < sensorAboveAverage.length; i++) {
        // summ of time of continuies continues zero and calcualte
        if (sensorAboveAverage[i].acsel3Square == 0) {
            if (waitCount == 0) {
                if (walkCount != 1) {
                    waitStartTime = sensorAboveAverage[i].timeMs;
                    waitStartTimeIndex = i;
                }
            }
            walkCount = 0;
            waitCount++;
        }
        else {
            walkCount++;
            waitEndTime = sensorAboveAverage[i].timeMs;
            if (waitCount > -3) {
                if (lastWaitTime == waitStartTime) {
                    stepTimeList[stepTimeList.length - 1].stepDuration = waitEndTime - waitStartTime;
                }
                else {
                    var stepTime = { timeStamp: waitStartTime, stepDuration: waitEndTime - waitStartTime };
                    stepTimeList.push(stepTime);
                }

                lastWaitTime = waitStartTime;
            }
            waitCount = 0;
        }
    }


    return stepTimeList;
}
