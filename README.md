# bettor app

A very simple Api for the bettor-app.

The app has two states, one is stateless, which resides on the stateless-auth branch, and the other is statefull, which resides on the statefull-auth branch. Eventually the app is not configurable as multistate app. If you prefer stateless authentication checkout to stateless-auth branch, and if you prefer statefull authentication checkout to statefull-auth branch.

The app uses online service mlab.com where the database resides. Feel free to choose any other option for managing mongoDB database system.

On the root folder application please find the .env.examplpe file, and assign accordingly. After that rename the file to .env to run the development version of the app.

For example to run the mail service, create or use your Sendgrid account and use the credentials.

Find the appropriate commands beneath for running and inspecting the app.

## Start the app

```
npm install

nodemon

```
