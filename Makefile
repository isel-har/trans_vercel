
up:
	@docker-compose up --build
#@chmod +x ./init.sh && ./init.sh

down:
	@docker-compose down

status:
	@docker images -a
	@echo
	@docker ps -a

clean:
	@docker rmi -f $$(docker images -q)
	@docker rm -f $$(docker ps -q)

prune:
	@docker system prune -af

re: clean up