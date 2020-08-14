#!/bin/bash

[ -z $PHANTOMJS ] && PHANTOMJS=./phantomjs

echo 'Testing '$1

$PHANTOMJS src/js/tests/phantom.js $1 | tee ${TMPDIR}/phantomjs.log

# Figure out the exit code ourselves because Gecko does not allow
# SlimerJS to do so for now.
[ -z "`grep '0 failed.' ${TMPDIR}/phantomjs.log`" ] && ERROR=1
rm ${TMPDIR}/phantomjs.log
exit $ERROR