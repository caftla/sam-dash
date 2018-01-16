module.exports = {
  apps : [
      {
        name: "sigma",
        interpreter: "./node_modules/.bin/babel-node",
        script: "server/index.js",
        watch: true,
        env: {
          "secret": "secret",
        }
      }
  ]
}