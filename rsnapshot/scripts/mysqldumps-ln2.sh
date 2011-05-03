#!/bin/sh

# to be invoked by rsnapshot

REMOTE=ln2.m.cbxt.net
PATH=/var/mysqldumps

SSH_BIN=/usr/bin/ssh
RSYNC_BIN="/usr/bin/rsync -az -e $SSH_BIN"
MKDIR_BIN="/bin/mkdir -p"

$SSH_BIN $REMOTE "mysqldump wp_fogel > $PATH/wp_fogel.sql"
$SSH_BIN $REMOTE "mysqldump gsf_live > $PATH/gsf_live.sql"
$MKDIR_BIN .$PATH
$RSYNC_BIN $REMOTE:$PATH/ .$PATH
