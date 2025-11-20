.PHONY: build up down test clean logs

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

test:
	docker-compose run --rm backend mvn test
	docker-compose run --rm frontend npm test

test-backend:
	docker-compose run --rm backend mvn test

test-frontend:
	docker-compose run --rm frontend npm test

logs:
	docker-compose logs -f

logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

clean:
	docker-compose down -v
	docker system prune -f

restart:
	docker-compose restart

stop:
	docker-compose stop

start:
	docker-compose start

