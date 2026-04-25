#!/bin/bash
URL=$1
if curl -s --head  --request GET "$URL" | grep "200 OK" > /dev/null; then
  echo "Successfully connected to $URL"
  exit 0
else
  echo "Failed to connect to $URL"
  exit 1
fi
