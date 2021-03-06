#!/bin/bash

echo "DOWNLOAD: img"
curl -LO "https://github.com/genuinetools/img/releases/download/v0.5.11/img-linux-amd64"
if [ $? -eq 1 ]; then
  echo "ERROR: could not download img binary"
  exit 1
else
  echo "OKAY: downloaded img"
fi

mv img-linux-amd64 img
check_output=`echo "cc9bf08794353ef57b400d32cd1065765253166b0a09fba360d927cfbd158088  img" | sha256sum -c`
okay_string="img: OK"

if [ "$check_output" == "$okay_string" ]; then
  echo "OKAY: downloaded file matches the expected checksum"
  mkdir -p ~/.local/bin/img
  mv ./img ~/.local/bin/img
  chmod +x ~/.local/bin/img/img
else
  echo "ERROR: checksum does not match"
  exit 1
fi
echo "OKAY: img is downloaded and installed."

echo "UPDATING: path to include img"
export PATH=$PATH:~/.local/bin/img/
echo "DONE: path updated"

img build -t $REGISTRY/mealboard:$GO_PIPELINE_LABEL .
img push $REGISTRY/mealboard:$GO_PIPELINE_LABEL
img tag $REGISTRY/mealboard:$GO_PIPELINE_LABEL $REGISTRY/mealboard:latest
img push $REGISTRY/mealboard:latest