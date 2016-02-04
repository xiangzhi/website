#!/bin/bash

cp *.conf /etc/init
chown root:root /etc/init/*.conf
chmod 644 /etc/init/*.conf
