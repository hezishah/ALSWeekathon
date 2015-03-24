
/**  ..... FreeIMU library ....
* Example program for using the FreeIMU connected to an Arduino Leonardo.
* The program reads sensor data from the FreeIMU, computes the yaw, pitch
* and roll using the FreeIMU library sensor fusion and use them to move the
* mouse cursor. The mouse is emulated by the Arduino Leonardo using the Mouse
* library.
*
* @author Fabio Varesano - fvaresano@yahoo.it
*/

//   ..... Adafruit nRF8001 libary ....
/*********************************************************************
This is an example for our nRF8001 Bluetooth Low Energy Breakout

Pick one up today in the adafruit shop!
------> http://www.adafruit.com/products/1697

Adafruit invests time and resources providing this open source code,
please support Adafruit and open-source hardware by purchasing
products from Adafruit!

Written by Kevin Townsend/KTOWN  for Adafruit Industries.
MIT license, check LICENSE for more information
All text above, and the splash screen below must be included in any redistribution
*********************************************************************/

#include <HMC58X3.h>
#include <MS561101BA.h>
#include <I2Cdev.h>
#include <MPU60X0.h>
#include <EEPROM.h>

//#define DEBUG
#include "DebugUtils.h"
#include "IMUduino.h"
#include <Wire.h>
#include <SPI.h>

// Connect CLK/MISO/MOSI to hardware SPI
// e.g. On UNO & compatible: CLK = 13, MISO = 12, MOSI = 11
//      On Leo & compatible: CLK = 15, MISO = 14, MOSI = 16
#define ADAFRUITBLE_REQ 10
#define ADAFRUITBLE_RDY 7     // This should be an interrupt pin, on Uno thats #2 or #3
#define ADAFRUITBLE_RST 9

#include <Adafruit_BLE_UART/Adafruit_BLE_UART.h>

Adafruit_BLE_UART BTLEserial = Adafruit_BLE_UART(ADAFRUITBLE_REQ, ADAFRUITBLE_RDY, ADAFRUITBLE_RST);

aci_evt_opcode_t laststatus = ACI_EVT_DISCONNECTED;
aci_evt_opcode_t status = laststatus;

int raw_values[11];
char str[512];
float val[9];

String strSection;
char sendbuffersize;
uint8_t sendbuffer[21];

int mode = 0; // 0 = accel (default), 1 = gyro, 2 = mag, 3 = baro (temp and baro)

// Set the FreeIMU object
IMUduino my3IMU = IMUduino();

/*#define LED_BUILTIN_IMUDUINO 4*/
#define SERIAL_DEBUG
#define SEND_DATA_TO_BLE

#define SAMPLE_FREQ_HZ 30
#define SAMPLE_PERIOD_MS (1000/SAMPLE_FREQ_HZ)

void setup() {
	////  Mouse.begin();
#ifdef LED_BUILTIN_IMUDUINO
	pinMode(LED_BUILTIN_IMUDUINO, OUTPUT);
#endif
#ifdef SERIAL_DEBUG	
	Serial.begin(115200);
	/*while (!Serial);*/
#endif
	Wire.begin();

	/*Serial.println(F("IMUduino Print echo demo"));*/

	delay(500);
	BTLEserial.begin(230400);
}


static String prefix = "";
static int initms = 0;
static int lastms;

static int pCount = 0;

void loop() {

	btleLoop();
	if (status == ACI_EVT_CONNECTED && prefix.length()) {
		int rawBuff[10];
		memset(rawBuff, 0, sizeof(rawBuff));
		my3IMU.getRawValues(raw_values);

		int ms = millis() - initms;

#if 1
		rawBuff[0] = (prefix[0]&0xFF) + ((pCount++&0xFF)*256);
		memcpy(rawBuff+1, raw_values , sizeof(rawBuff)-sizeof(int));
#else
		// Send raw IMU values to our app!
		/*%X,%X,%X,%X,%X,%X,*/
		sprintf(str, "[%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d,%d]",
			ms,
			raw_values[0],
			raw_values[1],
			raw_values[2],
			raw_values[3],
			raw_values[4],
			raw_values[5],
			raw_values[6],
			raw_values[7],
			raw_values[8],
			raw_values[9],
			raw_values[10]
			);
#endif
		// Our btleWrite() method handles spliting chars into 20-byte chunks
#ifdef SEND_DATA_TO_BLE		
#if 1
		BTLEserial.write((uint8_t *)rawBuff, sizeof(rawBuff));
#else
		btleWrite(str);
#endif
#endif
#if 0 //def SERIAL_DEBUG
		if (Serial) Serial.println(str);
#endif
		int deltams = ms - lastms;
		if (((SAMPLE_PERIOD_MS * 2) - deltams) > 0)
		{
			delay(SAMPLE_PERIOD_MS * 2 - deltams);
		}
#ifdef SERIAL_DEBUG
		else 
			if (Serial) Serial.println("Sample Period Behind");
#endif
		lastms = ms;
	}
}

