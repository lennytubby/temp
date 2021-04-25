#! /bin/bash
mkdir -p doppelkopf_backup
name=$(date +'%d.%m.%Y')
pg_dump -U postgres -w doppelkopf > doppelkopf_backup/$name 
