package com.nordicsemi.nrfUARTv2;

import android.opengl.GLSurfaceView;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

import android.opengl.GLU;
import java.nio.FloatBuffer;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;

/**
 * Created by hezi on 24/03/2015.
 */
public class MyGLRenderer implements GLSurfaceView.Renderer {

    private Cube mCube = new Cube();
    private Cube mCube2 = new Cube();
    private float mCubeRotation;
    private float mCubeRotation2;

    public float mYaw,mPitch,mRoll;
    public float mYaw2,mPitch2,mRoll2;
    @Override
    public void onSurfaceCreated(GL10 gl, EGLConfig config) {
        // Set the background frame color
        gl.glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
        gl.glClearDepthf(1.0f);
        /*gl.glEnable(GL10.GL_DEPTH_TEST);*/
        gl.glDepthFunc(GL10.GL_LEQUAL);

        gl.glHint(GL10.GL_PERSPECTIVE_CORRECTION_HINT,
                GL10.GL_NICEST);
    }

    @Override
    public void onDrawFrame(GL10 gl) {
        // Redraw background color
        gl.glClear(gl.GL_COLOR_BUFFER_BIT);

        gl.glLoadIdentity();
        gl.glTranslatef(-2.0f, 0.0f, -10.0f);
        gl.glRotatef(mPitch, 1, 0, 0);
        gl.glRotatef(mYaw, 0, 1, 0);
        gl.glRotatef(mRoll, 0, 0, 1);
        mCube.draw(gl,GL10.GL_LINES);

        gl.glLoadIdentity();
        gl.glTranslatef(2.0f, 0.0f, -10.0f);
        gl.glRotatef(mPitch2, 1, 0, 0);
        gl.glRotatef(mYaw2, 0, 1, 0);
        gl.glRotatef(mRoll2, 0, 0, 1);
        mCube2.draw(gl,GL10.GL_LINES);

        gl.glLoadIdentity();

        /*mCubeRotation -= 0.15f;
        mCubeRotation2 += 0.15f;*/
    }

    @Override
    public void onSurfaceChanged(GL10 gl, int width, int height) {
        gl.glViewport(0, 0, width, height);
        gl.glMatrixMode(GL10.GL_PROJECTION);
        gl.glLoadIdentity();
        GLU.gluPerspective(gl, 45.0f, (float)width / (float)height, 0.1f, 100.0f);
        gl.glViewport(0, 0, width, height);

        gl.glMatrixMode(GL10.GL_MODELVIEW);
        gl.glLoadIdentity();
    }
}

class Cube {
    /*** Vertex position Buffer objects
    */
    private FloatBuffer mVertexBuffer;
    /**
    The * vertex colors Buffer object
    */
    private FloatBuffer mColorBuffer;
    /**
            * Entity mode vertex index object
    */
    private ByteBuffer mIndexBuffer;
    /**
            * Wireframe mode vertex index object
    */
    private ByteBuffer mLineIndexBuffer;
    public Cube ()
    {
        float one = 1.0f;
        /**
        * The position of the vertex coordinate array
            * The cube has eight vertices
        */
        float vertices [] = {
                -1.0f,-one,-one, //Vertex 0
        one,-one,-one, //1
        one, one,-one, //2
            -1.0f, one,-one, //3
            -1.0f,-one, one, //4
        one,-one, one, //5
        one, one, one, //6
            -1.0f, one, one, //7
        };
        /**
        * Vertex array of colors
        *, Respectively, to the eight vertices specified different colors, RGBA mode
            */
        float colors [] = {
                0, 0, 0, one, //Vertex 0
        one, 0, 0, one, //1
        one, one, 0, one, //2
        0, one, 0, one, //3
        0, 0, one, one, //4
        one, 0, one, one, //5
        one, one, one, one, //6
        0, one, one, one, //7
        };
        /**
        * Entity mode, the cube has six faces, each face two triangles
            * Specify the index of each face.
            */
        byte indices [] = {
                0, 4, 5, 0, 5, 1, //Face 0
        1, 5, 6, 1, 6, 2, //1
        2, 6, 7, 2, 7, 3, //2
        3, 7, 4, 3, 4, 0, //3
        4, 7, 6, 4, 6, 5, //4
        3, 0, 1, 3, 1, 2 //5
        };
        /**
        * Wireframe mode, the cube has 8 vertices, 12 edges,
        * 12 line segments used to specify the mode of drawing a line
            */
        byte lineIndices [] = {
                0, 1, //Line 0
        0, 3, //1
        0, 4, //2
        1, 2, //3
        1, 5, //4
        2, 3, //5
        2, 6, //6
        3, 7, //7
        4, 5, //8
        4, 7, //9
        5, 6, //10
        6, 7 //11
        };
        //Array to generate direct rendering java.nio.Buffer

            //Vertex position Buffer
        ByteBuffer vbb = ByteBuffer.allocateDirect (vertices.length * 4);
        vbb.order (ByteOrder.nativeOrder ());
        mVertexBuffer = vbb.asFloatBuffer ();
        mVertexBuffer.put (vertices);
        mVertexBuffer.position (0);
        //Vertex colors Buffer
        ByteBuffer cbb = ByteBuffer.allocateDirect (colors.length * 4);
        cbb.order (ByteOrder.nativeOrder ());
        mColorBuffer = cbb.asFloatBuffer ();
        mColorBuffer.put (colors);
        mColorBuffer.position (0);
        //Entity mode vertex index Buffer
            mIndexBuffer = ByteBuffer.allocateDirect (indices.length);
        mIndexBuffer.put (indices);
        mIndexBuffer.position (0);
        //Vertex index //wireframe mode Buffer
        mLineIndexBuffer = ByteBuffer.allocateDirect (lineIndices.length);
        mLineIndexBuffer.put (lineIndices);
        mLineIndexBuffer.position (0);
    }

    /**
            * Based on the incoming mode to render the entity mode cubes and wireframe cube
    * _AT_ Param gl - OpenGL ES rendering objects
    * _AT_ Param mode - rendering mode, GL10.GL_TRIANGLES the entity mode GL10.GL_LINES wireframe mode
    */
    public void draw (GL10 gl, int mode) {
        gl.glEnableClientState (GL10.GL_VERTEX_ARRAY);

        if (mode == GL10.GL_TRIANGLES) {
            //If the entity mode is enabled color to each vertex specify a color
            gl.glEnableClientState (GL10.GL_COLOR_ARRAY);
            gl.glVertexPointer (3, GL10.GL_FLOAT, 0, mVertexBuffer);
            gl.glColorPointer (4, GL10.GL_FLOAT, 0, mColorBuffer);
            gl.glDrawElements (GL10.GL_TRIANGLES, 36, GL10.GL_UNSIGNED_BYTE, mIndexBuffer);
        }
        else if (mode == GL10.GL_LINES) {
            gl.glVertexPointer (3, GL10.GL_FLOAT, 0, mVertexBuffer);
            gl.glDrawElements (GL10.GL_LINES, 24, GL10.GL_UNSIGNED_BYTE, mLineIndexBuffer);
        }
    }
}