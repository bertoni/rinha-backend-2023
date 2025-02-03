ARG GATLING_VERSION=3.9.5

FROM amazoncorretto:17-alpine3.21-jdk

ARG GATLING_VERSION

WORKDIR /gatling

RUN apk add unzip coreutils curl \
  && mkdir deps \
  && cd deps/ \
  && echo "Downloading Gatling ${GATLING_VERSION}" \
  # && curl -fsSL "https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/${GATLING_VERSION}/gatling-charts-highcharts-bundle-3.9.5-bundle.zip" > ./deps/gatling.zip \
  && wget "https://repo1.maven.org/maven2/io/gatling/highcharts/gatling-charts-highcharts-bundle/${GATLING_VERSION}/gatling-charts-highcharts-bundle-3.9.5-bundle.zip" \
  # && rm -rf ./gatling \
  && unzip gatling-charts-highcharts-bundle-3.9.5-bundle.zip \
  && mv gatling-charts-highcharts-bundle-3.9.5 gatling \
  && rm gatling-charts-highcharts-bundle-3.9.5-bundle.zip \
  && cd .. \
  && echo "All done!"

  COPY ./user-files ./user-files
  COPY ./run.sh .

  RUN chmod a+x run.sh

  CMD ["./run.sh"]
