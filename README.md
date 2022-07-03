# Moved to https://github.com/textmmorpg

# TextMMO
MMO text adventure game using socket.io and mongodb

### Setup

Install javascript dependencies
```
npm install
```

Setup mongodb tables
```
node server/scripts/run_migration.js init up DEV
```

Generate world
```
npm run new_world_dev
```

### Running the server and exposing the client

```
npm run start
```

### Using the client

Navigate to https://localhost:3000

For details on gameplay, view the github wiki: https://github.com/beefy/project_title_here/wiki

### Manual Deployment (also happens automatically on merging to the main branch)

```
docker build -t textmmo .
docker tag textmmo us-central1-docker.pkg.dev/project-title-here/textmmo/textmmo-image
docker push us-central1-docker.pkg.dev/project-title-here/textmmo/textmmo-image
```

### Other references

- Issue Tracking: https://github.com/users/beefy/projects/1/v
- Google Single Sign On: https://console.cloud.google.com/apis/credentials/consent?project=project-title-here
- Build Automation: https://console.cloud.google.com/cloud-build/builds?project=project-title-here
- Compute: https://console.cloud.google.com/run?project=project-title-here
- Artifactory: https://console.cloud.google.com/gcr/images/project-title-here/us/textmmo/textmmo-image?project=project-title-here
- DNS: https://console.cloud.google.com/net-services/dns/zones/textmmo-com/details?project=project-title-here
- Database: https://cloud.mongodb.com/v2/
