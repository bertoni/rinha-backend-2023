install-gatling:
	./gatling/install.sh

run-gatling:
	./gatling/run.sh

stack-up:
	docker compose -f $(args)/docker-compose.yml up

stack-down:
	docker compose -f $(args)/docker-compose.yml down
