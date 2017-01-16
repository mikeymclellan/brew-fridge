#!/bin/sh

# Exports GPIO14 to userspace
echo "14" > /sys/class/gpio/export

# Sets GPIO14 as an output
echo "out" > /sys/class/gpio/gpio14/direction

# Sets pin GPIO14 to low
echo "0" > /sys/class/gpio/gpio14/value
