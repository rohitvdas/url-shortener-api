# url-shortener-api
URL shortener API using Node.js with Express framework and SQLite

# Setup and run:
Install Node.js and cURL (if haven't already). In terminal, from directory in which you have cloned repo, execute:
```
npm install
npm start
```

# Testing:
Submit URL for shortening (replace yourURLhere with URL you would like to shorten):
```
curl -d '{"URL":"/yourURLhere"}' -H "Content-Type: application/json" -X POST http://localhost:5667/
```

Configure shortened URL (replace shortURLhere with shortened URL you would like to configure, targetURLhere with desired target URL, and deviceHere with device associated with this target URL-options are 'mobile','tablet', or 'desktop'):
```
curl -d '{"shortURL":"/shortURLhere","target":"/targetURLhere","device":"deviceHere"}' -H "Content-Type: application/json" -X POST http://localhost:5667/configure
```

Navigate to shortened URL (replace shortURLhere with shortened URL you would like to navigate to):
```
curl -X GET http://localhost:5667/shortURLhere
```
Optional-specify User-Agent header to define user device by replacing headerHere with one of the examples [here](https://deviceatlas.com/blog/list-of-user-agent-strings):
```
curl -H "User-Agent: headerHere" -X GET http://localhost:5667/shortURLhere
```

Retrieve list of all shortened URLs:
```
curl -X GET http://localhost:5667/list
```
  
