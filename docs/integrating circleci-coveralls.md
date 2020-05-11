## Outline
- why am i writing this?
- who is this for/meant to help?
- what's the prereqisite?

## Main
### Introduction
- explain the need for ci/cd and coveralls. 

### Prereqisite

- what we will need first is a completely set up node project. I'm currently running a graphql project of my own. it's a boilerplate project with no actual controller code. the only thing you need is a project with a running server: here's a link to setting up a graphql project (link)
- you need to run tests. code covrage works by calculating the percentage of your source code is covered in tests. you can read more about code covereage [here](https://confluence.atlassian.com/clover/about-code-coverage-71599496.html). For this project we will have a what i call an index tests. a simple check to see that one thing equals another. that's all we need for now.

### CicleCI Steps
- let's start with integrating ci /cd into the project. the first thing we have to do is sign up to circleci. this is made easy by signing up with your github account and authorizing the circleci app. once this is done, you add the repository you're trying to integrate with. once this is added, circleci will tell you to eithe download their config.yml file, or add it automatically to your repository (in a .circleci folder in root). for this walk through, just click on start building. 
- on the initial build, circle ci's integration will fail. this is alright, it fails because we did not add our config.yml file yet. 

- allow for orb in organisation directory. to use the coveralls orb, we need to opt-in to 3rd party orbs on our organization’s Security settings page. Since coveralls is not a circleci partner orb. you can read more about this [here](https://circleci.com/docs/2.0/orb-intro/).


### Coveralls steps
- Okay, we've got our circleci inital setup sorted. it's time to sort out coveralls. head on over to [coveralls](https://coveralls.io/) and signup with your github account. you will be redirected by github to authorize the coveralls web app for your repositories. click authorize. 

At this point, we add the repositiory we want to track the coverage of. once the repo is added, there will be no builds recorded in the repo. that's fine, we've not yet done the heavy lifting. Navigate into the repository page in coveralls and copy the repo token. Save it save somewhere safe. This token will be integral to further integrations.

`git of actions`

That's it. that'll all we need to do to setup the repository in coveralls.

### Local Steps
- in your local code (or directly in github), add the config.yml file below in a circleci folder in your root directory

```bash
version: 2.1
orbs:
  coveralls: coveralls/coveralls@1.0.4
jobs:
  build:
    docker:
      - image: circleci/node:10.16.0
    working_directory: ~/newsletter-api
    environment:
      NODE_ENV: test
      DATABASE_URL: process.env.DATABASE_URL_TEST
    steps:
      - checkout
      - run: npm install
      # - run: npm test
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - ./node_modules
      - run: # run tests
          name: test
          command: npm run test
      - run: # run code coverage report
          name: code-coverage
          command: npm run coverage
      - coveralls/upload
      - store_artifacts: # special step to save test results as as artifact
          # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: test-results
          prefix: tests
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: coverage
          prefix: coverage
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test-results
      - run: # test what branch we're on.
          name: "What branch am I on?"
          command: echo ${CIRCLE_BRANCH}
notify:
  webhooks:
    - url: https://coveralls.io/webhook?repo_token=${process.env.COVERALLS_REPO_TOKEN}
```
- let's break down this code bit by bit so you know what's happening. in every line. it will instruct the entire worflow of your integration.
```bash
version: 2.1
orbs:
  coveralls: coveralls/coveralls@1.0.4
```
- first we start with the version of the circleci infrastructure we want to use. here it's the 2.x infrastructure. the second part is the orbs. circleci orbs are 'shareable packages of configuration elements, including jobs, commands, and executors'. this allows you to use 3rd party apps to enhance your ci workflow. We need to use the coveralls orb, as we want to share covergae data between circleci and coveralls. you can read more about circleci coveralls orb [here](https://circleci.com/orbs/registry/orb/coveralls/coveralls).

```bash
jobs:
  build:
    docker:
      - image: circleci/node:10.16.0
    working_directory: ~/newsletter-api
```
- moving on the integration itself. I am using docker for my project, so i add an image of the node environment needed, as well as the route to the working directory.
```bash
    environment:
      NODE_ENV: test
      DATABASE_URL: process.env.DATABASE_URL_TEST
```
- Here we specify that the current environment we're working on is our testing environment, so circle ci is able to run our test code. We also specify the database the tests are to be run against (The variable values should be placed amongst circleci environment variables (We'll come back to this).
```bash
    steps:
      - checkout
      - run: npm install
      # - run: npm test
      - restore_cache:
          key: dependency-cache-{{ checksum "package.json" }}
      - run:
          name: install-npm-wee
          command: npm install
      - save_cache:
          key: dependency-cache-{{ checksum "package.json" }}
          paths:
            - ./node_modules
```
- This section tells the circleci job to either restore the cached package.json dependencies/dev dependendies it currently has for this particular project from previous builds, or install the modules again and save the node_module into its current cache.

```bash
      - run: # run tests
          name: test
          command: npm run test
      - run: # run code coverage report
          name: code-coverage
          command: npm run coverage
      - coveralls/upload
      - store_artifacts: # special step to save test results as as artifact
          # Upload test summary for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: test-results
          prefix: tests
      - store_artifacts: # for display in Artifacts: https://circleci.com/docs/2.0/artifacts/
          path: coverage
          prefix: coverage
      - store_test_results: # for display in Test Summary: https://circleci.com/docs/2.0/collect-test-data/
          path: test-results
```
This is the meat of the circleci processs. in this section, we tell the job to run the tests we've written for our project. the test files are normally places in  a `/test` folder. when all the test are done, and successful, we tell the job to run our code coverage to get the percentage of source code covered by our tests done above. After performing the code coverage, the job stores our coverage in the circle ci artifacts. We can also store test results so that the test results can be visible via the circleci web application (normally under the test summary section).
```bash
      - run: # test what branch we're on.
          name: "What branch am I on?"
          command: echo ${CIRCLE_BRANCH}
```
- i like to run this so i can view through the circle ci application what exact branch is being tested at any given time (check if this is correct).

```bash
notify:
  webhooks:
    - url: https://coveralls.io/webhook?repo_token=${process.env.COVERALLS_REPO_TOKEN}
```
- Now this beautiful final section of the code is where we add the coverall webhook to the circle ci build. This webhook is called at the end of the build so that coveralls is notified upon success of the build, and uses the test coverage data we ran and stored ealier to show the percentage coverage. To be certain of which repository this coverage is for in the coveralls web app, we need to pass that particular repo token to the url (remember the token we saved from coveralls?). add the `COVERALLS_REPO_TOKEN` as an environment variable in the circleci projecct config, with the repo token as its value.

- now you know what the circleci config file is doing, let's add a mock test to our database. create a `/test` folder in your `/src` folder, and add an `index.js` file. this is where we will place our simple test. Copy and paste the code below.

```javascript
import chai from 'chai';

const { expect } = chai;

describe('Initial test', () => {
  it('should be equal to generic thing', () => {
    expect('this thing').to.equal('this thing');
  });
});

```
- As you can see, we've written a mock test that simple checks if the first string is equal to the second string. now we need to install a few usefull npm packages and edit our scripts. run this in your terminal

```bash
npm i --save-dev nyc mocha-lcov-reporter mocha chai coveralls
```

- After installation, add the test scripts to your package.json
```json
{
  "scripts": {
    "test": "cross-env NODE_ENV=test nyc --reporter=lcov --reporter=text --reporter=html mocha src/test/*.js --timeout 10000 -c",
  },
  "coverage": "nyc report --reporter=text-lcov | coveralls",
}
```
- These test script allows the application to run the specified tests in the `/test` folder, as well as save the test coverage report. This coverage report can alsobe viewed from the circleci web application, as we've specified in the job config script. The `coverage` command will be ran in circleci to generate the coverage files needed for coveralls to run. once we're good here, we can run our local test, just to see that it works. 

`image of passing test`

once we're certain, we can push our repo to github. if we raised a pull request on our branch with our commit, we should see the circleci pull request check mark showing a successfult build. if everythin goes right, we should also see the coveralls check mark on the pull request.

`image of pr check marks`

Back in our circleci web environment, we see our build status as a success, and we should be ready to go. We can head on over to our coveralls page to also confirm that the build covergae has also been recorded. That't it. we've successfully integrated circleci alongside coveralls.

### Bagdes.
- badges help developers know the status of your repository. it let's them know if your development branch is passing its tests, and the current code coverage on that branch. badges are placed in the README.md file of your repository. 

`image of badges`

to get a circleci badge, you need to navigate to your project in circle ci and enter into the project settings. under api permissions, click on add api token, with its scope as status. you can label it anything you like or keep empty. save that token and add it to the badge path below

```bash
[![CircleCI](https://circleci.com/gh/YOUR-GITHUB>/<YOUR-REPO>/tree/<YOUR-HEAD-BRANCH>.svg?style=svg&circle-token=<YOUR-TOKEN>)](https://circleci.com/gh/YOUR-GITHUB>/<YOUR-REPO>/tree/<YOUR-HEAD-BRANCH>)
```
add the generated token to the path above, which will point to your circle ci status on each build.

for coveralls, there is no token required in the badge themselves. Navigate to your repository on coveralls, copy the badge for your headbranch and
add it to your README. the badges usually come in this format.

```bash
[![Coverage Status](https://coveralls.io/repos/github/<YOUR-GITHUB>/<YOUR-REPO>/badge.svg?branch=<YOUR-HEAD-BRANCH>)](https://coveralls.io/github/<YOUR-GITHUB>/<YOUR-REPO>?branch=<YOUR-HEADBRANCH>)
```

Happy coding.



