#! /bin/bash

kill $(lsof -i :8880 -t)
