# Cloudforet Developers' Playground Server
This is a server for Cloudforet Developers' Playground.
It uses Flask as a web framework and provides a REST API.

## Setup and Run

### 1. Virtual Environment Setup
Set up a virtual environment using the venv library.
```bash
python3 -m venv venv
```
```bash
source venv/bin/activate
```

### 2. Package Installation
Install the package with the following commands in the created virtual environment.

```bash
pip3 install -r pkg/pip_requirements.txt
```

### 3. Run
Run the server.
```bash
python3 app.py
```