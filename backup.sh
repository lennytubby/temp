#! /bin/bash
#mkdir -p doppelkopf_backup
base_path=~/projects/doppelkopf/doppelkopf_backup/
name=$(date +'%d.%m.%Y')
pg_dump -U postgres -w doppelkopf > $base_path$name 

# only keep the backup if something changed
last=$(ls -t $base_path | sed -n 2p)
last_path=${base_path}${last}
new_path=${base_path}${name}
if cmp -s $new_path $last_path; then
	rm $new_path
fi
