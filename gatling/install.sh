#! /usr/bin/env sh

GATLING_VERSION="3.9.5"

mkdir -p gatling/deps && \
  echo "Downloading Gatling ${GATLING_VERSION}" && \
  curl -fsSL "https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/${GATLING_VERSION}/gatling-charts-highcharts-bundle-3.9.5-bundle.zip" > ./gatling/deps/gatling.zip && \
  cd gatling/deps/ && \
  rm -rf ./gatling && \
  unzip gatling.zip && \
  mv gatling-charts-highcharts-bundle-3.9.5 gatling && \
  rm gatling.zip && \
  cd .. && \
  echo "All done!"
