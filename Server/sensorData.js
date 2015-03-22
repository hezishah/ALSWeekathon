// represents a batch of sensor samples 
var SensorDataSample = function(){
		var sensorData = {
			userId: "userId",
			timestamp: new Date().getTime(),
			signals: [
				{
					timestamp: new Date().getTime(),
					packetId: 1,
					
					accelerometer: { x: 0.0, y: 0.0, z: 0.0},
					gyro: { x: 0.0, y: 0.0, z: 0.0},
					magnetometer: { x: 0.0, y: 0.0, z: 0.0},
					barometer: 0.0,
					pressure: 0.0	
				},
				{
					timestamp: new Date().getTime(),
					packetId: 2,
					
					accelerometer: { x: 0.0, y: 0.0, z: 0.0},
					gyro: { x: 0.0, y: 0.0, z: 0.0},
					magnetometer: { x: 0.0, y: 0.0, z: 0.0},
					barometer: 0.0,
					pressure: 0.0	
				},
				{
					timestamp: new Date().getTime(),
					packetId: 3,
					
					accelerometer: { x: 0.0, y: 0.0, z: 0.0},
					gyro: { x: 0.0, y: 0.0, z: 0.0},
					magnetometer: { x: 0.0, y: 0.0, z: 0.0},
					barometer: 0.0,
					pressure: 0.0	
				}
			]	
		};
		
		return sensorData;
	}
}

