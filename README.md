# Ossix-Software-Engineer-Technical-Assessment-Test-server
This repository serves as the Ossix Software Engineer Technical Assessment Test : Backend + Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Client
Build with React (no Redux just React hook)

### `cd client` 
### `yarn` or `npm install`  
Install the dependencies

### `yarn start` or `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Server

Chat server build with Nodejs, WebRTC backend with Postgres Database

the database structure is given in `db_dum.sql`

### `yarn` or `npm install`  
Install the dependencies

### `yarn start` or `npm start`
Start the server by default on [http://localhost:5000](http://localhost:5000)

### `yarn build` 
Build static file for the server

# Deploy

Open project folder in your terminal and type the following:

heroku create
git push heroku master
heroku open
