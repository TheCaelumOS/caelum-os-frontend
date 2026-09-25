@echo off
title CaelumOS Local Infrastructure Connector
echo ================================================================
echo Starting CaelumOS Local Infrastructure Connector...
echo Connecting local Docker Desktop and Minikube/Kubernetes to CaelumOS
echo ================================================================
cd /d "%~dp0"
node src/index.js
pause
