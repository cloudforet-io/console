# Develop with local turborepo cache server

If you want to develop with your colleagues, you can use the turbo cache server.
It will help you to share the cache data with your colleagues.
It will run on your local machine, but the artifacts will be stored in your **github repository**.
You can change it to use other storages such as AWS S3, Google Cloud Storage, etc.
But this guide will explain how to use github repository to store the cache data.

## Prerequisites

### 1. Prepare a repository to store the cache data
We have a [console-artifacts](https://github.com/cloudforet-io/console-artifacts.git) repository to store the cache data.
You can fork and use it, or you can create your own repository.

### 2. Issue a github token
You need to issue a github token to access the repository.
Follow the [official guide](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) to issue a token.

## Set up the server

### 1. Install docker
Follow the [official docker installation guide](https://docs.docker.com/engine/install/)

### 2. Pull docker image
```bash
docker pull wanzargen/turbo-cache-server:1.0.0
```
The source code of this image is [here](https://github.com/WANZARGEN/turborepo-remote-cache.git) which is forked from [turborepo-remote-cache](https://github.com/ducktors/turborepo-remote-cache.git).

### 3. Add environment variables
Copy the `dev/turbo-cache-server.sample.env` file to `dev/turbo-cache-server.env` and edit the variables.

`TURBO_TOKEN` is required. It must be the same as the `token` argument that you will pass to the `turbo` command.

### 4. Run the server
```bash
docker run -d -p 3000:3000 --name turbo-cache-server --rm --env-file=./dev/turbo-cache-server.env wanzargen/turbo-cache-server:1.0.0
```

## Set up the client

### 1. Set turbo environment variable

```bash
export TURBO_TEAM=your_team_name
export TURBO_API=http://localhost:<the_port_number_you_set_in_step_4>
export TURBO_TOKEN=your_token_you_set_in_step_3
```
This command is not permanent. You need to run this command every time you open a new terminal. <br/>
If you want to set it permanently, add the above command to your `.bashrc` or `.zshrc` file like below.
```bash
echo "export TURBO_TEAM=your_team_name" >> ~/.zshrc
echo "export TURBO_API=http://localhost:<the_port_number_you_set_in_step_4>" >> ~/.zshrc
echo "export TURBO_TOKEN=your_token_you_set_in_step_3" >> ~/.zshrc
```