static int builtInLedState = 0;

/*Led Functions*/
void LedOff()
{
#ifdef LED_BUILTIN_IMUDUINO
	digitalWrite(LED_BUILTIN_IMUDUINO, LOW);
#endif
	builtInLedState = 0;
}
void LedOn()
{
#ifdef LED_BUILTIN_IMUDUINO
		digitalWrite(LED_BUILTIN_IMUDUINO, HIGH);
#endif
		builtInLedState = 1;
}
void LedToggle()
{
#ifdef LED_BUILTIN_IMUDUINO
	digitalWrite(LED_BUILTIN_IMUDUINO, builtInLedState ? LOW : HIGH);
#endif
	builtInLedState = builtInLedState ? 0 : 1;
}

/**************************************************************************/
/*!
Constantly checks for new events on the nRF8001
*/
/**************************************************************************/
static int first = 1;
void btleLoop() {
	// Tell the nRF8001 to do whatever it should be working on.
	BTLEserial.pollACI();

	// Ask what is our current status
	status = BTLEserial.getState();
	// If the status changed....
	if (status != laststatus) {
		// print it out!
		if (status == ACI_EVT_DEVICE_STARTED) {
#ifdef SERIAL_DEBUG	
			if (Serial) Serial.println(F("* Advertising started"));
#endif
		}
		if (status == ACI_EVT_CONNECTED) {
#ifdef SERIAL_DEBUG	
			if (Serial) Serial.println(F("* Connected!"));
#endif
			if (first)
			{
				my3IMU.init(true);
				first = 0;
			}
		}
		if (status == ACI_EVT_DISCONNECTED) {
#ifdef SERIAL_DEBUG	
			if (Serial) Serial.println(F("* Disconnected or advertising timed out"));
#endif
		}
		// OK set the last status change to this one
		laststatus = status;
	}

	if (status == ACI_EVT_CONNECTED) {
		// OK while we still have something to read, get a character and print it out
		while (BTLEserial.available()) {
			prefix = BTLEserial.readString();
#ifdef SERIAL_DEBUG	
			if (Serial) Serial.print(prefix);
#endif
			LedToggle();
			initms = lastms = millis();
		}

		/*LedOff();*/

		// Next up, see if we have any data to get from the Serial console

#ifdef SERIAL_DEBUG	
		if (Serial && Serial.available()) {
			// Read a line from Serial
			Serial.setTimeout(100); // 100 millisecond timeout
			String s = Serial.readString();
			btleWrite(s);
		}
#endif
	}
}

void btleWrite(String s) {
	// We need to convert the line to bytes, no more than 20 at this time
	int len = s.length();
	int subLen = min(20, len + prefix.length() + 1) - prefix.length() -1;
	for (int i = 0; i < len;) {
		strSection = prefix + ":" + s.substring(i, i + subLen+1);
		i += subLen;
		strSection.getBytes(sendbuffer, subLen+prefix.length() + 2);

		sendbuffersize = min(20, strSection.length());

		// write the data
		BTLEserial.write(sendbuffer, sendbuffersize);
		BTLEserial.pollACI(); // We need to let our BTLE serial object poll, otherwise our Arduino sketch freezes up after about 3 to 6 write() calls.
		sendbuffersize = 0;
		strSection = "";
		subLen = min(20, len - i + prefix.length() + 1) - prefix.length() - 1;
	}
}

byte * float2str(float arg) {
	// get access to the float as a byte-array:
	byte * data = (byte *) &arg;
	return data;
}

#include <Adafruit_BLE_UART/Adafruit_BLE_UART.cpp>