#! /bin/bash
mkdir -p doppelkopf_backup
name=$(date +'%d.%m.%Y')5
pg_dump -U postgres -w doppelkopf > doppelkopf_backup/$name 

# only keep the backup if something changed
last=$(ls -t doppelkopf_backup | sed -n 2p)
if cmp -s "doppelkopf_backup/"$name "doppelkopf_backup/"$last; then
	rm doppelkopf_backup/$name
fi
