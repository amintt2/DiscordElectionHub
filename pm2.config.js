module.exports = {
  apps: [
    {
      name: "discord-election-hub",
      script: "dist/server/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        HOST: "0.0.0.0"
      },
      instances: 1,
      exec_mode: "fork",
      watch: false
    }
  ]
};