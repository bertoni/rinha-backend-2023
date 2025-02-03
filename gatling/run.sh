#! /usr/bin/env sh

CURRENT_PATH=$(dirname $(readlink -m "$0"))

GATLING_BIN_DIR="$CURRENT_PATH/deps/gatling/bin"

WORKSPACE=$CURRENT_PATH

sh $GATLING_BIN_DIR/gatling.sh -rm local -s RinhaBackendSimulation \
    -rd "DESCRICAO" \
    -rf $WORKSPACE/user-files/results \
    -sf $WORKSPACE/user-files/simulations \
    -rsf $WORKSPACE/user-files/resources \

sleep 3

curl -v "http://${APPHOST}/contagem-pessoas"
