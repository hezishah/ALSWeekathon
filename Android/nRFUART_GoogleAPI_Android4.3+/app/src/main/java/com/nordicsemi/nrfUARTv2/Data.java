package com.nordicsemi.nrfUARTv2;

/**
 * Created by hezi on 24/03/2015.
 */
public class Data {

    private String timestamp;
    private int packetId;
    private XYZValues accelerometer;
    private XYZValues gyro;
    private XYZValues magnetometer;
    private float barometer;
    private float pressure;

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public int getPacketId() {
        return packetId;
    }

    public void setPacketId(int packetId) {
        this.packetId = packetId;
    }

    public void setAccelerometer(XYZValues accelerometer) {
        this.accelerometer = accelerometer;
    }

    public XYZValues getAccelerometer() {
        return accelerometer;
    }

    public void setGyro(XYZValues gyro) {
        this.gyro = gyro;
    }

    public XYZValues getGyro() {
        return gyro;
    }

    public void setMagnetometer(XYZValues magnetometer) {
        this.magnetometer = magnetometer;
    }

    public XYZValues getMagnetometer() {
        return magnetometer;
    }

    public void setBarometer(float barometer) {
        this.barometer = barometer;
    }

    public float getBarometer() {
        return barometer;
    }

    public void setPressure(float pressure) {
        this.pressure = pressure;
    }

    public float getPressure() {
        return pressure;
    }

}