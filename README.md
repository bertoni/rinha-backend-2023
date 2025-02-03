# rinha-backend-2023


### Install Gatling
```
make install-gatling
```

### Up implementation
When args should be a relative directory 
```
make stack-up args=nodejs/prisma
```

### Down implementation
When args should be a relative directory 
```
make stack-down args=nodejs/prisma
```

### Run Test
```
make run-gatling
```


## HTTP Enables

POST http://localhost:9999/pessoas
Content-Type: application/json

{"apelido":"foo1","nome":"baa","nascimento":"2000-01-01","stack":["C","C#","Java","Node","PHP","Ruby"]}

GET http://localhost:9999/pessoas/75597694-4648-4d03-b179-77d192548b06


GET http://localhost:9999/pessoas?t=PHP

GET http://localhost:9999/contagem-pessoas


# Check Poll Consumption
```
docker exec -it kotlin-db-1 psql -d pgdb -U pguser -c 'SELECT COUNT(1) FROM pg_stat_activity;'
```
