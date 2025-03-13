#!/bin/bash
OS=$(uname)

HOST_IP=''

if [ "$OS" == "Darwin" ]; then
    HOST_IP=$(ifconfig | grep inet | awk 'NR==5' | awk '{print $2}')
elif [ "$OS" == "Linux" ]; then
    HOST_IP=$(ip addr show | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1 | head -n 1)
fi

echo "Machine IP address is :${HOST_IP}"

IP=$HOST_IP  docker-compose up --build
