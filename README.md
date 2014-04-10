angularfrmtst
==============

testing angular form stuff

---

working redactor markdown editor (some bugs) - see public/frms/app/scrips/directives/redactor

Requires
  * Node / NPM
  * Yeoman

Install:
  * Clone the repo
  * Install the server
  * ```npm install```
  * ```run npm install for any projects in public/```

Build:
  * ```./build.sh``` in ./

Run:
  * ```node app``` in ./

View:
	```http://localhost:8080```

##CLI Arguments

**--env (-e)**
  config file to load.
  ```
    node app --env=prod //run with the config from ./app/config/prod.js
  ```

