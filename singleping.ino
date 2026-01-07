#include <NewPing.h>

const int TRIGGER_PIN1 = 7;
const int SENSOR_1_PIN = 6;
const int MAX_DISTANCE = 200;
const int BAUD_RATE = 115200;
const int DELAY_MS = 33; // Send data every 50ms (20 times per second)
int startStop = 0;

NewPing sonar(TRIGGER_PIN1, SENSOR_1_PIN, MAX_DISTANCE);


void setup()
{
    // Initialize serial communication
    Serial.begin(BAUD_RATE);

    Serial.println("Serial Bridge - One Sensor");
    Serial.println("Ready to send data!");

}

void loop()
{
    // Read both analog sensors
    int sensorValue = sonar.ping_cm();

    // Send both values separated by a comma
    // Format: "value1,value2"
    Serial.println(sensorValue);
 
    // Wait before next reading
    delay(DELAY_MS);
}