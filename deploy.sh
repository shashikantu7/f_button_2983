#!/bin/bash
if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  cd dist
  git add . -A
  git commit -m "`cd ..;git log -1 --pretty=%B | head -n 1 | sed "s|Done |Fixes |";cd dist;`"
  git push origin master
fi
