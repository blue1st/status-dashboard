#!/bin/bash
STATUS=$1
if [ "$STATUS" == "UP" ]; then
  echo "Dummy check: UP"
  exit 0
elif [ "$STATUS" == "NONE" ]; then
  echo "Dummy check: NONE (Skipped/Not Applicable)"
  exit 2
else
  echo "Dummy check: DOWN"
  exit 1
fi
