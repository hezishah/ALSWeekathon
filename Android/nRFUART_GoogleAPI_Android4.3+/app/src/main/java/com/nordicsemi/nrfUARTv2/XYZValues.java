package com.nordicsemi.nrfUARTv2;

/**
 * Created by hezi on 24/03/2015.
 */
public class XYZValues {
    private float x;
    private float y;
    private float z;

    public XYZValues(float x, float y, float z)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }


    public void setX(float x) {
        this.x = x;
    }

    public float getX() {
        return x;
    }
    public void setY(float y) {
        this.y = y;
    }

    public float getY() {
        return y;
    }

    public void setZ(float z) {
        this.z = z;
    }

    public float getZ() {
        return z;
    }


}
